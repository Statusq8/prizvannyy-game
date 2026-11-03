import json,random,tempfile,unittest
from pathlib import Path
from save_game import *
from stars import multiplier
from game_core import army_dps

class SaveTests(unittest.TestCase):
 def test_round_trip(self):
  s=GameSave(scrolls=12,materials={'essence':2,'core':0,'seal':0})
  summon_heroes(s,10,random.Random(5))
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'player.json';save(s,p)
   self.assertEqual(to_dict(s),to_dict(load(p)))
   self.assertEqual(json.loads(p.read_text())['version'],VERSION)
 def test_duplicate_no_double_credit(self):
  s=GameSave(scrolls=100)
  rng=random.Random(7)
  outcomes=[]
  for _ in range(10): outcomes.extend(summon_heroes(s,10,rng))
  self.assertTrue(any(v>0 for v in s.fragments.values()))
  self.assertEqual(sum(s.fragments.values()),sum(r["fragments"] for r in outcomes))
 def test_ascend_and_rebirth(self):
  h=next(iter(HEROES))
  s=GameSave(floor=400,record_floor=400,owned={h},stars={h:1},fragments={h:20},hired={h:20},gold=200,scrolls=3)
  ascend_hero(s,h)
  rebirth(s)
  self.assertEqual(s.stars[h],2);self.assertEqual(s.floor,1)
  self.assertEqual(s.hired,{});self.assertEqual(s.scrolls,3)
  self.assertEqual(s.fragments[h],0);self.assertEqual(s.rebirths,1)
 def test_ascend_atomic_failure(self):
  h=next(iter(HEROES));s=GameSave(owned={h},stars={h:1},fragments={h:19})
  before=to_dict(s)
  with self.assertRaises(ValueError):ascend_hero(s,h)
  self.assertEqual(before,to_dict(s))
 def test_locked_rarity(self):
  h=next(k for k,v in HEROES.items() if v['rarity']=='SS')
  with self.assertRaises(ValueError):validate(GameSave(owned={h}))
 def test_floor_record(self):
  with self.assertRaises(ValueError):validate(GameSave(floor=401,record_floor=400))
 def test_version(self):
  with self.assertRaises(ValueError):from_dict({'version':VERSION+1})
 def test_rebirth_gate(self):
  with self.assertRaises(ValueError):rebirth(GameSave(floor=399,record_floor=400))
 def test_dps_from_save(self):
  h=next(iter(HEROES));s=GameSave(owned={h},stars={h:5},hired={h:50})
  self.assertAlmostEqual(army_dps(s.hired,stars=s.stars)/army_dps(s.hired),multiplier(5))
 def test_pity_persistence(self):
  s=GameSave(floor=400,record_floor=400,pulls_since_a=99,pulls_since_s=499,total_pulls=499,scrolls=1)
  result=summon_heroes(s,1,random.Random(1))
  self.assertIn(result[0]['rarity'],('S',))
  rebirth(s)
  self.assertEqual(s.total_pulls,500)
 def test_insufficient_scrolls_no_mutation(self):
  s=GameSave(scrolls=1);before=to_dict(s)
  with self.assertRaises(ValueError):summon_heroes(s,10)
  self.assertEqual(before,to_dict(s))
if __name__=='__main__':unittest.main()
