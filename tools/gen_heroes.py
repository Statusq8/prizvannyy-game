"""Генерирует work/src/core/data_heroes.js из утверждённого ростера (docs/heroes40_concept.json, концепт 03.11.2026).
Цены найма и базовый урон — по рангу на той же кривой, что и в heroes_v02.json (лог-интерполяция между мин. и макс. ранга).
Пассивки — от старого героя на той же позиции в ранге; фракционные бонусы переадресованы на фракцию нового героя (Т).
Запуск из корня проекта: python3 tools/gen_heroes.py"""
import json, math
old = json.load(open('legacy/python/heroes_v02.json'))['heroes']
roster = json.load(open('docs/heroes40_concept.json'))
IDS = ['lumi','zlatokryl','auron','serafim','kristalis','eliriya','solarion','valtar','astrael','eon',
       'kostik','morgul','grim','vorgat','nekris','malgora','rotgar','beltraks','azragor','abadron',
       'shmyg','krag','gnar','brum','skrit','urgash','taurok','fenra','gromtar','ignisar',
       'shorokh','nokt','morrak','veyl','zerik','kaeron','noktar','vargos','umbragor','erebor']
FACTIONS = ['light', 'dark', 'wild', 'shadow']          # Свет, Тьма, Дикие, Тени — по 10 в порядке концепта
UNDEAD = {'kostik', 'morgul', 'grim', 'nekris', 'rotgar', 'azragor'}
RANKS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'БОГ']
heroes = []
for i, (name, rank, desc) in enumerate(roster):
    heroes.append({'id': IDS[i], 'name': name, 'rarity': rank, 'faction': FACTIONS[i // 10], 'desc': desc,
                   'tags': ['undead'] if IDS[i] in UNDEAD else []})
out = []
for r in RANKS:
    olds = [h for h in old if h['rarity'] == r]
    # порядок внутри ранга: по фракциям вперемешку (Свет, Тьма, Дикие, Тени, затем вторые B/A)
    group = [h for h in heroes if h['rarity'] == r]
    order = sorted(group, key=lambda h: ([x for x in group if x['faction'] == h['faction']].index(h), FACTIONS.index(h['faction'])))
    n, lo, hi = len(order), olds[0], olds[-1]
    for j, h in enumerate(order):
        t = j / (n - 1) if n > 1 else 0
        hire = round(math.exp(math.log(lo['base_hire_gold']) * (1 - t) + math.log(hi['base_hire_gold']) * t))
        dps = round(math.exp(math.log(lo['base_dps']) * (1 - t) + math.log(hi['base_dps']) * t), 1)
        src = olds[min(len(olds) - 1, round(t * (len(olds) - 1)))]
        pas = []
        for p in src['passives']:
            e = {k: v for k, v in p['effect'].items() if k != 'stack'}
            if e['type'] == 'faction': e['target'] = h['faction']
            pas.append({'lv': p['level'], 'name': p['name'], **e})
        out.append({**h, 'hire': hire, 'dps': dps, 'passives': pas,
                    'ult': {'energy': 100, 'perAttack': 10, 'mult': 8}})   # Т: как у Каэрона в концепте
out.sort(key=lambda h: (RANKS.index(h['rarity']), h['hire']))
js = '/* Сгенерировано tools/gen_heroes.py из docs/heroes40_concept.json (ростер концепта 03.11.2026). Не править руками. */\n'
js += '(function (PZ) { PZ.HEROES = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n'
js += '  PZ.HERO_BY_ID = Object.fromEntries(PZ.HEROES.map(h => [h.id, h]));\n'
js += '})(globalThis.PZ = globalThis.PZ || {});\n'
open('work/src/core/data_heroes.js', 'w').write(js)
for h in out: print(h['rarity'].ljust(3), h['id'].ljust(10), h['faction'].ljust(6), str(h['hire']).rjust(14), str(h['dps']).rjust(12))
