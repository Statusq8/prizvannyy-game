import math, json
HEROES=[('Пепельный рекрут',25,2,1),('Костяной слуга',60,4,1),('Лесной охотник',120,7,1),('Болотный вор',220,10,1),('Послушник света',400,14,1),('Лейн',800,24,40),('Песчаный скиталец',1600,40,40),('Мрачный послушник',3000,65,40),('Страж руин',6000,105,40),('Охотница на духов',12000,170,40),('Ворон Теней',25000,350,100),('Ледяная ведьма',50000,600,100),('Зверолов',100000,1000,100),('Хранитель рощи',200000,1700,100),('Солнечный копейщик',400000,2800,100),('Стальной Щит',800000,5000,170),('Огненный инквизитор',1800000,9000,170),('Ядовитый клык',3500000,16000,170),('Некромант пепла',7000000,28000,170),('Грозовой стрелок',12000000,48000,170),('Ариэль',25000000,90000,250),('Белый паладин',60000000,170000,250),('Королева шипов',120000000,300000,250),('Повелитель цепей',250000000,550000,250),('Лунная охотница',400000000,950000,250),('Сион',800000000,1800000,350),('Кровавый жнец',2000000000,4000000,350),('Древний друид',4000000000,8000000,350),('Громовержец',8000000000,15000000,350),('Владыка костей',12000000000,28000000,350)]
# Model assumptions: 5 kills/floor, boss every 10 floors on fifth kill, 3x HP, 5x gold; 1.5 sec spawn/transition per kill; upgrades purchased between kills. Farming stays at last cleared floor when target is too slow (>20 sec). Simplified passive profile for E-C; rest zero except shared lvl100 bonus approximate.
PASS=[(.5,1,1,1.5,2),(.5,1,1.5,1,2),(.5,1,1,1.5,2),(.5,1,1,1.5,2),(.5,1,1,1.5,2)]
def dps_at(i,level):
    if level<1:return 0.
    p=1.
    if i<5:
        for threshold,bonus in zip((10,25,50,75,150),PASS[i]):
            if level>=threshold:p*=1+bonus
    else:
        for threshold,bonus in zip((10,25,50,75,150),(.5,1,1,1.5,2)):
            if level>=threshold:p*=1+bonus
    mastery=1.25**max(0,(level-200)//25)
    if level>=1000:mastery*=10
    return HEROES[i][2]*1.05**(level-1)*p*mastery

def sim(price_growth=.06, hp_base=320, hp_growth=.055, gold_base=42,gold_growth=.052, spawn=1.5, mobs=5, max_kill=20, limit_hours=150, relic=1):
    lv=[0]*len(HEROES);gold=0.;elapsed=0.;floor=1;kills=0;farmed=0;milestones={};stuck=False
    # buy best marginal DPS per gold among affordable, with lookahead to milestone thresholds
    def buy():
        nonlocal gold
        for _ in range(150):
            best=None;score=-1
            for i,(name,hire,base,unlock) in enumerate(HEROES):
                if floor<unlock:continue
                l=lv[i]
                # level batch until next milestone, or 1, 10 levels
                options=[1,10,25]
                for th in (10,25,50,75,100,150,200,225,250,275,300,325,350,375,400,425,450,475,500,525,550,575,600,650,700,750,800,900,1000):
                    if th>l:options.append(th-l);break
                for n in set(options):
                    if l==0:
                        cost=hire + sum(math.ceil(.07*hire*(1+price_growth)**k) for k in range(1,n))
                    else:
                        cost=sum(math.ceil(.07*hire*(1+price_growth)**k) for k in range(l,l+n))
                    if cost>gold:continue
                    gain=dps_at(i,l+n)-dps_at(i,l)
                    # proxy army buffs: cheap 100-level support
                    if l<100<=l+n:gain+=sum(dps_at(j,lv[j]) for j in range(len(lv)))*.01
                    ratio=gain/cost
                    if ratio>score:score=ratio;best=(i,n,cost)
            if best is None:break
            i,n,c=best;gold-=c;lv[i]+=n
    # advance by killing, farm previous floor if blocked; buy when gold is available
    while floor<=400 and elapsed<limit_hours*3600 and kills<500000:
        buy()
        power=(1+sum(dps_at(i,lv[i]) for i in range(len(lv))))*relic
        # approximate sum of army buffs at lvl100
        army=1+sum(([.005,0,0,0,.01,.01,0,0,0,0,0,.02,0,0,0]+[0]*15)[i] for i in range(len(lv)) if lv[i]>=100)
        power*=army
        enemy_hp=hp_base*(1+hp_growth)**(floor-1)
        boss=floor%10==0
        hp=enemy_hp*(3 if boss else 1)
        time=hp/power
        if time>max_kill and floor>1:
            # farm previous floor's normal enemy, time to kill may be high; don't progress
            farmfloor=floor-1
            farmhp=hp_base*(1+hp_growth)**(farmfloor-1)
            farmgold=gold_base*(1+gold_growth)**(farmfloor-1)
            elapsed+=farmhp/power+spawn;gold+=farmgold;farmed+=1;kills+=1
        else:
            for k in range(mobs):
                b=boss and k==mobs-1
                elapsed+=enemy_hp*(3 if b else 1)/power+spawn
                gold+=gold_base*(1+gold_growth)**(floor-1)*(5 if b else 1)
                kills+=1
            if floor in (50,100,150,200,250,300,350,400):
                milestones[floor]={'hours':round(elapsed/3600,2),'gold':round(gold),'dps':round(power),'hired':sum(x>0 for x in lv),'levels':sum(lv),'farmed':farmed}
            floor+=1
    return {'reached_floor':floor-1,'hours':round(elapsed/3600,3),'farmed_kills':farmed,'total_kills':kills,'milestones':milestones,'levels':{HEROES[i][0]:l for i,l in enumerate(lv) if l},'remaining_gold':round(gold)}
if __name__=='__main__':
    for growth in (.06,.07):
        res=sim(price_growth=growth,limit_hours=30)
        print('price growth',growth, json.dumps({k:v for k,v in res.items() if k!='levels'},ensure_ascii=False))
