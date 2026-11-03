import unittest
from stars import *
from game_core import HEROES,personal_dps,army_dps,rebirth

H=next(iter(HEROES))
class StarsTests(unittest.TestCase):
 def test_total(self):
  self.assertEqual(cumulative_cost(),{'fragments':9990,'essence':120,'core':31,'seal':6})
 def test_multipliers(self):
  self.assertEqual(multiplier(1),1)
  self.assertGreater(multiplier(15),multiplier(14))
 def test_invalid(self):
  for x in (0,16,1.5):
   with self.assertRaises(ValueError):multiplier(x)
 def test_atomic_purchase(self):
  s=StarState(unlocked={H},fragments={H:20})
  ascend(s,H)
  self.assertEqual(s.stars[H],2)
  with self.assertRaises(ValueError):ascend(s,H)
  self.assertEqual(s.stars[H],2)
 def test_locked(self):
  with self.assertRaises(ValueError):ascend(StarState(),H)
 def test_portal_integration(self):
  s=StarState()
  apply_portal_result(s,{'id':H,'duplicate':False,'fragments':0})
  apply_portal_result(s,{'id':H,'duplicate':True,'fragments':20})
  self.assertEqual(s.fragments[H],20)
 def test_dps_integration(self):
  self.assertAlmostEqual(personal_dps(H,100,5)/personal_dps(H,100),multiplier(5))
  self.assertAlmostEqual(army_dps({H:100},stars={H:5})/army_dps({H:100}),multiplier(5))
 def test_rebirth_persistence(self):
  s=rebirth({H:10},400,[H],{H:8},{},{},0)
  self.assertEqual(s['stars'][H],8)
  self.assertEqual(s['hired'],{})
 def test_cap(self):
  s=StarState(unlocked={H},stars={H:15},fragments={H:99999})
  with self.assertRaises(ValueError):ascend(s,H)
if __name__=='__main__':unittest.main()
