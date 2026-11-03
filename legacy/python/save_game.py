"""Unified save v1 for portal, permanent stars, inventory and run progress.
Prototype API; costs/drop rates remain provisional. Python 3.10+.
"""
from __future__ import annotations
import json, os, tempfile
from dataclasses import dataclass, field
from pathlib import Path
from portal_v01 import PortalState, summon, load_catalog
from stars import StarState, ascend as star_ascend, MAX_STARS
from game_core import HEROES, can_obtain
from bones import BoneProgress, from_dict as bone_from_dict, to_dict as bone_to_dict, absorb_bone, promote, RANKS, SLOTS

VERSION = 4
MATERIALS = ('essence','core','seal')

@dataclass
class GameSave:
    floor: int = 1
    record_floor: int = 1
    gold: int = 0
    protagonist_level: int = 1
    hired: dict[str,int] = field(default_factory=dict)
    owned: set[str] = field(default_factory=set)
    stars: dict[str,int] = field(default_factory=dict)
    fragments: dict[str,int] = field(default_factory=dict)
    materials: dict[str,int] = field(default_factory=lambda:{k:0 for k in MATERIALS})
    scrolls: int = 0
    pulls_since_a: int = 0
    pulls_since_s: int = 0
    total_pulls: int = 0
    bone_sets: dict = field(default_factory=dict)
    bone_inventory: dict[str,int] = field(default_factory=dict)
    bone_drop_pity: dict[str,int] = field(default_factory=dict)
    relics: dict = field(default_factory=dict)
    shards: int = 0
    rebirths: int = 0

def validate(s: GameSave):
    if not isinstance(s,GameSave): raise TypeError('Expected GameSave')
    for name in ('floor','record_floor','gold','protagonist_level','scrolls','pulls_since_a','pulls_since_s','total_pulls','shards','rebirths'):
        v=getattr(s,name)
        if type(v) is not int or v < (1 if name in ('floor','record_floor','protagonist_level') else 0):
            raise ValueError('Invalid '+name)
    if s.floor>s.record_floor: raise ValueError('Floor above record')
    if s.pulls_since_a>s.total_pulls or s.pulls_since_s>s.total_pulls: raise ValueError('Invalid pity')
    if not isinstance(s.owned,set) or not s.owned.issubset(HEROES): raise ValueError('Unknown owned hero')
    if not isinstance(s.stars,dict) or not isinstance(s.fragments,dict) or not isinstance(s.hired,dict): raise ValueError('Invalid hero dictionaries')
    for h in s.owned:
        if not can_obtain(h,s.record_floor): raise ValueError('Hero rarity locked')
    for h,v in s.stars.items():
        if h not in s.owned or type(v) is not int or not 1<=v<=MAX_STARS: raise ValueError('Invalid star')
    for h,v in s.fragments.items():
        if h not in s.owned or type(v) is not int or v<0: raise ValueError('Invalid fragments')
    for h,v in s.hired.items():
        if h not in s.owned or type(v) is not int or v<1: raise ValueError('Invalid hired hero')
    if set(s.materials)!=set(MATERIALS) or any(type(v) is not int or v<0 for v in s.materials.values()):
        raise ValueError('Invalid materials')
    if not isinstance(s.bone_sets,dict) or not isinstance(s.bone_inventory,dict) or not isinstance(s.relics,dict): raise ValueError('Invalid bones/relics')
    for h,b in s.bone_sets.items():
        if h not in s.owned: raise ValueError('Bones belong to unowned hero')
        bone_from_dict(b)
    for k,v in s.bone_inventory.items():
        parts=k.split('_')
        if len(parts)<3 or not k.startswith('bone_') or '_'.join(parts[1:-1]) not in SLOTS or parts[-1] not in map(str,range(1,8)) or type(v) is not int or v<0:
            raise ValueError('Invalid bone inventory')
    if not isinstance(s.bone_drop_pity,dict) or any(k not in ('normal','elite','boss','zone_boss') or type(v) is not int or v<0 for k,v in s.bone_drop_pity.items()):
        raise ValueError('Invalid bone drop pity')
    return s

def to_dict(s: GameSave) -> dict:
    validate(s)
    return {'version':VERSION, **{k:(sorted(v) if isinstance(v,set) else v) for k,v in vars(s).items()}}

