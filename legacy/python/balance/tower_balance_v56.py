"""Experimental v5.6: progression past 400; no claims of calibrated 1000-floor balance."""
import inspect, json, math
import tower_balance_v54 as base
from tower_balance_v55 import modifiers
source=inspect.getsource(base.previous.sim)
source=source.replace('relic=1, late_gold=2):','relic=1, late_gold=2, gold_multiplier=1, level_discount=0, boss_multiplier=1, floor_cap=1000):')
source=source.replace('if cost>gold:continue','cost=math.ceil(cost*(1-level_discount))\n                    if cost>gold:continue')
source=source.replace('power*=army','power*=army\n        if floor%10==0:power*=boss_multiplier')
source=source.replace('gold+=farmgold','gold+=farmgold*gold_multiplier')
source=source.replace('gold+=gold_base*(1+gold_growth)**(floor-1)*(5 if b else 1)*(1+late_gold*max(0,floor-300)/100)','gold+=gold_multiplier*gold_base*(1+gold_growth)**(floor-1)*(5 if b else 1)*(1+late_gold*max(0,floor-300)/100)')
source=source.replace('while floor<=400 and', 'while floor<=floor_cap and')
source=source.replace('if floor in (50,100,150,200,250,300,350,400):','if floor%50==0:')
ns={'math':math,'HEROES':base.previous.HEROES,'dps_at':base.previous.dps_at,'PASS':base.previous.PASS}
exec(source,ns)
sim=ns['sim']
# Proposed, not calibrated: first-time record rewards only; every rebirth needs to clear >=400.
def record_shards(previous_record, new_record):
    return sum((5 if f<=400 else 10 if f<=1000 else 15) for f in range(100,new_record+1,50) if f>previous_record and (f>400 or f%100==0))
def cycle_rewards(previous_record,new_record,boss_kills=0,ghosts=0):
    if new_record<400:return 0
    return 20+min(10,boss_kills//10)+min(5,ghosts)+record_shards(previous_record,new_record)
def run():
    builds={'no_relics':[], 'damage':['heart','seal','spark'], 'hybrid':['heart','seal','gold'], 'third':['heart','seal','spark','gold','knowledge']}
    results={}
    for label,keys in builds.items():
        r=sim(**modifiers(keys),floor_cap=1000,limit_hours=24)
        results[label]={'hours':r['hours'],'reached_floor':r['reached_floor'],'farmed_kills':r['farmed_kills'],'milestones':r['milestones']}
    return {'version':'5.6','results':results,'proposed_shard_examples':{'first_400':cycle_rewards(0,400,100,5),'repeat_400':cycle_rewards(400,400,100,5),'new_record_600':cycle_rewards(400,600,100,5),'new_record_1000':cycle_rewards(600,1000,100,5)},'notes':['1000-floor cap and 24h per-run cutoff','No SS until 1000; model only includes E-S','Rebirth rewards formula is a proposal, not a simulated earning system','All other combat simplifications inherited from v5.4']}
if __name__=='__main__':print(json.dumps(run(),ensure_ascii=False,indent=2))
