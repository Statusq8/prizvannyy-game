import unittest
from save_game import GameSave
from floor_farm import new_selector, choose_floor, resume_climb, battle_once, repeat_farm

class FloorFarmTests(unittest.TestCase):
    def setUp(self):
        self.s=GameSave(floor=250,record_floor=250,owned={'ash_recruit'} if False else set())
        # Use the catalog's first valid hero to avoid assumptions about IDs.
        from game_core import HEROES
        h=next(h for h,v in HEROES.items() if v['rarity']=='E')
        self.s.owned={h}; self.s.hired={h:250}
        self.sel=new_selector(self.s)

    def test_choose_230(self):
        choose_floor(self.s,self.sel,230)
        self.assertEqual(self.sel.selected,230)
        self.assertEqual(self.s.floor,250)

    def test_reject_future_and_invalid(self):
        for f in (0,250,251,-1,1.5,True):
            with self.assertRaises(ValueError): choose_floor(self.s,self.sel,f)

    def test_farm_repeat_gold_no_progress(self):
        choose_floor(self.s,self.sel,230)
        before=self.s.gold
        r=repeat_farm(self.s,self.sel,3,1e20)
        self.assertEqual(len(r),3)
        self.assertTrue(all(x['event']=='farm_victory' for x in r))
        self.assertGreater(self.s.gold,before)
        self.assertEqual(self.s.floor,250)
        self.assertEqual(self.s.record_floor,250)
        self.assertEqual(self.s.bone_inventory,{})
        self.assertEqual(self.s.bone_drop_pity,{})

    def test_no_free_gold_without_kill(self):
        choose_floor(self.s,self.sel,230)
        r=battle_once(self.s,self.sel,1e-12)
        self.assertEqual(r['event'],'fighting')
        self.assertEqual(self.s.gold,0)

    def test_resume(self):
        choose_floor(self.s,self.sel,230)
        resume_climb(self.s,self.sel)
        self.assertIsNone(self.sel.selected)

    def test_rebirth_selector_rejected(self):
        choose_floor(self.s,self.sel,230)
        self.s.floor=1
        with self.assertRaises(ValueError): battle_once(self.s,self.sel,10)

    def test_repeat_requires_selected(self):
        with self.assertRaises(ValueError): repeat_farm(self.s,self.sel,2,10)

if __name__=='__main__': unittest.main()
