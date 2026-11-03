"""Manual floor selection and repeatable gold farming for the tower.

The save's `floor` remains the next unbeaten floor (frontier).  A selected
farming floor is session state, not progression.  Rebirth resets the session.
"""
from dataclasses import dataclass
import math
from game_core import army_dps, reward_multiplier
from monster_drops import monster_at
from save_game import validate
from tower_loop import enemy_hp, start_battle, fight_tick

@dataclass
class FloorSelector:
    # Highest cleared floor in the CURRENT run; record_floor is lifetime record.
    frontier: int
    selected: int | None = None
    repeat: bool = False


def new_selector(save):
    validate(save)
    return FloorSelector(frontier=save.floor)


def choose_floor(save, selector, floor, repeat=True):
    validate(save)
    if type(floor) is not int or not 1 <= floor < selector.frontier:
        raise ValueError('Can only farm floors cleared in the current run')
    if save.floor != selector.frontier:
        raise ValueError('Run changed; create a new selector')
    selector.selected = floor
    selector.repeat = bool(repeat)
    return selector


def resume_climb(save, selector):
    validate(save)
    if save.floor != selector.frontier:
        raise ValueError('Run changed; create a new selector')
    selector.selected = None
    selector.repeat = False


def _gold_reward(save, floor):
    kind=monster_at(floor).kind
    factor={'normal':1,'elite':2,'boss':6,'zone_boss':15}[kind]
    return max(1, math.floor(4 * 1.11**(floor-1) * factor * reward_multiplier(save.hired)))


def battle_once(save, selector, seconds, rng=None):
    """Fight one encounter; insufficient time returns no rewards.

    Farming awards gold ONLY, not first-clear drops, shards or progression.
    This deliberately prevents repeating milestone rewards and drop pity.
    """
    validate(save)
    if save.floor != selector.frontier:
        raise ValueError('Run changed; create a new selector')
    if not isinstance(seconds,(int,float)) or not math.isfinite(seconds) or seconds <= 0:
        raise ValueError('Invalid battle duration')
    if selector.selected is None:
        battle=start_battle(save)
        event=fight_tick(save,battle,seconds)
        if event['event']=='victory':
            selector.frontier=save.floor
        return {**event,'mode':'advance'}
    floor=selector.selected
    if not 1 <= floor < selector.frontier:
        raise ValueError('Invalid selected floor')
    kind=monster_at(floor).kind
    dps=army_dps(save.hired,'boss' if kind in ('boss','zone_boss') else 'normal',stars=save.stars)
    hp=enemy_hp(floor)
    if dps*seconds < hp:
        return {'event':'fighting','mode':'farm','floor':floor,'remaining_hp':hp-dps*seconds,'gold':0}
    gold=_gold_reward(save,floor)
    save.gold+=gold
    validate(save)
    return {'event':'farm_victory','mode':'farm','floor':floor,'gold':gold,'repeat':selector.repeat,
            'next':'repeat' if selector.repeat else 'wait'}


def repeat_farm(save, selector, battles, seconds_per_battle):
    """Explicitly simulate a bounded number of real repeat victories."""
    if type(battles) is not int or not 0 <= battles <= 10000:
        raise ValueError('Invalid number of battles')
    if selector.selected is None or not selector.repeat:
        raise ValueError('Repeat mode is not enabled')
    result=[]
    for _ in range(battles):
        event=battle_once(save,selector,seconds_per_battle)
        result.append(event)
        if event['event']!='farm_victory':
            break
    return result
