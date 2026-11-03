import numpy as np
from math import ceil
# 40 heroes, 5 each rank, costs geometric across each rarity
ranks=['E','D','C','B','A','S','SS','БОГ']
base_cost=np.array([25,800,25000,800000,25000000,800000000,25000000000,800000000000],float)
base_dps=np.array([1,20,350,6000,100000,2000000,40000000,700000000],float)
# 5 heroes each, price spread x1..16, dps corresponding
costs=np.array([base_cost[j]*2**i for j in range(8) for i in range(5)])
dps0=np.array([base_dps[j]*2**i for j in range(8) for i in range(5)])
# staged unlock, roughly 28 by floor400; higher rarity gate
unlocks=np.array([1,10,20,35,50, 55,65,75,85,100, 105,120,135,150,165, 170,185,200,215,230, 235,250,270,290,310, 320,340,360,380,400, 999]*1)[:40] if False else np.array([1,10,20,35,50,55,65,75,85,100,105,120,135,150,165,170,185,200,215,230,235,250,270,290,310,320,340,360,380,400]+[999]*10)
# 30 accessible; 25 first 5 ranks and 5 S; SS never first run. prices high but unlocks independent

def sim(gold_mult=1, dmg_mult=1, hp_growth=1.055, gold_growth=1.052, level_dps=1.075, level_cost=1.07, tick=10, maxhours=80, offline_frac=.3, boss_mult=15, verbose=False):
    gold=0.; total_gold=0.; levels=np.zeros(40,dtype=int); hired=np.zeros(40,dtype=bool)
    floor=1; elapsed=0.; kills=0; boss_kills=0; ghost=0; records=[]; times={}; pending_hp=0.; gold_earned=0.; maxgold=0.; stalls=0
    # each floor 10 enemies, boss floor divisible 10. Boss x4 for mini; x15 for 50, x30 at400.
    # hero base DPS multiplier tune + passive hero and main; offline DPS 100%, active DPS 1.2
    def cur_dps():
        return (10+np.sum(dps0[hired]*(level_dps**levels[hired])))*dmg_mult
    for it in range(int(maxhours*3600/tick)):
        if floor>400: break
        is_offline=((elapsed//3600)%10)<offline_frac*10 # 3h offline, 7h online each 10h
        factor=.7 if is_offline else 1.
        # current enemy HP, 10 kills each floor, 10th boss (1 per floor)
        if pending_hp<=0:
            mult=(3 if floor==400 else boss_mult if floor%50==0 else 4 if floor%10==0 else 1) if kills%10==9 else 1
            pending_hp=100*hp_growth**(floor-1)*mult
        # gain from current floor farming by kill time (can kill more than 1 per tick); gold per kill; 10 kills per floor
        damage=cur_dps()*(1 if is_offline else 1.2)*tick
        loops=0
        while damage>=pending_hp and loops<1000 and floor<=400:
            damage-=pending_hp
            mult=(3 if floor==400 else boss_mult if floor%50==0 else 4 if floor%10==0 else 1) if kills%10==9 else 1
            gain=10*gold_growth**(floor-1)*gold_mult*mult*factor
            gold+=gain;total_gold+=gain;maxgold=max(maxgold,gold)
            kills+=1; loops+=1
            if floor%10==0 and kills%10==0:boss_kills+=1
            if floor>=100 and kills%230==0:ghost+=1
            if kills%10==0:
                times[floor]=elapsed+tick
                floor+=1
                if floor in [50,100,150,200,250,300,350,400,401]:
                    records.append((floor,elapsed/3600,cur_dps(),gold,levels.sum(),int(hired.sum()),total_gold))
            if floor>400: break
            mult=(3 if floor==400 else boss_mult if floor%50==0 else 4 if floor%10==0 else 1) if kills%10==9 else 1
            pending_hp=100*hp_growth**(floor-1)*mult
        if floor>400:break
        pending_hp-=damage
        # round robin upgrade: spend on least level hero that is available and affordable, prioritizing hiring, but no hoarding for future
        available=np.where(unlocks<=floor)[0]
        # one buy per tick or many; choose minimum level eligible with cost affordable; high rank can be skipped
        for _ in range(80):
            affordable=[]
            for idx in available:
                if not hired[idx]:
                    price=costs[idx]
                else:
                    price=costs[idx]*level_cost**levels[idx]
                if price<=gold: affordable.append((levels[idx],idx,price))
            if not affordable:break
            # balanced leveling: least levels, tie cheaper; cost constraints
            _,idx,price=min(affordable,key=lambda x:(x[0],x[2]))
            gold-=price
            if not hired[idx]: hired[idx]=True
            else:levels[idx]+=1
        elapsed+=tick
    return dict(hours=elapsed/3600,floor=floor,records=records,levels=int(levels.sum()),hired=int(hired.sum()),dps=cur_dps(),gold=gold,earned=total_gold,ghost=ghost,boss=boss_kills,level_by_rank=[int(levels[i*5:(i+1)*5].sum()) for i in range(8)],unlocked=int(np.sum(unlocks<=min(floor,400))))

if __name__=='__main__':
 for dm in [1,1e2,1e4,1e6,1e8]:
  x=sim(gold_mult=dm,maxhours=30)
  print(dm,x['floor'],round(x['hours'],2),x['levels'],x['dps'],x['earned'])