def from_dict(d:dict) -> GameSave:
    if not isinstance(d,dict): raise ValueError('Invalid save')
    if d.get('version')==1:
        # Explicit migration: legacy six gear items are not monster bones.
        # They are not silently converted into ranks or bone materials.
        d={**d,'version':2,'bone_sets':{},'bone_inventory':{}}
        d.pop('gear',None)
    if d.get('version')==2:
        d={**d,'version':VERSION,'bone_drop_pity':{}}
    if d.get('version')==3:
        # Old equipment-style bones cannot safely become absorbed body parts.
        # Preserve owned monster-bone inventory only when slot keys can be mapped.
        mapping={'skull':'head','spine':'back','ribs':'back','left_claw':'left_arm','right_claw':'right_arm','core':'head'}
        inv={}
        for key,quantity in d.get('bone_inventory',{}).items():
            if not key.startswith('bone_'): continue
            old,q=key[5:].rsplit('_',1)
            if old in mapping:
                new=f'bone_{mapping[old]}_{q}'
                inv[new]=inv.get(new,0)+quantity
        d={**d,'version':4,'bone_sets':{},'bone_inventory':inv}
    if d.get('version')!=VERSION: raise ValueError('Unsupported save version')
    fields=set(GameSave.__dataclass_fields__)
    if set(d)-{'version'}!=fields: raise ValueError('Missing or unknown save fields')
    data={k:v for k,v in d.items() if k!='version'}
    if not isinstance(data['owned'],list) or len(data['owned'])!=len(set(data['owned'])): raise ValueError('Invalid owned list')
    data['owned']=set(data['owned'])
    return validate(GameSave(**data))

def save(s:GameSave, path):
    """Atomic replace; no partially written save if process stops mid-write."""
    payload=json.dumps(to_dict(s),ensure_ascii=False,sort_keys=True,indent=2)
    dest=Path(path); dest.parent.mkdir(parents=True,exist_ok=True)
    tmp=None
    try:
        with tempfile.NamedTemporaryFile('w',encoding='utf-8',dir=dest.parent,prefix='.save-',suffix='.tmp',delete=False) as f:
            tmp=f.name; f.write(payload); f.flush(); os.fsync(f.fileno())
        os.replace(tmp,dest)
    finally:
        if tmp and os.path.exists(tmp): os.unlink(tmp)

def load(path) -> GameSave:
    return from_dict(json.loads(Path(path).read_text(encoding='utf-8')))

def summon_heroes(s:GameSave, count=1, rng=None, heroes=None):
    validate(s)
    p=PortalState(scrolls=s.scrolls,record_floor=s.record_floor,owned=set(s.owned),fragments=dict(s.fragments),
                  pulls_since_a=s.pulls_since_a,pulls_since_s=s.pulls_since_s,total_pulls=s.total_pulls)
    results=summon(p,heroes if heroes is not None else load_catalog(),rng,count)
    # Portal already credits duplicates; do NOT call stars.apply_portal_result.
    s.owned=p.owned; s.fragments=p.fragments; s.scrolls=p.scrolls
    s.pulls_since_a=p.pulls_since_a; s.pulls_since_s=p.pulls_since_s; s.total_pulls=p.total_pulls
    for h in s.owned: s.stars.setdefault(h,1)
    validate(s)
    return results

def ascend_hero(s:GameSave, hero_id:str):
    validate(s)
    st=StarState(unlocked=s.owned,stars=s.stars,fragments=s.fragments,materials=s.materials)
    result=star_ascend(st,hero_id)
    validate(s)
    return result

def rebirth(s:GameSave):
    validate(s)
    if s.floor<400: raise ValueError('Rebirth requires current floor >= 400')
    s.floor=1; s.gold=0; s.protagonist_level=1; s.hired={}; s.rebirths+=1
    # All collection, stars, portal pity, fragments, scrolls, bones and relics persist.
    return s


def upgrade_hero_bone(s:GameSave,hero_id:str,slot:str):
    validate(s)
    if hero_id not in s.owned: raise ValueError('Hero not unlocked')
    data=s.bone_sets.get(hero_id)
    progress=bone_from_dict(data) if data is not None else BoneProgress(rank=HEROES[hero_id]['rarity'])
    result=absorb_bone(progress,slot,s.bone_inventory)
    s.bone_sets[hero_id]=bone_to_dict(progress)
    validate(s)
    return result

def promote_hero_rank(s:GameSave,hero_id:str):
    validate(s)
    if hero_id not in s.owned: raise ValueError('Hero not unlocked')
    data=s.bone_sets.get(hero_id)
    progress=bone_from_dict(data) if data is not None else BoneProgress(rank=HEROES[hero_id]['rarity'])
    result=promote(progress,s.record_floor)
    s.bone_sets[hero_id]=bone_to_dict(progress)
    validate(s)
    return result

if __name__=='__main__':
    import random
    s=GameSave(scrolls=10)
    print(summon_heroes(s,10,random.Random(42)))
    print(json.dumps(to_dict(s),ensure_ascii=False,indent=2))
