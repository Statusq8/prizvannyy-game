import json, pathlib, unittest
P=pathlib.Path(__file__).with_name('heroes_v02.json')
class HeroDataTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls): cls.data=json.loads(P.read_text());cls.heroes=cls.data['heroes']
 def test_roster(self):
  self.assertEqual(len(self.heroes),40)
  self.assertEqual(len({h['id'] for h in self.heroes}),40)
  self.assertEqual(len({h['name'] for h in self.heroes}),40)
 def test_passives(self):
  for h in self.heroes:
   self.assertEqual({10,25,50,75,100,150,500},{p['level'] for p in h['passives']})
   self.assertEqual(len({p['id'] for p in h['passives']}),7)
   for p in h['passives']:
    if p['level'] in (10,25,50,75,150):
     self.assertEqual(p['effect']['type'],'personal_dps_multiplier')
     self.assertGreater(p['effect']['value'],1)
 def test_names(self):
  names=[p['name'] for h in self.heroes if h['rarity']!='E' for p in h['passives'] if p['level'] in (10,25,50,75,150)]
  self.assertEqual(len(names),175)
  self.assertEqual(len(set(names)),175)
 def test_rarity(self):
  for h in self.heroes:
   self.assertEqual(h['rarity_unlock_record_floor'],1000 if h['rarity']=='SS' else 4000 if h['rarity']=='БОГ' else 0)
 def test_factions(self):
  for h in self.heroes:self.assertIn(h['faction'],('light','shadow','wild'))
 def test_gdd_legacy_unchanged(self):
  old={h['id']:h for h in json.loads(P.with_name('heroes.json').read_text())['heroes']}
  for h in self.heroes:
   before=old[h['id']]
   self.assertEqual((h['base_dps'],h['base_hire_gold'],h['faction'],h['tags']),(before['base_dps'],before['base_hire_gold'],before['faction'],before['tags']))
   for lvl in (100,500):
    self.assertEqual(next(p for p in h['passives'] if p['level']==lvl),next(p for p in before['passives'] if p['level']==lvl))
if __name__=='__main__':unittest.main(verbosity=2)
