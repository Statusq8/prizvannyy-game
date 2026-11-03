"""v5.5 experimental relic balance. Uses the simplified v5.4 engine; shard earning is an explicit design assumption."""
import json
from tower_balance_v54 import sim, setup

RELICS={
 'heart':{'cost':15,'dps':1.25},'seal':{'cost':20,'dps':1.25},'spark':{'cost':20,'dps':1.20},
 'gold':{'cost':10,'gold':1.35},'knowledge':{'cost':15,'discount':.08},'boss':{'cost':20,'boss':1.20},
}
# Existing v5.4 setup reads its own relic table, so calculate parameters here.
def modifiers(keys):
 p={'relic':1.,'gold_multiplier':1.,'level_discount':0.,'boss_multiplier':1.}
 for k in keys:
  r=RELICS[k];p['relic']*=r.get('dps',1);p['gold_multiplier']*=r.get('gold',1)
  p['level_discount']+=r.get('discount',0);p['boss_multiplier']*=r.get('boss',1)
 return p

def run():
 builds={'damage':['heart','seal','spark'], 'hybrid':['heart','seal','gold'], 'economy':['gold','knowledge','boss'],
         'balanced':['heart','gold','knowledge'], 'boss_focus':['heart','boss','gold']}
 outcomes={}
 for name,keys in builds.items():
  r=sim(**modifiers(keys));outcomes[name]={'shards_spent':sum(RELICS[k]['cost'] for k in keys),'hours':r['hours'],'reached_floor':r['reached_floor'],'farmed_kills':r['farmed_kills'],'milestones':r['milestones']}
 # Three consecutive runs with explicit spending rule and shard grant: 55 at first rebirth, 35 at second.
 # 1st run is no relics, 2nd buys 3 damage relics, 3rd buys gold + knowledge + boss using next 45 shards.
 cycles=[]
 for label,keys,earned in [('first',[],55),('second',['heart','seal','spark'],35),('third',['heart','seal','spark','gold','knowledge'],None)]:
  r=sim(**modifiers(keys));cycles.append({'run':label,'equipped_relics':keys,'hours':r['hours'],'reached_floor':r['reached_floor'],'shards_earned_on_rebirth_assumed':earned})
 return {'version':'5.5','model':'v5.4 patched simulator, simplified 30 heroes, heuristic purchases',
         'relics':RELICS,'builds':outcomes,'cycles':cycles,
         'assumptions':['First rebirth awards 55 shards; second rebirth awards 35 shards by assumption, not from simulated gameplay','Third run spends 80 of 90 assumed total earned shards, leaving 10 unspent; shard income is not yet simulated','No repeated relic levels, no earned shard ledger, no gear, no stars, no offline time','The engine uses simplified passives and an approximate boss modifier']}
if __name__=='__main__':print(json.dumps(run(),ensure_ascii=False,indent=2))
