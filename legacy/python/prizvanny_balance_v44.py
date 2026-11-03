import math
names=[['Пепельный рекрут','Костяной слуга','Лесной охотник','Болотный вор','Послушник света'],['Лейн','Песчаный скиталец','Мрачный послушник','Страж руин','Охотница на духов'],['Ворон Теней','Ледяная ведьма','Зверолов','Хранитель рощи','Солнечный копейщик'],['Стальной Щит','Огненный инквизитор','Ядовитый клык','Некромант пепла','Грозовой стрелок'],['Ариэль','Белый паладин','Королева шипов','Повелитель цепей','Лунная охотница'],['Сион','Кровавый жнец','Древний друид','Громовержец','Владыка костей'],['Король Пустоты','Архангел Рассвета','Первозданный зверь','Императрица льда','Безликий убийца'],['Падший Создатель','Астральная Валькирия','Сердце Мирового Древа','Вечный Судья','Пожиратель Судеб']]
basecost=[25,800,25000,800000,25000000,800000000,25000000000,800000000000]
basedps=[1,20,350,6000,100000,2000000,40000000,700000000]
heroes=[]
for r, group in enumerate(names):
 for j,n in enumerate(group):
  heroes.append(dict(name=n,rank='EDCBAS' [r] if r<6 else ('SS' if r==6 else 'БОГ'),cost=round(basecost[r]* (2.4**j)),dps=round(basedps[r]*(2.2**j),2), unlock= max(1, (r*48+j*7)) if r<6 else 999, lvl=0, hired=False))
# explicit cap only E-S unlocked first run; S after 240
# simulate 10 mobs per floor, 10sec ticks, farm on current floor; income per second 10 mobs / kills; offline 30% with 70% gold and no taps
# equal level: buy affordable level for minimum current level among hired, buy new if can afford and unlocked
# allow farming at current floor, boss one kill every 10; goal stage time 12-18 hours with farm penalty

def simulate(mult=1, goldbase=42, hpbase=320, hpgrowth=1.055, goldgrowth=1.052, max_seconds=200000, bossmult=3, record=False):
 hs=[dict(h,lvl=0,hired=False) for h in heroes]
 floor=1; gold=0.; earned=0.; spent=0.; sec=0; kills=0; totallevels=0; logs=[]; boss_remaining=0; hp_remaining=0; boss=False
 # model per floor: 10 regular mobs + boss on multiples 10, 1 stage with boss at multiples 50; no automatic forward until 10 kills
 mobs_left=10
 while sec<max_seconds and floor<=400:
  unlocked=[h for h in hs if h['unlock']<=floor]
  # hire cheap affordable, level cheapest current-level character
  for _ in range(100):
   un=[h for h in unlocked if not h['hired'] and h['cost']<=gold]
   if un:
    h=min(un,key=lambda h:h['cost']);gold-=h['cost'];spent+=h['cost'];h['hired']=True;continue
   eligible=[h for h in unlocked if h['hired']]
   if not eligible:break
   h=min(eligible,key=lambda h:(h['lvl'],h['cost']))
   price=h['cost']*0.07*(1.07**h['lvl']) # incremental level cost is 7% of hire price, rather than full hire cost
   if price<=gold:
    gold-=price;spent+=price;h['lvl']+=1;totallevels+=1
   else:break
  dps=sum(h['dps']*(1.075**h['lvl']) for h in hs if h['hired'])*mult
  if dps<=0: dps=1
  # 10 seconds tick and 20% active dmg bonus averaged (offline segments 30%)
  effdps=dps*1.14
  hp=hpbase*(hpgrowth**(floor-1))
  goldmob=goldbase*(goldgrowth**(floor-1))
  # mobs, kill speed: min 1.2sec per mob animation; 10 mobs + boss; farm stage if unable to kill boss quickly
  dt=10
  dmg=effdps*dt
  while dmg>0 and floor<=400:
   if hp_remaining<=0:
    boss=mobs_left==0
    hp_remaining=hp*( (bossmult if floor==400 else (15 if floor%50==0 else 4)) if boss else 1)
   if dmg<hp_remaining:
    hp_remaining-=dmg;break
   dmg-=hp_remaining;hp_remaining=0
   reward=goldmob*( (30 if floor==400 else (15 if floor%50==0 else 4)) if boss else 1)
   reward*=0.91;gold+=reward;earned+=reward;kills+=1
   if boss or (mobs_left==1 and floor%10!=0):
    if floor%50==0: logs.append((floor,round(sec/3600,3),round(dps),round(earned),round(gold),totallevels,sum(h['hired'] for h in hs)))
    floor+=1;mobs_left=10
    if floor>400:break
    hp=hpbase*(hpgrowth**(floor-1));goldmob=goldbase*(goldgrowth**(floor-1))
   elif mobs_left==1:
    mobs_left=0
   else:mobs_left-=1
   # no more than 1 kill per 0.7 sec equivalent
   if dmg<=0:break
  sec+=dt
 return dict(hours=sec/3600, floor=floor, dps=dps, earned=earned, gold=gold, levels=totallevels, hired=sum(h['hired'] for h in hs),logs=logs)
if __name__=='__main__':
 for m in [1,2,4]:
  a=simulate(mult=m,max_seconds=100000)
  print('mult',m,{k:v for k,v in a.items() if k!='logs'},a['logs'])
