import unittest
from game_core import HEROES
from bones import SLOTS
from save_game import GameSave, rebirth
from simple_bones import hero_bones_status, absorb, raise_rank, loot_after_victory

HERO = next(k for k,v in HEROES.items() if v['rarity']=='E')

class SimpleBonesTests(unittest.TestCase):
    def test_initial_status(self):
        s=GameSave(owned={HERO})
        info=hero_bones_status(s,HERO)
        self.assertEqual((info['filled'],info['total'],info['next_rank']),(0,6,'D'))
        self.assertEqual(len(info['slots']),6)
    def test_complete_cycle(self):
        s=GameSave(owned={HERO}, bone_inventory={f'bone_{p}_1':1 for p in SLOTS})
        for p in SLOTS: absorb(s,HERO,p)
        self.assertTrue(hero_bones_status(s,HERO)['can_promote'])
        raise_rank(s,HERO)
        info=hero_bones_status(s,HERO)
        self.assertEqual((info['rank'],info['filled'],info['required_quality']),( 'D',0,'необычная'))
    def test_rank_survives_rebirth(self):
        s=GameSave(owned={HERO},floor=400,record_floor=400,bone_inventory={f'bone_{p}_1':1 for p in SLOTS})
        for p in SLOTS: absorb(s,HERO,p)
        raise_rank(s,HERO); rebirth(s)
        self.assertEqual(hero_bones_status(s,HERO)['rank'],'D')
    def test_no_special_effects_in_result(self):
        s=GameSave(owned={HERO},bone_inventory={'bone_head_1':1})
        result=absorb(s,HERO,'head')
        self.assertEqual(set(result),{'slot','quality','quality_name','absorbed'})
    def test_loot_is_inventory_bone(self):
        s=GameSave(record_floor=50)
        result=loot_after_victory(s,50)
        self.assertIsNotNone(result)
        self.assertEqual(s.bone_inventory[result['item']],1)
    def test_unowned_hero_rejected(self):
        with self.assertRaises(ValueError):hero_bones_status(GameSave(),HERO)

if __name__=='__main__': unittest.main()
