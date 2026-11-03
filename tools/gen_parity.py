"""Эталонные значения из legacy/python/game_core.py для теста паритета JS. Запуск: cd legacy/python && python3 ../../tools/gen_parity.py"""
import json,sys,os
sys.path.insert(0,os.getcwd())
from game_core import army_dps, personal_dps, level_cost
cases=[]
confs=[{'e_ash_recruit':1},{'e_ash_recruit':10,'e_bone_servant':55},{'d_lane':120,'d_dark_acolyte':101,'b_ash_necromancer':160},
       {'c_grove_keeper':520,'s_blood_reaper':240,'a_white_paladin':99,'e_swamp_thief':100},{'s_bone_lord':1000,'c_beast_tamer':260}]
for c in confs:
    for t in ('normal','boss'):
        cases.append({'hired':c,'target':t,'main':123.0,'army':army_dps(c,t,123.0)})
pd=[{'id':h,'lv':lv,'dps':personal_dps(h,lv)} for h in ['e_ash_recruit','b_venom_fang','god_fate_devourer'] for lv in [1,9,10,75,150,224,225,300,1000]]
lc=[{'id':h,'lv':lv,'cost':level_cost(h,lv)} for h in ['e_ash_recruit','a_ariel'] for lv in [1,10,100,250]]
json.dump({'army':cases,'personal':pd,'levelCost':lc},open('../../work/tests/fixtures/python_parity.json','w'),indent=1)
print(len(cases),len(pd),len(lc))
