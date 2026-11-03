import unittest, random
from portal_v01 import *
class TestPortal(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.heroes=load_catalog()
    def test_rates_sum(self):
        for floor in [1,400,999,1000,3999,4000,10000]:
            self.assertAlmostEqual(sum(available_rates(floor).values()),1)
    def test_gates(self):
        for floor in [1,400,999]:
            s=PortalState(scrolls=2000,record_floor=floor)
            results=summon_many_for_test(s,self.heroes,2000)
            self.assertFalse(any(x['rarity'] in ('SS','БОГ') for x in results))
        s=PortalState(scrolls=2000,record_floor=1000)
        self.assertNotIn('БОГ',available_rates(s.record_floor))
        self.assertIn('SS',available_rates(s.record_floor))
        self.assertIn('БОГ',available_rates(4000))
    def test_pity(self):
        s=PortalState(scrolls=1,pulls_since_a=99,record_floor=1)
        self.assertIn(summon(s,self.heroes,random.Random(2))[0]['rarity'],['A','S'])
        s=PortalState(scrolls=1,pulls_since_s=499,record_floor=1)
        self.assertEqual(summon(s,self.heroes,random.Random(2))[0]['rarity'],'S')
    def test_duplicate(self):
        s=PortalState(scrolls=10)
        r=summon(s,self.heroes,random.Random(7),10)
        self.assertEqual(s.scrolls,0)
        self.assertEqual(s.total_pulls,10)
        self.assertTrue(any(x['duplicate'] for x in r))
        self.assertTrue(all(x['id'] in s.owned for x in r))
    def test_insufficient(self):
        with self.assertRaises(ValueError): summon(PortalState(),self.heroes,count=1)
    def test_not_rebirth_locked(self):
        s=PortalState(scrolls=1,record_floor=1000)
        self.assertIn('SS',available_rates(s.record_floor))

def summon_many_for_test(s,heroes,n):
    rng=random.Random(4); result=[]
    for _ in range(n//10):result.extend(summon(s,heroes,rng,10))
    return result
if __name__=='__main__':unittest.main()
