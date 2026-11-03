"""Auto-buy and farming controller for the tower prototype.

No offline rewards, protagonist damage or combat visuals yet. Balance is provisional.
"""
from dataclasses import dataclass
from game_core import HEROES, army_dps, level_cost, reward_multiplier
from tower_loop import enemy_hp, start_battle, fight_tick, hire_hero, level_hero
from monster_drops import monster_at
from save_game import validate

@dataclass
class AutoSettings:
    auto_hire: bool = True
    auto_level: bool = True
    target_kill_seconds: float = 8.0
    farm_floor: int | None = None


def combat_dps(s, floor=None):
    floor = s.floor if floor is None else floor
    kind = monster_at(floor).kind
    return army_dps(s.hired, 'boss' if kind in ('boss','zone_boss') else 'normal', stars=s.stars)


def best_purchase(s, settings=None):
    """Find affordable action maximizing incremental raw DPS per gold.

    Collection unlock is permanent; only collected heroes may be hired.
    """
    validate(s)
    settings = settings or AutoSettings()
    base = combat_dps(s)
    best = None
    for hid in sorted(s.owned):
        if hid not in s.hired:
            if not settings.auto_hire: continue
            cost = HEROES[hid]['base_hire_gold']
            if cost > s.gold: continue
            levels = dict(s.hired); levels[hid] = 1
            action = 'hire'
        else:
            if not settings.auto_level: continue
            cost = level_cost(hid,s.hired[hid])
            if cost > s.gold: continue
            levels = dict(s.hired); levels[hid] += 1
            action = 'level'
        kind = monster_at(s.floor).kind
        dps = army_dps(levels, 'boss' if kind in ('boss','zone_boss') else 'normal', stars=s.stars)
        gain = dps-base
        if gain <= 0: continue
        candidate = {'action':action,'hero_id':hid,'cost':cost,'dps_gain':gain,'efficiency':gain/cost}
        if best is None or (candidate['efficiency'],candidate['dps_gain'],hid) > (best['efficiency'],best['dps_gain'],best['hero_id']):
            best = candidate
    return best


def auto_shop(s, settings=None, max_purchases=20):
    if type(max_purchases) is not int or max_purchases<0: raise ValueError('Invalid purchase limit')
    settings = settings or AutoSettings()
    actions=[]
    for _ in range(max_purchases):
        purchase=best_purchase(s,settings)
        if purchase is None: break
        if purchase['action']=='hire': hire_hero(s,purchase['hero_id'])
        else: level_hero(s,purchase['hero_id'])
        actions.append(purchase)
    return actions


def can_advance(s,settings=None):
    settings=settings or AutoSettings()
    if settings.target_kill_seconds<=0: raise ValueError('target_kill_seconds must be positive')
    return combat_dps(s)*settings.target_kill_seconds >= enemy_hp(s.floor)


def auto_step(s,settings=None,seconds=1.0,max_purchases=20):
    """One decision and combat step. Farm current floor when too weak.

    Farming grants gold/drop but does NOT advance floor or record. Avoids
    fake repeated clears of a boss by farming normal mobs at the same floor.
    """
    settings=settings or AutoSettings()
    actions=auto_shop(s,settings,max_purchases)
    dps=combat_dps(s)
    if dps<=0:
        return {'event':'stalled','reason':'No hired heroes deal damage','purchases':actions}
    if can_advance(s,settings):
        battle=start_battle(s)
        result=fight_tick(s,battle,max(seconds,enemy_hp(s.floor)/dps))
        return {**result,'purchases':actions,'mode':'advance'}
    # Farm gold at the last previously cleared floor. No drops or pity rewards
    # until an explicit repeatable encounter is implemented.
    farm_floor=max(1,s.floor-1)
    gold=max(1,int(4*1.11**(farm_floor-1)*reward_multiplier(s.hired)))
    s.gold+=gold
    validate(s)
    return {'event':'farm','floor':farm_floor,'gold':gold,'purchases':actions,'mode':'farm'}
