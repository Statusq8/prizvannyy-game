import unittest
from game_core import HEROES
from save_game import GameSave
from auto_progress import AutoSettings,best_purchase,auto_shop,auto_step,can_advance

E=next(h for h in HEROES if HEROES[h]['rarity']=='E')
class AutoProgressTests(unittest.TestCase):
    def setup_save(self,gold=100000):
        return GameSave(owned={E},stars={E:1},gold=gold)
    def test_auto_hire(self):
        s=self.setup_save(); acts=auto_shop(s,max_purchases=1)
        self.assertEqual(acts[0]['action'],'hire');self.assertIn(E,s.hired)
    def test_auto_level(self):
        s=self.setup_save();auto_shop(s,max_purchases=2)
        self.assertGreaterEqual(s.hired[E],2)
    def test_no_uncollected_hire(self):
        s=GameSave(gold=10**12);self.assertIsNone(best_purchase(s))
    def test_no_money(self):
        s=self.setup_save(0);self.assertEqual(auto_shop(s),[])
    def test_stall_without_hero(self):
        s=self.setup_save(0);self.assertEqual(auto_step(s)['event'],'stalled')
    def test_advances(self):
        s=self.setup_save();result=auto_step(s,AutoSettings(target_kill_seconds=1000),max_purchases=1)
        self.assertEqual(result['event'],'victory');self.assertEqual(s.floor,2)
    def test_farm_no_floor_advance(self):
        s=self.setup_save(0);s.hired={E:1};s.floor=10;s.record_floor=10
        result=auto_step(s,AutoSettings(target_kill_seconds=.001),max_purchases=0)
        self.assertEqual(result['event'],'farm');self.assertEqual(s.floor,10);self.assertGreater(s.gold,0)
    def test_bad_limit(self):
        with self.assertRaises(ValueError):auto_shop(self.setup_save(),max_purchases=-1)
    def test_no_auto_hire(self):
        s=self.setup_save();self.assertEqual(auto_shop(s,AutoSettings(auto_hire=False)),[])
if __name__=='__main__':unittest.main()
