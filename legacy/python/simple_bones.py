"""Simple bone absorption gameplay API; no monster-specific effects or stats.
Uses existing save_game, bones and monster_drops systems.
"""
from bones import SLOTS, RANKS, QUALITY, BoneProgress, from_dict, required_quality
from game_core import HEROES
from monster_drops import award_victory
from save_game import validate, upgrade_hero_bone, promote_hero_rank

PART_NAMES = {
    'head': 'Голова', 'back': 'Спина',
    'left_arm': 'Левая рука', 'right_arm': 'Правая рука',
    'left_leg': 'Левая нога', 'right_leg': 'Правая нога',
}

def hero_bones_status(save, hero_id):
    """Read-only summary for UI: rank, needed rarity, six slots and readiness."""
    validate(save)
    if hero_id not in save.owned:
        raise ValueError('Герой не открыт')
    data = save.bone_sets.get(hero_id)
    progress = from_dict(data) if data else BoneProgress(rank=HEROES[hero_id]['rarity'])
    quality = required_quality(progress)
    slots = [
        {'slot': slot, 'name': PART_NAMES[slot], 'absorbed': progress.bones[slot] != 0,
         'in_inventory': save.bone_inventory.get(f'bone_{slot}_{quality}', 0) if quality else 0}
        for slot in SLOTS
    ]
    target = RANKS[RANKS.index(progress.rank) + 1] if quality else None
    return {'rank': progress.rank, 'next_rank': target,
            'required_quality': QUALITY[quality - 1] if quality else None,
            'filled': sum(x['absorbed'] for x in slots), 'total': 6,
            'can_promote': bool(target and all(x['absorbed'] for x in slots)
                                and save.record_floor >= (1000 if target == 'SS' else 4000 if target == 'БОГ' else 1)),
            'slots': slots}

def absorb(save, hero_id, part):
    """Absorb exactly one matching bone; no special effects."""
    return upgrade_hero_bone(save, hero_id, part)

def raise_rank(save, hero_id):
    """Promote only after six bones, respecting floor gates."""
    return promote_hero_rank(save, hero_id)

def loot_after_victory(save, floor, rng=None):
    """One simple bone roll, based only on floor and enemy class."""
    return award_victory(save, floor, rng)
