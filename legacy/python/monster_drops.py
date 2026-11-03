"""Prototype monster bone drops v1.0. All probabilities are balance placeholders."""
from dataclasses import dataclass
import random
from bones import SLOTS, QUALITY

ZONES = ('Древний лес','Пепельная пустыня','Ледяные залы','Огненная кузница',
         'Грозовой пик','Ядовитое болото','Затопленный храм','Царство смерти')
# Quality 1..7. Unlocks for rare drops intentionally extend beyond first 400 floors.
QUALITY_FLOORS = {1:1,2:51,3:151,4:301,5:601,6:1000,7:4000}
DROP_CHANCE = {'normal':0.12,'elite':0.32,'boss':0.65,'zone_boss':1.0}
PITY_LIMIT = {'normal':20,'elite':9,'boss':5,'zone_boss':1}

@dataclass(frozen=True)
class Monster:
    floor:int
    zone:str
    kind:str
    name:str
    target_slot:str

def monster_at(floor:int)->Monster:
    if type(floor) is not int or floor<1: raise ValueError('Invalid floor')
    zone=ZONES[((floor-1)//50)%len(ZONES)] if floor<=400 else f'Башня: этажи {((floor-1)//50)*50+1}–{((floor-1)//50+1)*50}'
    kind='zone_boss' if floor%50==0 else 'boss' if floor%10==0 else 'elite' if floor%25==0 else 'normal'
    slot=SLOTS[((floor-1)//5)%len(SLOTS)]
    names={'normal':'Обитатель','elite':'Элитный страж','boss':'Хранитель','zone_boss':'Владыка'}
    return Monster(floor,zone,kind,f'{names[kind]} — {zone}',slot)

def max_quality(floor:int)->int:
    if type(floor) is not int or floor<1: raise ValueError('Invalid floor')
    return max(q for q,required in QUALITY_FLOORS.items() if floor>=required)

def roll_bone(floor:int, pity:dict, rng=None):
    """Mutates pity only; returns drop dict or None. Caller awards inventory.
    Pity is per monster kind; target slot is deterministic by floor.
    """
    m=monster_at(floor)
    if not isinstance(pity,dict): raise ValueError('Invalid pity state')
    misses=pity.get(m.kind,0)
    if type(misses) is not int or misses<0: raise ValueError('Invalid pity counter')
    rng=rng or random.Random()
    dropped=misses+1>=PITY_LIMIT[m.kind] or rng.random()<DROP_CHANCE[m.kind]
    if not dropped:
        pity[m.kind]=misses+1
        return None
    pity[m.kind]=0
    quality=max_quality(floor)
    # At high floors, common enemies usually drop one tier below maximum.
    if m.kind in ('normal','elite') and quality>1:
        quality-=1
    return {'item':f'bone_{m.target_slot}_{quality}','slot':m.target_slot,
            'quality':quality,'quality_name':QUALITY[quality-1],
            'monster':m.name,'kind':m.kind,'floor':floor}

def award_victory(save, floor:int, rng=None):
    """One roll per actual victory; no automatic progress or floor advancement."""
    from save_game import validate
    validate(save)
    if type(floor) is not int or floor<1 or floor>save.record_floor:
        raise ValueError('Victory floor must be within recorded progress')
    # Snapshot for failure safety.
    pity=dict(save.bone_drop_pity)
    result=roll_bone(floor,pity,rng)
    save.bone_drop_pity=pity
    if result:
        item=result['item']
        save.bone_inventory[item]=save.bone_inventory.get(item,0)+1
    validate(save)
    return result
