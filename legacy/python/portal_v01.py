"""Призванный: Башня Гачи — draft summon portal, no paid-currency implementation.
All rates are proposals, not final GDD decisions. Python 3.10+.
"""
from __future__ import annotations
from dataclasses import dataclass, field
import json, random
from pathlib import Path

CATALOG = Path(__file__).with_name('heroes_v02.json')
# Sum exactly 1.0. SS and БОГ probabilities are reserved, not redistributed before unlock.
BASE_RATES = {'E': .45, 'D': .30, 'C': .15, 'B': .07, 'A': .025, 'S': .0045, 'SS': .00045, 'БОГ': .00005}
SHARDS = {'E': 1, 'D': 2, 'C': 5, 'B': 12, 'A': 30, 'S': 100, 'SS': 350, 'БОГ': 1000}
GATES = {'SS': 1000, 'БОГ': 4000}
# Guaranteed A+ by 100 pulls; S+ by 500; guarantees only select eligible rarities.
PITY_A = 100
PITY_S = 500
ORDER = list(BASE_RATES)

def load_catalog(path=CATALOG):
    heroes = json.loads(Path(path).read_text(encoding='utf-8'))['heroes']
    assert len(heroes) == 40 and len({h['id'] for h in heroes}) == 40
    return heroes

@dataclass
class PortalState:
    scrolls: int = 0
    record_floor: int = 1
    owned: set[str] = field(default_factory=set)
    fragments: dict[str, int] = field(default_factory=dict)
    pulls_since_a: int = 0
    pulls_since_s: int = 0
    total_pulls: int = 0


def available_rates(record_floor):
    rates = {r: v for r,v in BASE_RATES.items() if record_floor >= GATES.get(r,0)}
    total = sum(rates.values())
    return {r: v / total for r,v in rates.items()}

def draw_rarity(state, rng):
    rates = available_rates(state.record_floor)
    if state.pulls_since_s + 1 >= PITY_S:
        choices = [r for r in rates if ORDER.index(r) >= ORDER.index('S')]
    elif state.pulls_since_a + 1 >= PITY_A:
        choices = [r for r in rates if ORDER.index(r) >= ORDER.index('A')]
    else:
        choices = list(rates)
    total = sum(rates[r] for r in choices)
    x = rng.random() * total
    for r in choices:
        x -= rates[r]
        if x < 0: return r
    return choices[-1]

def summon(state, heroes, rng=None, count=1):
    if count < 1 or count > 10: raise ValueError('Count must be 1..10')
    if state.scrolls < count: raise ValueError('Not enough scrolls')
    rng = rng or random.Random()
    by_rank = {}
    for h in heroes:
        by_rank.setdefault(h['rarity'], []).append(h)
    out=[]
    for _ in range(count):
        rank = draw_rarity(state, rng)
        hero = rng.choice(by_rank[rank])
        duplicate = hero['id'] in state.owned
        if duplicate:
            state.fragments[hero['id']] = state.fragments.get(hero['id'], 0) + SHARDS[rank]
        else:
            state.owned.add(hero['id'])
        state.scrolls -= 1
        state.total_pulls += 1
        state.pulls_since_a = 0 if ORDER.index(rank) >= ORDER.index('A') else state.pulls_since_a+1
        state.pulls_since_s = 0 if ORDER.index(rank) >= ORDER.index('S') else state.pulls_since_s+1
        out.append({'id':hero['id'],'name':hero['name'],'rarity':rank,'duplicate':duplicate,'fragments':SHARDS[rank] if duplicate else 0})
    return out

if __name__ == '__main__':
    heroes=load_catalog(); state=PortalState(scrolls=10,record_floor=400)
    print(json.dumps({'rates_floor_400':available_rates(400),'results':summon(state,heroes,random.Random(42),10)},ensure_ascii=False,indent=2))
