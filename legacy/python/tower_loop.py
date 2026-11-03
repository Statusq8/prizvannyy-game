"""Minimal deterministic tower combat loop. All balance values provisional."""
from dataclasses import dataclass
import math
from game_core import HEROES, army_dps, hire, upgrade, reward_multiplier
from save_game import GameSave, validate, rebirth
from monster_drops import monster_at, award_victory

@dataclass
class Battle:
    floor: int
    hp: float
    max_hp: float
    elapsed: float = 0.0


def enemy_hp(floor):
    if type(floor) is not int or floor < 1: raise ValueError('Invalid floor')
    m = monster_at(floor)
    factor = {'normal':1, 'elite':2.5, 'boss':8, 'zone_boss':20}[m.kind]
    return 12 * (1.105 ** (floor-1)) * factor


def start_battle(s):
    validate(s)
    hp=enemy_hp(s.floor)
    return Battle(s.floor,hp,hp)


def hire_hero(s, hero_id):
    validate(s)
    if hero_id not in s.owned: raise ValueError('Hero not unlocked in collection')
    new,gold=hire(hero_id,s.record_floor,s.hired,s.gold)
    s.hired,s.gold=new,gold
    validate(s)


def level_hero(s, hero_id):
    validate(s)
    new,gold=upgrade(hero_id,s.hired,s.gold)
    s.hired,s.gold=new,gold
    validate(s)


def fight_tick(s, battle, seconds=0.1):
    """Advance an active fight; victory rewards applied once; returns event dict."""
    validate(s)
    if not isinstance(battle,Battle) or battle.floor != s.floor or battle.hp<=0:
        raise ValueError('Invalid or completed battle')
    if not isinstance(seconds,(int,float)) or not math.isfinite(seconds) or seconds<=0:
        raise ValueError('Invalid delta time')
    # No protagonist DPS model yet; only currently hired heroes deal damage.
    dps=army_dps(s.hired, 'boss' if monster_at(s.floor).kind in ('boss','zone_boss') else 'normal',
                 stars=s.stars)
    battle.hp=max(0,battle.hp-dps*seconds)
    battle.elapsed+=seconds
    if battle.hp>0: return {'event':'hit','hp':battle.hp,'dps':dps}
    cleared=battle.floor
    monster=monster_at(cleared)
    gold=max(1,math.floor((4*1.11**(cleared-1))*({'normal':1,'elite':2,'boss':6,'zone_boss':15}[monster.kind])*reward_multiplier(s.hired)))
    # Drop is awarded only for a recorded victory; record floor first.
    s.record_floor=max(s.record_floor,cleared)
    drop=award_victory(s,cleared)
    s.gold+=gold
    s.floor+=1
    s.record_floor=max(s.record_floor,s.floor)
    validate(s)
    return {'event':'victory','floor':cleared,'gold':gold,'drop':drop,'next_floor':s.floor}


def restart_run(s):
    return rebirth(s)
