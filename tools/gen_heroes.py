"""Генерирует work/src/core/data_heroes.js из legacy/python/heroes_v02.json. Запуск из корня проекта."""
import json
d=json.load(open('legacy/python/heroes_v02.json'))
hs=[{'id':h['id'],'name':h['name'],'rarity':h['rarity'],'faction':h['faction'],'tags':h['tags'],
     'hire':h['base_hire_gold'],'dps':h['base_dps'],
     'passives':[{'lv':p['level'],'name':p['name'],**{k:v for k,v in p['effect'].items() if k!='stack'}} for p in h['passives']]}
    for h in d['heroes']]
js='/* Сгенерировано tools/gen_heroes.py из legacy/python/heroes_v02.json (schema 0.2.0). Не править руками. */\n'
js+='(function (PZ) { PZ.HEROES = '+json.dumps(hs,ensure_ascii=False,separators=(',',':'))+';\n'
js+='  PZ.HERO_BY_ID = Object.fromEntries(PZ.HEROES.map(h => [h.id, h]));\n'
js+='})(globalThis.PZ = globalThis.PZ || {});\n'
open('work/src/core/data_heroes.js','w').write(js); print(len(hs),'heroes')
