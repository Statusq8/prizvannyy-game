import unittest
from bones import *
from save_game import GameSave,upgrade_hero_bone,promote_hero_rank,to_dict,from_dict,rebirth
from game_core import HEROES

class AbsorptionTests(unittest.TestCase):
 def test_six_parts(self):
  self.assertEqual(set(SLOTS),{'head','back','left_arm','right_arm','left_leg','right_leg'})
 def test_absorption_consumes_and_no_repeat(self):
  p=BoneProgress();inv={'bone_head_1':2}
  absorb_bone(p,'head',inv);self.assertEqual(inv['bone_head_1'],1)
  with self.assertRaises(ValueError):absorb_bone(p,'head',inv)
 def test_promotion_clears_parts(self):
  p=BoneProgress();inv={f'bone_{s}_1':1 for s in SLOTS}
  for s in SLOTS:absorb_bone(p,s,inv)
  promote(p,1);self.assertEqual(p.rank,'D');self.assertTrue(all(v==0 for v in p.bones.values()))
 def test_no_partial_promotion(self):
  p=BoneProgress();p.bones['head']=1
  with self.assertRaises(ValueError):promote(p,1)
 def test_rank_gates(self):
  for rank,floor in [('S',999),('SS',3999)]:
   p=BoneProgress(rank,{s:required_quality(BoneProgress(rank)) for s in SLOTS})
   with self.assertRaises(ValueError):promote(p,floor)
 def test_save_rebirth(self):
  h=next(k for k,v in HEROES.items() if v['rarity']=='E')
  s=GameSave(owned={h},floor=400,record_floor=400)
  s.bone_inventory={f'bone_{slot}_1':1 for slot in SLOTS}
  for slot in SLOTS:upgrade_hero_bone(s,h,slot)
  promote_hero_rank(s,h)
  rebirth(s)
  self.assertEqual(from_dict(to_dict(s)).bone_sets[h]['rank'],'D')
 def test_old_v3_migrates_without_fabricating_absorption(self):
  s=GameSave();d=to_dict(s);d['version']=3
  d['bone_inventory']={'bone_skull_1':2};d['bone_sets']={}
  result=from_dict(d)
  self.assertEqual(result.bone_inventory['bone_head_1'],2)
 def test_next_quality_required(self):
  p=BoneProgress('D');inv={'bone_head_1':1}
  with self.assertRaises(ValueError):absorb_bone(p,'head',inv)

if __name__=='__main__':unittest.main()
