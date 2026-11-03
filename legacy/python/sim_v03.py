"""Reproducible simplified floor simulator using game_core.py and all 40 heroes.
Not a validated production balance model. Run: python sim_v03.py
"""
import json, math
from pathlib import Path
from game_core import HEROES, can_obtain, army_dps, level_cost, hire, upgrade, rebirth, reward_multiplier

HP_BASE=320; HP_GROWTH=1.055; GOLD_BASE=42; GOLD_GROWTH=1.052
SPAWN_SECONDS=1.5; MOBS_PER_FLOOR=5; BOSS_HP=3; BOSS_GOLD=5
MAX_FIGHT_SECONDS=20; MAX_FARM=120

def hp(f): return HP_BASE*HP_GROWTH**(f-1)
def gold_drop(f): return GOLD_BASE*GOLD_GROWTH**(f-1)
def level_batch_cost(hid, level, count):
    return sum(level_cost(hid,level+j) for j in range(count))

def shop(owned, cash, record, relic_dps, max_actions=10):
    # Greedy marginal DPS / gold; samples 1/10/25-level jumps and new hires.
    for _ in range(max_actions):
        base=army_dps(owned)*relic_dps + 1
        best=None; best_score=0
        for hid,h in HEROES.items():
            if not can_obtain(hid,record):continue
            if hid not in owned:
                price=h['base_hire_gold']; new={**owned,hid:1}; n=0
                if price<=cash:
                    gain=(army_dps(new)-army_dps(owned))*relic_dps
                    score=gain/price
                    if score>best_score:best_score=score;best=(hid,n,price)
            else:
                lv=owned[hid]
                for n in (1,10,25):
                    price=level_batch_cost(hid,lv,n)
                    if price>cash:continue
                    new={**owned,hid:lv+n}
                    gain=(army_dps(new)-army_dps(owned))*relic_dps
                    score=gain/price
                    if score>best_score:best_score=score;best=(hid,n,price)
        if best is None:break
        hid,n,price=best
        cash-=price
        owned={**owned,hid:(owned.get(hid,0)+n if n else 1)}
    return owned,cash

def run(relic_dps=1.0, max_floor=400, prior_record=0):
    owned={}; cash=0.; elapsed=0.; farm=0; record=prior_record; checkpoints={}
    for f in range(1,max_floor+1):
        for mob in range(MOBS_PER_FLOOR):
            is_boss=f%10==0 and mob==MOBS_PER_FLOOR-1
            health=hp(f)*(BOSS_HP if is_boss else 1)
            # Only farm previous floor when current enemy would take >20s.
            for _ in range(MAX_FARM):
                dps=max(1,army_dps(owned,'boss' if is_boss else 'normal')*relic_dps+1)
                if health/dps<=MAX_FIGHT_SECONDS:break
                if f==1:break
                prev=f-1
                prev_dps=max(1,army_dps(owned)*relic_dps+1)
                elapsed+=hp(prev)/prev_dps+SPAWN_SECONDS
                cash+=gold_drop(prev)*reward_multiplier(owned)
                farm+=1
                owned,cash=shop(owned,cash,record,relic_dps,max_actions=1)
            else:
                return {'status':'farm_cap','floor':f,'hours':round(elapsed/3600,3),'farm':farm,'hired':len(owned),'record':record}
            elapsed+=health/dps+SPAWN_SECONDS
            cash+=gold_drop(f)*(BOSS_GOLD if is_boss else 1)*reward_multiplier(owned)
            record=max(record,f)
            owned,cash=shop(owned,cash,record,relic_dps,max_actions=1)
        if f in (50,100,200,300,400,600,800,1000):checkpoints[str(f)]=round(elapsed/3600,3)
    return {'status':'completed','floor':max_floor,'hours':round(elapsed/3600,3),'farm':farm,'hired':len(owned),'record':record,'checkpoints':checkpoints,'total_levels':sum(owned.values()),'owned':owned}

def main():
    # 3 separate runs, with relic assumptions; no automatic shard rewards or purchases yet.
    scenarios=[('first',1.),('second',1.875),('third',1.875*1.25)]
    output={'model':'v0.3 exploratory','limitations':['simplified shop heuristic','fixed relic multipliers; shard income not modeled','no portal, gear, stars or offline progression','passive mechanics still draft'],'runs':{}}
    for name,power in scenarios:
        result=run(power,max_floor=200)
        output['runs'][name]={k:v for k,v in result.items() if k!='owned'}
        print(name,output['runs'][name])
    path=Path(__file__).with_name('sim_v03_results.json')
    path.write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf8')
    print('Wrote',path)
if __name__=='__main__':main()
