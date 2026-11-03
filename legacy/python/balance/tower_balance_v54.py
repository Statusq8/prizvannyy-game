"""Prototype: relic allocation comparison based on v5.2. Shards are a design budget, not earned in simulation."""
import inspect, json
import tower_balance_v52 as previous
src=inspect.getsource(previous.sim)
src=src.replace('relic=1, late_gold=2):','relic=1, late_gold=2, gold_multiplier=1, level_discount=0, boss_multiplier=1):')
src=src.replace('if cost>gold:continue','cost=math.ceil(cost*(1-level_discount))\n                    if cost>gold:continue')
src=src.replace('power*=army','power*=army\n        if floor%10==0:power*=boss_multiplier')
src=src.replace('gold+=farmgold','gold+=farmgold*gold_multiplier')
src=src.replace('gold+=gold_base*(1+gold_growth)**(floor-1)*(5 if b else 1)*(1+late_gold*max(0,floor-300)/100)','gold+=gold_multiplier*gold_base*(1+gold_growth)**(floor-1)*(5 if b else 1)*(1+late_gold*max(0,floor-300)/100)')
namespace={'math':__import__('math'),'HEROES':previous.HEROES,'dps_at':previous.dps_at,'PASS':previous.PASS}
exec(src,namespace)
sim=namespace['sim']
RELICS={
 'heart':{'name':'Сердце разрушения','cost':15,'dps':1.25},
 'seal':{'name':'Печать восхождения','cost':20,'dps':1.25},
 'spark':{'name':'Искра Бездны','cost':20,'dps':1.20},
 'gold':{'name':'Золотая печать','cost':10,'gold':1.20},
 'knowledge':{'name':'Древнее знание','cost':15,'discount':.03},
 'boss':{'name':'Охотник на хранителей','cost':20,'boss':1.10},
}
SETS={
 'damage':['heart','seal','spark'],
 'hybrid':['heart','seal','gold'],
 'economy':['gold','knowledge','boss'],
}
def setup(keys):
    params={'relic':1.,'gold_multiplier':1.,'level_discount':0.,'boss_multiplier':1.}
    for key in keys:
        r=RELICS[key]
        params['relic']*=r.get('dps',1.)
        params['gold_multiplier']*=r.get('gold',1.)
        params['level_discount']+=r.get('discount',0.)
        params['boss_multiplier']*=r.get('boss',1.)
    return params

def run():
    out={'source':'v5.2 prototype modified to apply gold, level-cost and boss relics','assumed_first_rebirth_shards':55,'relics':RELICS,'first_run_reference_hours':11.489,'scenarios':{},'limitations':['55 shards assumed, not earned or verified','hero passives approximate, 30 heroes E-S only','no offline, UI, gear, stars, or enemy combat','one heuristic buyer, not optimized player strategies']}
    for label,keys in SETS.items():
        cost=sum(RELICS[k]['cost'] for k in keys)
        if cost>55:raise ValueError('overspend')
        params=setup(keys)
        result=sim(**params)
        out['scenarios'][label]={'relics':keys,'spent':cost,'unspent':55-cost,'modifiers':params,'hours':result['hours'],'reached_floor':result['reached_floor'],'milestones':result['milestones'],'farmed_kills':result['farmed_kills']}
    return out
if __name__=='__main__':
    print(json.dumps(run(),ensure_ascii=False,indent=2))
