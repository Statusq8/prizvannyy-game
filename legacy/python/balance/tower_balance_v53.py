"""Second-run scenario built on the v5.2 prototype, not a complete game balance.
Run: python tower_balance_v53.py
"""
import json
from tower_balance_v52 import sim

RELICS = [
    {'name':'Сердце разрушения','cost':15,'dps_multiplier':1.25},
    {'name':'Печать восхождения','cost':20,'dps_multiplier':1.25},
    {'name':'Искра Бездны','cost':20,'dps_multiplier':1.20},
]

def run_scenarios():
    first = sim(relic=1)
    multiplier=1
    for relic in RELICS:
        multiplier*=relic['dps_multiplier']
    second=sim(relic=multiplier)
    sensitivity=[{'multiplier':m,'hours':sim(relic=m)['hours']} for m in (1,1.65,1.75,1.8,1.85,1.875,1.9,2,2.2)]
    return {'first_run':{'hours':first['hours'],'floors':first['reached_floor']},
            'proposed_first_rebirth_shards':55,'proposed_relics':RELICS,
            'second_run':{'hours':second['hours'],'floors':second['reached_floor'],'dps_multiplier':multiplier},
            'sensitivity':sensitivity,
            'limitations':['Uses v5.2 simplified hero passive profiles',
                           'Relics represented only by a global DPS multiplier',
                           'Shard income and relic prices are design assumptions, not simulated earnings',
                           'No offline progress, UI interaction time, gear or stars']}

if __name__=='__main__':
    print(json.dumps(run_scenarios(),ensure_ascii=False,indent=2))
