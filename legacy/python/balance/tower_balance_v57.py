"""Experimental v5.7: piecewise floor scaling beyond 400. Not a calibrated multi-rebirth economy."""
import inspect, math, json
import tower_balance_v56 as old
src=inspect.getsource(old.base.previous.sim)
src=src.replace('relic=1, late_gold=2):','relic=1, late_gold=2, gold_multiplier=1, level_discount=0, boss_multiplier=1, floor_cap=1000):')
src=src.replace('if cost>gold:continue','cost=math.ceil(cost*(1-level_discount))\n                    if cost>gold:continue')
src=src.replace('power*=army','power*=army\n        if floor%10==0:power*=boss_multiplier')
src=src.replace('gold+=farmgold','gold+=farmgold*gold_multiplier')
src=src.replace('gold+=gold_base*','gold+=gold_multiplier*gold_base*')
src=src.replace('while floor<=400 and','while floor<=floor_cap and')
src=src.replace('if floor in (50,100,150,200,250,300,350,400):','if floor%50==0:')
src=src.replace('floor_cap=1000):','floor_cap=1000, post_hp_growth=.05, post_gold_growth=.054):')
src=src.replace('hp_base*(1+hp_growth)**(floor-1)', 'hp_base*(1+hp_growth)**(min(floor,400)-1)*(1+post_hp_growth)**max(0,floor-400)')
src=src.replace('hp_base*(1+hp_growth)**(farmfloor-1)', 'hp_base*(1+hp_growth)**(min(farmfloor,400)-1)*(1+post_hp_growth)**max(0,farmfloor-400)')
src=src.replace('gold_base*(1+gold_growth)**(floor-1)', 'gold_base*(1+gold_growth)**(min(floor,400)-1)*(1+post_gold_growth)**max(0,floor-400)')
src=src.replace('gold_base*(1+gold_growth)**(farmfloor-1)', 'gold_base*(1+gold_growth)**(min(farmfloor,400)-1)*(1+post_gold_growth)**max(0,farmfloor-400)')
ns={'math':math,'HEROES':old.base.previous.HEROES,'dps_at':old.base.previous.dps_at,'PASS':old.base.previous.PASS}
exec(src,ns)
sim=ns['sim']
def run():
    builds={'no_relics':[], 'second_damage':['heart','seal','spark'], 'third_hybrid':['heart','seal','spark','gold','knowledge']}
    out={}
    for label,keys in builds.items():
        r=sim(**old.modifiers(keys),floor_cap=1000,limit_hours=24)
        out[label]={'reached_floor':r['reached_floor'],'hours':r['hours'],'milestones':r['milestones'],'farmed_kills':r['farmed_kills']}
    return {'version':'5.7','post400_hp_growth':.05,'post400_gold_growth':.054,'results':out,'limitations':['Fixed relic loadouts, not actual sequential rebirths','Same approximate 30 heroes and passives','Late gold bonus still increases linearly after floor 300','24h cutoff, no SS before floor 1000']}
if __name__=='__main__':
    with open('/mnt/data/tower_balance_v57_results.json','w') as f:json.dump(run(),f,ensure_ascii=False,indent=2)
