"""15-star ascension: provisional costs and DPS factors (v0.6).
Stars are permanent; only unlocked heroes can ascend. Pure functions, no I/O.
"""
from dataclasses import dataclass, field
from typing import Dict
from game_core import HEROES

MAX_STARS = 15
FRAGMENTS = (20,40,80,120,180,260,360,480,650,850,1100,1450,1900,2500)
ESSENCES = (0,0,0,5,10,20,35,50,0,0,0,0,0,0)
CORES = (0,0,0,0,0,0,0,0,1,2,3,5,8,12)
SEALS = (0,0,0,0,0,0,0,0,0,0,0,1,2,3)

@dataclass
class StarState:
    unlocked: set[str] = field(default_factory=set)
    stars: Dict[str,int] = field(default_factory=dict)
    fragments: Dict[str,int] = field(default_factory=dict)
    materials: Dict[str,int] = field(default_factory=lambda: {"essence":0,"core":0,"seal":0})

def multiplier(stars: int) -> float:
    if not isinstance(stars,int) or not 1 <= stars <= MAX_STARS:
        raise ValueError("Stars must be an integer from 1 to 15")
    return 1.18**(stars-1) * (1.15 if stars >= 5 else 1) * (1.25 if stars >= 10 else 1) * (1.5 if stars >= 15 else 1)

def cost_to_next(current: int) -> dict:
    if not isinstance(current,int) or not 1 <= current < MAX_STARS:
        raise ValueError("Hero already maxed or invalid star count")
    i=current-1
    return {"fragments":FRAGMENTS[i],"essence":ESSENCES[i],"core":CORES[i],"seal":SEALS[i]}

def cumulative_cost(start: int = 1, target: int = 15) -> dict:
    if not 1 <= start <= target <= MAX_STARS:
        raise ValueError("Invalid star range")
    result={"fragments":0,"essence":0,"core":0,"seal":0}
    for s in range(start,target):
        c=cost_to_next(s)
        for k in result: result[k]+=c[k]
    return result

def ascend(state: StarState, hero_id: str) -> dict:
    """Mutates state only after validating every cost; returns new star/cost."""
    if hero_id not in HEROES: raise KeyError(hero_id)
    if hero_id not in state.unlocked: raise ValueError("Hero not unlocked")
    current=state.stars.get(hero_id,1)
    cost=cost_to_next(current)
    if state.fragments.get(hero_id,0)<cost["fragments"]:
        raise ValueError("Not enough hero fragments")
    for k in ("essence","core","seal"):
        if state.materials.get(k,0)<cost[k]:
            raise ValueError("Not enough "+k)
    state.fragments[hero_id]-=cost["fragments"]
    for k in ("essence","core","seal"):
        state.materials[k]-=cost[k]
    state.stars[hero_id]=current+1
    return {"hero_id":hero_id,"stars":current+1,"spent":cost,"dps_multiplier":multiplier(current+1)}

def apply_portal_result(state: StarState, summon_result: dict) -> None:
    """Use the portal result as the single source of fragments; do not double-award."""
    hero_id=summon_result["id"]
    if hero_id not in HEROES: raise KeyError(hero_id)
    if summon_result["duplicate"]:
        if hero_id not in state.unlocked: raise ValueError("Duplicate of locked hero")
        count=summon_result["fragments"]
        if not isinstance(count,int) or count<0: raise ValueError("Invalid fragments")
        state.fragments[hero_id]=state.fragments.get(hero_id,0)+count
    else:
        state.unlocked.add(hero_id)
        state.stars.setdefault(hero_id,1)
