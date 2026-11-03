import unittest, random, tempfile
from pathlib import Path
from monster_drops import monster_at, max_quality, roll_bone, award_victory, PITY_LIMIT
from save_game import GameSave,save,load,rebirth

class MonsterDropTests(unittest.TestCase):
    def test_boss_every_ten(self):
        self.assertEqual(monster_at(10).kind,'boss')
        self.assertEqual(monster_at(50).kind,'zone_boss')
        self.assertEqual(monster_at(25).kind,'elite')
    def test_zone_eight(self): self.assertEqual(monster_at(400).zone,'Царство смерти')
    def test_quality_gates(self):
        self.assertEqual(max_quality(999),5)
        self.assertEqual(max_quality(1000),6)
        self.assertEqual(max_quality(3999),6)
        self.assertEqual(max_quality(4000),7)
    def test_deterministic_drop(self):
        self.assertEqual(roll_bone(50,{},random.Random(5))['quality'],1)
    def test_pity_guarantees(self):
        pity={'boss':PITY_LIMIT['boss']-1}
        self.assertIsNotNone(roll_bone(10,pity,random.Random(0)))
        self.assertEqual(pity['boss'],0)
    def test_misses_increment(self):
        pity={};self.assertIsNone(roll_bone(1,pity,random.Random(0)))
        self.assertEqual(pity['normal'],1)
    def test_victory_awards_inventory(self):
        s=GameSave(floor=50,record_floor=50)
        drop=award_victory(s,50,random.Random(0))
        self.assertEqual(s.bone_inventory[drop['item']],1)
    def test_cannot_farm_unreached_floor(self):
        with self.assertRaises(ValueError):award_victory(GameSave(),4000)
    def test_persists_rebirth_and_disk(self):
        s=GameSave(floor=400,record_floor=400)
        award_victory(s,50,random.Random(0))
        rebirth(s)
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'save.json';save(s,path)
            self.assertEqual(load(path).bone_inventory,s.bone_inventory)
            self.assertEqual(load(path).bone_drop_pity,s.bone_drop_pity)
    def test_legacy_v2_migration(self):
        from save_game import to_dict,from_dict
        d=to_dict(GameSave());d['version']=2;d.pop('bone_drop_pity')
        self.assertEqual(from_dict(d).bone_drop_pity,{})

if __name__=='__main__':unittest.main()
