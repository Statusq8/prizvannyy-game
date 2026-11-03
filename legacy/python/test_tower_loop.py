import unittest
from save_game import GameSave
from tower_loop import start_battle,fight_tick,hire_hero,level_hero,enemy_hp,restart_run
from game_core import HEROES

class TowerTests(unittest.TestCase):
    def setUp(self):
        self.hid=next(h for h in HEROES if HEROES[h]['rarity']=='E')
        self.s=GameSave(owned={self.hid},stars={self.hid:1},gold=100000)
    def test_enemy_hp(self):
        self.assertGreater(enemy_hp(10),enemy_hp(9))
    def test_hire_and_level(self):
        hire_hero(self.s,self.hid)
        level_hero(self.s,self.hid)
        self.assertEqual(self.s.hired[self.hid],2)
    def test_victory_once(self):
        hire_hero(self.s,self.hid)
        b=start_battle(self.s)
        e=fight_tick(self.s,b,100)
        self.assertEqual(e['event'],'victory')
        self.assertEqual(self.s.floor,2)
        with self.assertRaises(ValueError): fight_tick(self.s,b,1)
    def test_no_damage_without_hired(self):
        b=start_battle(self.s)
        self.assertEqual(fight_tick(self.s,b,1)['event'],'hit')
        self.assertEqual(b.hp,b.max_hp)
    def test_bad_delta(self):
        with self.assertRaises(ValueError): fight_tick(self.s,start_battle(self.s),-1)
    def test_rebirth(self):
        self.s.floor=400;self.s.record_floor=400
        restart_run(self.s)
        self.assertEqual(self.s.floor,1)
        self.assertEqual(self.s.owned,{self.hid})
    def test_no_hire_locked(self):
        hid=next(h for h in HEROES if HEROES[h]['rarity']=='SS')
        with self.assertRaises(ValueError): hire_hero(self.s,hid)

if __name__=='__main__': unittest.main()
