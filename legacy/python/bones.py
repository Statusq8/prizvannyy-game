"""Absorbed monster bones v1.1. Six body parts, consumed on rank promotion."""
from dataclasses import dataclass, field

RANKS=('E','D','C','B','A','S','SS','БОГ')
SLOTS=('head','back','left_arm','right_arm','left_leg','right_leg')
QUALITY=('обычная','необычная','редкая','эпическая','легендарная','мифическая','божественная')
GATES={'SS':1000,'БОГ':4000}

@dataclass
class BoneProgress:
    rank:str='E'
    bones:dict[str,int]=field(default_factory=lambda:{s:0 for s in SLOTS})

def validate(p):
    if p.rank not in RANKS or set(p.bones)!=set(SLOTS): raise ValueError('Invalid rank or slots')
    if any(type(v) is not int or not 0<=v<=7 for v in p.bones.values()): raise ValueError('Invalid absorption')
    if p.rank=='БОГ' and any(p.bones.values()): raise ValueError('Max rank cannot absorb more')
    return p

def next_rank(p):
    validate(p); i=RANKS.index(p.rank)
    return RANKS[i+1] if i<7 else None

def required_quality(p):
    validate(p); i=RANKS.index(p.rank)
    return i+1 if i<7 else None

def absorb_bone(p,slot,inventory):
    """Consume one bone of the EXACT next-rank quality, filling an empty body part."""
    validate(p)
    if slot not in SLOTS: raise KeyError(slot)
    quality=required_quality(p)
    if quality is None: raise ValueError('Maximum rank')
    if p.bones[slot]: raise ValueError('Body part already filled')
    key=f'bone_{slot}_{quality}'
    if type(inventory.get(key,0)) is not int or inventory.get(key,0)<1: raise ValueError('Missing bone')
    inventory[key]-=1; p.bones[slot]=quality
    return {'slot':slot,'quality':quality,'quality_name':QUALITY[quality-1],'absorbed':True}

def promote(p,record_floor):
    validate(p)
    target=next_rank(p)
    if target is None: raise ValueError('Maximum rank')
    if type(record_floor) is not int or record_floor<1: raise ValueError('Invalid floor')
    if record_floor<GATES.get(target,1): raise ValueError('Rank locked by floor')
    q=required_quality(p)
    if any(p.bones[s]!=q for s in SLOTS): raise ValueError('Six matching absorbed bones required')
    p.rank=target
    p.bones={s:0 for s in SLOTS}
    return {'rank':target,'absorbed_into_rank':True,'slots_reset':True}

def to_dict(p):
    validate(p); return {'rank':p.rank,'bones':dict(p.bones)}

def from_dict(d):
    if not isinstance(d,dict) or set(d)!={'rank','bones'} or not isinstance(d['bones'],dict): raise ValueError('Invalid bone progress')
    return validate(BoneProgress(d['rank'],dict(d['bones'])))
