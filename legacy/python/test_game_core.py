import unittest
from game_core import *
class TestCore(unittest.TestCase):
 def test_roster(self):self.assertEqual(len(HEROES),40)
 def test_gates(self):
  for id,h in HEROES.items():
   gate=GATES.get(h['rarity'],0)
   self.assertTrue(can_obtain(id,gate))
   if gate:self.assertFalse(can_obtain(id,gate-1))
 def test_hire_and_upgrade(self):
  x,g=hire('e_ash_recruit',1,{},100)
  self.assertEqual((x['e_ash_recruit'],g),(1,75))
  x,g=upgrade('e_ash_recruit',x,g)
  self.assertEqual(x['e_ash_recruit'],2)
 def test_mastery(self):
  h='e_ash_recruit'
  self.assertAlmostEqual(personal_dps(h,225)/personal_dps(h,224),1.05*1.25)
  self.assertAlmostEqual(personal_dps(h,250)/personal_dps(h,249),1.05*1.25)
 def test_passive_threshold(self):
  h='e_ash_recruit'
  self.assertAlmostEqual(personal_dps(h,10)/personal_dps(h,9),1.05*1.5)
 def test_tag_bonus(self):
  bone='e_bone_servant'
  own={bone:100}
  self.assertAlmostEqual(army_dps(own)/personal_dps(bone,100),1.01)
 def test_economy(self):
  self.assertAlmostEqual(reward_multiplier({'e_swamp_thief':500}),1.05)
 def test_rebirth(self):
  s=rebirth({'e_ash_recruit':100},400,['e_ash_recruit'],{'e_ash_recruit':2},{'slot':1},{'heart':1},55)
  self.assertEqual(s['hired'],{})
  self.assertEqual(s['stars']['e_ash_recruit'],2)
  with self.assertRaises(ValueError):rebirth({},399,[],{},{},{},0)
if __name__=='__main__':unittest.main()
