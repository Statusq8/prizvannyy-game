"""Тесты bones.py v1.1 — по утверждённым правилам MASTER_PLAN 1.5:
кости поглощаются по одной в пустой слот, нужна точная редкость следующего ранга,
при повышении ранга кости расходуются и слоты очищаются, гейты SS=1000 / БОГ=4000.
(Старая версия теста проверяла отменённую механику improve_bone v1.0.)"""
import unittest
from bones import BoneProgress, SLOTS, absorb_bone, promote, next_rank, required_quality, from_dict, to_dict


def full_inventory(quality):
    return {f'bone_{s}_{quality}': 1 for s in SLOTS}


def absorb_all(p, inv):
    for s in SLOTS:
        absorb_bone(p, s, inv)


class TestBones(unittest.TestCase):
    def test_six_slots(self):
        self.assertEqual(len(SLOTS), 6)

    def test_absorb_consumes_exact_quality(self):
        p = BoneProgress(); inv = {'bone_head_1': 1}
        absorb_bone(p, 'head', inv)
        self.assertEqual(p.bones['head'], 1); self.assertEqual(inv['bone_head_1'], 0)

    def test_missing_bone_is_atomic(self):
        p = BoneProgress()
        with self.assertRaises(ValueError): absorb_bone(p, 'head', {})
        self.assertEqual(p.bones['head'], 0)

    def test_wrong_quality_rejected(self):
        p = BoneProgress(); inv = {'bone_head_2': 1}
        with self.assertRaises(ValueError): absorb_bone(p, 'head', inv)
        self.assertEqual(inv['bone_head_2'], 1)

    def test_filled_slot_rejected(self):
        p = BoneProgress(); inv = {'bone_head_1': 2}
        absorb_bone(p, 'head', inv)
        with self.assertRaises(ValueError): absorb_bone(p, 'head', inv)
        self.assertEqual(inv['bone_head_1'], 1)

    def test_incomplete_cannot_promote(self):
        p = BoneProgress(); inv = {'bone_head_1': 1}
        absorb_bone(p, 'head', inv)
        with self.assertRaises(ValueError): promote(p, 4000)
        self.assertEqual(p.rank, 'E')

    def test_complete_promote_consumes_bones(self):
        p = BoneProgress(); absorb_all(p, full_inventory(1)); promote(p, 1)
        self.assertEqual(p.rank, 'D'); self.assertTrue(all(v == 0 for v in p.bones.values()))
        self.assertEqual(required_quality(p), 2)

    def test_ss_gate(self):
        p = BoneProgress(rank='S'); absorb_all(p, full_inventory(6))
        with self.assertRaises(ValueError): promote(p, 999)
        self.assertEqual(p.rank, 'S')
        promote(p, 1000); self.assertEqual(p.rank, 'SS')

    def test_god_gate(self):
        p = BoneProgress(rank='SS'); absorb_all(p, full_inventory(7))
        with self.assertRaises(ValueError): promote(p, 3999)
        promote(p, 4000); self.assertEqual(p.rank, 'БОГ')

    def test_max_rank(self):
        p = BoneProgress(rank='БОГ')
        self.assertIsNone(next_rank(p))
        with self.assertRaises(ValueError): promote(p, 4000)

    def test_serialization(self):
        p = BoneProgress(rank='B', bones={s: 4 for s in SLOTS})
        self.assertEqual(from_dict(to_dict(p)), p)


if __name__ == '__main__':
    unittest.main()
