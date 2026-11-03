"""Experimental sequential rebirth simulation. Inherits simplified combat from v5.7.
Run: python tower_balance_v58.py. Rewards and purchasing are design assumptions.
"""
import json
from tower_balance_v57 import sim
from tower_balance_v55 import RELICS, modifiers

# One-time first-record awards, paid only on rebirth; repeatable base requires floor 400.
def reward(old_record, reached):
    if reached < 400: return 0
    base=35
    first=20 if old_record<400<=reached else 0
    new_milestones=sum(5 if f<=400 else 10 for f in range(100,min(reached,1000)+1,50)
                       if f>old_record and (f>400 or f%100==0))
    return base+first+new_milestones

# All relics have first-level effects here. Prioritization is deliberately deterministic.
# Do not confuse this with an optimized player strategy.
PRIORITY=['heart','seal','gold','spark','knowledge','boss']
def purchase(wallet,owned):
    acquired=[]
    for key in PRIORITY:
        if key not in owned and wallet>=RELICS[key]['cost']:
            wallet-=RELICS[key]['cost'];owned.add(key);acquired.append(key)
    return wallet,acquired

def run(cycles=7, run_hours=12):
    wallet=0;record=0;owned=set();out=[]
    for n in range(1,cycles+1):
        wallet,bought=purchase(wallet,owned)
        r=sim(**modifiers(sorted(owned)),floor_cap=1000,limit_hours=run_hours)
        reached=r['reached_floor'];earned=reward(record,reached)
        out.append({'run':n,'purchased_before':bought,'relics':sorted(owned),'starting_record':record,
                    'reached_floor':reached,'hours':r['hours'],'earned_shards':earned,
                    'wallet_after_rebirth':wallet+earned,
                    'milestones':{str(k):v['hours'] for k,v in r['milestones'].items() if int(k) in (400,500,600,700,800,900,1000)}})
        wallet+=earned;record=max(record,reached)
        if reached>=1000:break
    return {'version':'5.8','assumptions':{'hours_cap_each_run':run_hours,'first_record_rewards':'20 for first 400 plus 5 per first 100 through 400; 10 per first 50 above 400','repeatable_base_shards':35,'relic_levels':'first only, deterministic purchase priority','gear_stars_offline':'not simulated','combat':'inherits simplified v5.7 model'},'cycles':out,'final_record':record,'wallet':wallet}
if __name__=='__main__':
    res=run()
    with open('/mnt/data/tower_balance_v58_results.json','w') as f:json.dump(res,f,ensure_ascii=False,indent=2)
    print(json.dumps([{k:v for k,v in x.items() if k!='milestones'} for x in res['cycles']],ensure_ascii=False,indent=2))

# v5.8b extension: unlimited levels, exponential cost; explicit power stacking.
def multilevel_modifiers(levels):
    p={'relic':1.,'gold_multiplier':1.,'level_discount':0.,'boss_multiplier':1.}
    for key,level in levels.items():
        r=RELICS[key]
        p['relic']*=r.get('dps',1)**level
        p['gold_multiplier']*=r.get('gold',1)**level
        p['level_discount']+=r.get('discount',0)*level
        p['boss_multiplier']*=r.get('boss',1)**level
    p['level_discount']=min(.4,p['level_discount'])
    return p

def run_multilevel(cycles=8,run_hours=12):
    wallet=0;record=0;levels={k:0 for k in RELICS};out=[]
    for n in range(1,cycles+1):
        purchases=[]
        # Cheapest available upgrade first; tie-breaks favor DPS relics.
        while True:
            offers=sorted((RELICS[k]['cost']*2**v, list(PRIORITY).index(k),k) for k,v in levels.items() if v<10)
            if not offers or offers[0][0]>wallet:break
            cost,_,k=offers[0];wallet-=cost;levels[k]+=1;purchases.append({'relic':k,'level':levels[k],'cost':cost})
        r=sim(**multilevel_modifiers(levels),floor_cap=1000,limit_hours=run_hours)
        reached=r['reached_floor'];earned=reward(record,reached);wallet+=earned
        out.append({'run':n,'floor':reached,'hours':r['hours'],'relic_levels':dict(levels),'purchases':purchases,'earned':earned,'wallet':wallet})
        record=max(record,reached)
        if reached>=1000:break
    return {'version':'5.8b','policy':'buy cheapest available relic level (max 10) before each run','cycles':out,'record':record}
