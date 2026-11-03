"""Optimized exploratory tower simulator. Uses the actual 40-hero catalog and game_core.
Usage: python sim_v04.py --floor 400 --hours 24
The model is deliberately incomplete: no shards, portal, gear or automated rebirth.
"""
import argparse, json, math, time
from functools import lru_cache
from pathlib import Path
from game_core import HEROES, personal_dps, army_dps, reward_multiplier, can_obtain

IDS=tuple(HEROES)
N=len(IDS)
PRICES=tuple(HEROES[k]['base_hire_gold'] for k in IDS)
RARITIES=tuple(HEROES[k]['rarity'] for k in IDS)
GROWTH=.079
@lru_cache(maxsize=500000)
def upgrade_cost(i,level,n):
    a=.07*PRICES[i]
    return sum(max(1,math.ceil(a*(1+GROWTH)**k)) for k in range(level,level+n))
@lru_cache(maxsize=200000)
def hero_power(i,lv):
    return personal_dps(IDS[i],lv) if lv else 0.
@lru_cache(maxsize=100000)
def evaluate(levels):
    owned={IDS[i]:lv for i,lv in enumerate(levels) if lv}
    return army_dps(owned),army_dps(owned,'boss'),reward_multiplier(owned)

def shop(levels,cash,record,max_actions=1):
    levels=list(levels)
    for _ in range(max_actions):
        baseline=evaluate(tuple(levels))[0]
        best_score=0; best=None
        for i in range(N):
            if RARITIES[i]=='SS' and record<1000 or RARITIES[i]=='БОГ' and record<4000:continue
            old=levels[i]
            opts=((1,PRICES[i]),) if old==0 else tuple((n,upgrade_cost(i,old,n)) for n in (1,10,25))
            for n,price in opts:
                if price>cash:continue
                levels[i]=old+n
                candidate=evaluate(tuple(levels))[0]
                levels[i]=old
                score=(candidate-baseline)/price
                if score>best_score:
                    best_score=score;best=(i,n,price)
        if best is None:break
        i,n,price=best;levels[i]+=n;cash-=price
    return tuple(levels),cash

def run(power=1.,max_floor=400,limit_hours=24,prior_record=0,max_farm=10000):
    levels=(0,)*N;cash=0.;seconds=0.;farm=0;record=prior_record; checkpoints={};status='completed'
    for f in range(1,max_floor+1):
        if seconds>limit_hours*3600:status='time_limit';break
        hp=320*1.055**(f-1) if f<=400 else 320*1.055**399*1.05**(f-400)
        gold=42*1.052**(f-1) if f<=400 else 42*1.052**399*1.054**(f-400)
        if f>300:gold*=1+min(f-300,100)/50 # experimental v5.2 boost
        for mob in range(5):
            boss=f%10==0 and mob==4
            health=hp*(3 if boss else 1)
            dps,boss_dps,rew=evaluate(levels)
            effective=max(1.,(boss_dps if boss else dps)*power+1)
            while health/effective>20 and f>1:
                if farm>=max_farm:status='farm_limit';break
                prev=f-1
                prev_hp=320*1.055**(prev-1) if prev<=400 else 320*1.055**399*1.05**(prev-400)
                prev_gold=42*1.052**(prev-1) if prev<=400 else 42*1.052**399*1.054**(prev-400)
                if prev>300:prev_gold*=1+min(prev-300,100)/50
                dps,_,rew=evaluate(levels)
                seconds+=prev_hp/max(1.,dps*power+1)+1.5
                cash+=prev_gold*rew
                farm+=1
                levels,cash=shop(levels,cash,record)
                dps,boss_dps,rew=evaluate(levels)
                effective=max(1.,(boss_dps if boss else dps)*power+1)
                if seconds>limit_hours*3600:status='time_limit';break
            if status!='completed':break
            seconds+=health/effective+1.5
            cash+=gold*(5 if boss else 1)*rew
            record=max(record,f)
            levels,cash=shop(levels,cash,record)
        if status!='completed':break
        if f in (50,100,150,200,250,300,350,400,500,600,800,1000):checkpoints[str(f)]=round(seconds/3600,3)
    return {'status':status,'floor':f if status=='completed' else max(1,f-1),'hours':round(seconds/3600,3),'farm':farm,'hired':sum(x>0 for x in levels),'total_levels':sum(levels),'record':record,'checkpoints':checkpoints}

def main():
    p=argparse.ArgumentParser();p.add_argument('--floor',type=int,default=400);p.add_argument('--hours',type=float,default=24);p.add_argument('--farm',type=int,default=10000);args=p.parse_args()
    result={'model':'v0.4 experimental','limitations':['No portal, equipment, stars, shards, offline progress or rebirth economy','Level purchase strategy greedy; results are not final game balance','D–БОГ passives are draft personal DPS multipliers'],'runs':{}}
    for name,power in [('first',1.),('second',1.875),('third',2.34375)]:
        t=time.monotonic();r=run(power,args.floor,args.hours,max_farm=args.farm);r['wall_seconds']=round(time.monotonic()-t,2)
        result['runs'][name]=r;print(name,r,flush=True)
    out=Path(__file__).with_name('sim_v04_results.json');out.write_text(json.dumps(result,ensure_ascii=False,indent=2));print('Saved',out)
if __name__=='__main__':main()
