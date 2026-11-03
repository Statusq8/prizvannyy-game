"""Deterministic prototype calculations. Economy coefficients are provisional."""
import json, math
from pathlib import Path
HEROES={h['id']:h for h in json.loads((Path(__file__).parent/'heroes_v02.json').read_text())['heroes']}
GATES={'SS':1000,'БОГ':4000}

def can_obtain(hero_id,record_floor):
    return record_floor >= GATES.get(HEROES[hero_id]['rarity'],0)

def level_cost(hero_id, current_level, growth=.079):
    """Gold to advance from current_level to current_level+1; test formula."""
    if current_level<1: raise ValueError('Level must be >= 1')
    return max(1,math.ceil(.07*HEROES[hero_id]['base_hire_gold']*(1+growth)**current_level))

def hire(hero_id,record_floor,owned,gold):
    """owned: hero_id -> level; hiring always starts at level 1."""
    h=HEROES[hero_id]
    if not can_obtain(hero_id,record_floor):raise ValueError('Rarity locked')
    if hero_id in owned:raise ValueError('Already hired')
    if gold<h['base_hire_gold']:raise ValueError('Insufficient gold')
    return {**owned,hero_id:1},gold-h['base_hire_gold']

def upgrade(hero_id,owned,gold):
    if hero_id not in owned:raise ValueError('Not hired')
    price=level_cost(hero_id,owned[hero_id])
    if gold<price:raise ValueError('Insufficient gold')
    return {**owned,hero_id:owned[hero_id]+1},gold-price

def personal_dps(hero_id,level,star_count=1):
    if level<1:return 0.0
    h=HEROES[hero_id]
    base=h['base_dps']*1.05**(level-1)
    for p in h['passives']:
        if level>=p['level'] and p['effect']['type']=='personal_dps_multiplier':base*=p['effect']['value']
    base*=1.25**max(0,(level-200)//25)
    if level>=1000:base*=10
    from stars import multiplier
    return base * multiplier(star_count)

def army_dps(owned,enemy_type='normal',protagonist_dps=0,stars=None):
    """Army buffs additive by category, then multiplicative across categories.
    Tags/faction buffs affect eligible heroes; boss/normal bonuses affect total.
    """
    stars = stars or {}
    effects=[]
    for hid,lv in owned.items():
        if hid not in HEROES or lv<1:raise ValueError('Invalid owned hero')
        for p in HEROES[hid]['passives']:
            if lv>=p['level'] and p['effect']['type']!='personal_dps_multiplier':effects.append(p['effect'])
    def bonus(kind,target):return sum(e['value'] for e in effects if e['type']==kind and e.get('target')==target)
    total=protagonist_dps*(1+bonus('army','all'))*(1+bonus('summoned','main'))
    for hid,lv in owned.items():
        h=HEROES[hid]
        factor=(1+bonus('army','all'))*(1+bonus('faction',h['faction']))*(1+bonus('all_factions','all'))
        for tag in h['tags']:factor*=1+bonus('tag',tag)
        total+=personal_dps(hid,lv,stars.get(hid,1))*factor
    if enemy_type=='boss':total*=1+bonus('target','boss')
    if enemy_type=='normal':total*=1+bonus('target','normal')
    return total

def rebirth(owned,record_floor,unlocked,stars,gear,relics,shards):
    if record_floor<400:raise ValueError('Rebirth locked')
    return {'floor':1,'gold':0,'hired':{},'protagonist_level':1,'record_floor':record_floor,
            'unlocked':list(unlocked),'stars':dict(stars),'gear':dict(gear),
            'relics':dict(relics),'shards':shards}

def reward_multiplier(owned, reward_type='gold'):
    """Gold and ghost rewards; additive bonuses in same category."""
    return 1+sum(p['effect']['value'] for hid,lv in owned.items()
      for p in HEROES[hid]['passives'] if lv>=p['level']
      and p['effect']['type']=='economy' and p['effect'].get('target')==reward_type)
