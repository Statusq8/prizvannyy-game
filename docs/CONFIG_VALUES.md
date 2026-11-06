# Текущие числа игры (CONFIG)

Сгенерировано `npm run docs` из `src/core/00*_config_*.js`. **Не править вручную** — меняйте CONFIG и перегенерируйте.
Это единственный источник чисел; GDD ссылается на ключи (`CONFIG.ritual.floor`).

| Ключ | Значение |
|---|---|
| `saveVersion` | `34` |
| `enemiesPerFloor` | `10` |
| `allyUlts` | `false` |
| `maxFloor` | `null` |
| `maxTapsPerSec` | `15` |
| `enemyBaseHp` | `10` |
| `enemyHpGrowth` | `1.24` |
| `floorCurve.knee` | `100` |
| `floorCurve.slope` | `0.99` |
| `floorCurve.late` | `0.6` |
| `bossHpMult` | `6` |
| `bossTimeSec` | `30` |
| `goldBase` | `0.25` |
| `goldGrowth` | `1.137` |
| `bossGoldMult` | `8` |
| `firstClearGoldMult` | `20` |
| `tapBaseDamage` | `1` |
| `tapUpgradeBaseCost` | `5` |
| `tapUpgradeCostGrowth` | `1.12` |
| `respawnDelaySec` | `0.35` |
| `milestones` | `[10,25,50,75,100]` |
| `milestoneEvery` | `25` |
| `milestoneMult` | `2` |
| `crit.baseChance` | `0.05` |
| `crit.maxChance` | `0.75` |
| `crit.baseMult` | `2` |
| `softcap.start` | `1000000` |
| `softcap.power` | `0.5` |
| `softcap.goldStart` | `10000` |
| `legacyCritRefund.chanceCost` | `100` |
| `legacyCritRefund.chanceGrowth` | `1.22` |
| `legacyCritRefund.multCost` | `150` |
| `legacyCritRefund.multGrowth` | `1.16` |
| `abilities` | `[{"id":"flurry","name":"Шквал ударов","unlockFloor":5,"cooldown":60,"duration":5,"tapsPerSec":10},{"id":"hunt","name":"Клеймо охотника","unlockFloor":15,"coo…` |
| `rarities` | `["E","D","C","B","A","S","SS","SSS","GOD"]` |
| `rarityGates.SS` | `1000` |
| `rarityGates.SSS` | `2500` |
| `rarityGates.GOD` | `4000` |
| `squadSize` | `4` |
| `reserveShare` | `1` |
| `maxStars` | `15` |
| `starDpsBonus` | `0.5` |
| `starCopies` | `[1,1,2,2,3,1,1,1,1,1,2,2,2,2,2]` |
| `starFodder` | `[0,0,0,0,0,2,3,4,5,6,6,7,8,9,10]` |
| `portal.odds` | `{"E":40,"D":28,"C":17,"B":9,"A":4.5,"S":1.2,"SS":0.6,"SSS":0.3,"GOD":0.15}` |
| `portal.pityA` | `10` |
| `portal.pityS` | `100` |
| `portal.ticketsPerFifth` | `1` |
| `portal.ticketsPerTenth` | `3` |
| `portal.softS` | `70` |
| `portal.softStep` | `3` |
| `portal.banners` | `[{"id":"normal","name":"Обычный призыв","icon":"🌀","cost":{"tickets":1},"desc":"Все герои портала"},{"id":"rare","name":"Редкий призыв","icon":"💠","cost":{…` |
| `souls.dpsPerSoul` | `0.1` |
| `unlocks.ult` | `5` |
| `unlocks.quests` | `5` |
| `unlocks.login` | `5` |
| `unlocks.portal` | `25` |
| `unlocks.shop` | `100` |
| `unlocks.artifacts` | `50` |
| `unlocks.pve` | `100` |
| `unlocks.runes` | `150` |
| `unlocks.forge` | `50` |
| `unlocks.ritual` | `150` |
| `unlocks.tree` | `200` |
| `unlocks.events` | `250` |
| `unlocks.season` | `250` |
| `unlocks.altar` | `300` |
| `unlocks.alchemy` | `400` |
| `unlocks.echo` | `500` |
| `unlocks.curse` | `500` |
| `unlocks.secret` | `750` |
| `unlocks.totems` | `750` |
| `unlocks.pets` | `1250` |
| `unlocks.shadow` | `1250` |
| `unlocks.bones` | `2000` |
| `disabled` | `["pve","runes","tree","events","season","altar","alchemy","echo","curse","secret","totems","pets","shadow","bones","mail","map","prestige","bag","tutorial","…` |
| `megaSouls.base` | `5` |
| `megaSouls.per50` | `1.25` |
| `cage.floor` | `3` |
| `cage.ally` | `"shorokh"` |
| `cage.taps` | `20` |
| `cage.name` | `"Клетка с Тилем"` |
| `ritual.floor` | `150` |
| `ritual.soulsBase` | `500` |
| `ritual.soulsGrowth` | `1.08` |
| `ritual.light` | `{"crystals":100,"mult":2}` |
| `ritual.soulsKnee` | `1000` |
| `ritual.recordBonus` | `1` |
| `ritual.milestones` | `[{"n":1,"title":"Пробуждённый","bonus":{"kind":"allDmg","per":0.05},"reward":{"tickets":10,"crystals":20}},{"n":10,"title":"Жрец Башни","bonus":{"kind":"gold…` |
| `artifactFind.cost` | `3` |
| `artifactFind.growth` | `1.7` |
| `goldHire.maxRarity` | `"B"` |
| `market.slots` | `16` |
| `market.refreshSec` | `10800` |
| `market.refreshCost` | `20` |
| `market.goods` | `[{"id":"ticket1","kind":"tickets","n":1,"cur":"souls","mega":0.3,"w":3,"name":"Билет призыва"},{"id":"ticket5","kind":"tickets","n":5,"cur":"crystal","price"…` |
| `crystals.megaFirst` | `20` |
| `artShop.slots` | `3` |
| `artShop.refreshDiv` | `3` |
| `artShop.blood` | `{"cost":30,"growth":2.2}` |
| `artifacts` | список, 15 шт. — см. src/core.js |
| `materials.shard` | `{"name":"Осколок Башни","icon":"🔹"}` |
| `materials.heart` | `{"name":"Сердце стража","icon":"🔥"}` |
| `materials.shardsPerBoss` | `1` |
| `materials.shardsFloorStep` | `25` |
| `materials.mobShardChance` | `0.08` |
| `materials.mobShardShare` | `0.3` |
| `materials.heartEvery` | `50` |
| `materials.heartRecipe` | `40` |
| `evolution.stages` | `[{"name":"Пробуждение","stars":3,"shards":30,"hearts":0,"mult":2},{"name":"Возвышение","stars":6,"shards":150,"hearts":1,"mult":2},{"name":"Истинный облик","…` |
| `evolution.rarityCost` | `{"E":1,"D":1.5,"C":2,"B":3,"A":4,"S":6,"SS":7,"SSS":8.5,"GOD":10}` |
| `offline.maxSec` | `43200` |
| `offline.minSec` | `60` |
| `offline.minKillSec` | `0.5` |
| `biomeFloors` | `50` |
| `biomes` | список, 20 шт. — см. src/core.js |
| `hallFloors` | `10` |
| `halls` | список, 5 шт. — см. src/core.js |
| `finalBossHpMult` | `1.5` |
| `rare.minFloor` | `10` |
| `rare.kinds` | `[{"id":"gold","name":"Золотой гоблин","hp":2,"gold":15,"shards":0,"weight":3},{"id":"crystal","name":"Кристальный ёж","hp":4,"gold":2,"shards":1,"weight":1},…` |
| `bossPhases.normal` | `[0.5]` |
| `bossPhases.final` | `[0.66,0.33]` |
| `bossPhases.vulnSec` | `3` |
| `bossPhases.vulnMult` | `1.5` |
| `soulTree` | `[{"id":"war","name":"Боевая ветвь","rituals":1,"nodes":[{"id":"fury","name":"Ярость призванного","icon":"⚔","kind":"heroDmg","per":0.3,"cost":2,"growth":1.3,…` |
| `runes.kinds` | `[{"id":"might","name":"Руна мощи","icon":"ᚦ","kind":"allDmg","base":0.1,"desc":"всего урона"},{"id":"host","name":"Руна отряда","icon":"ᚱ","kind":"allyDmg","…` |
| `runes.createCost` | `25` |
| `runes.tierPower` | `2` |
| `runes.perLevel` | `0.15` |
| `runes.maxLevel` | `10` |
| `runes.upCost` | `10` |
| `runes.upGrowth` | `1.3` |
| `runes.mergeCount` | `3` |
| `totems.dpsPerLevel` | `0.1` |
| `totems.collection` | `[5,10,15,20]` |
| `totems.collectionMult` | `1.25` |
| `totems.maxLevel` | `20` |
| `totems.upShards` | `50` |
| `totems.upGrowth` | `1.4` |
| `totems.heartEvery` | `5` |
| `pve.dungeons` | `[{"id":"vault","name":"Сокровищница","icon":"◆","reward":"gold","desc":"Много золота для текущего забега"},{"id":"mine","name":"Шахта осколков","icon":"🔹","…` |
| `pve.dailyAttempts` | `2` |
| `pve.dungeonEnemies` | `6` |
| `pve.dungeonTime` | `45` |
| `pve.tierFloors` | `10` |
| `pve.vaultGold` | `30` |
| `pve.mineShards` | `5` |
| `pve.forgeTierEvery` | `10` |
| `pve.echo` | `{"attempts":3,"enemies":10,"time":60,"floorPct":0.85,"minFloor":50,"mods":[{"id":"noTap","name":"Без тапов","rule":"alliesOnly","text":"тапы не наносят урона…` |
| `pve.endless` | `{"attempts":3,"bossEvery":10,"hpMult":3,"bossTime":30,"essenceBase":1,"essenceStep":20}` |
| `pve.trial` | `{"attempts":3,"tapDmg":1,"hpBase":20,"hpStep":6,"time":15,"essencePer":2}` |
| `pve.personal` | `{"attempts":3,"time":40,"diffs":[{"id":"normal","name":"Обычный","hp":1,"hearts":1,"shards":2},{"id":"hard","name":"Сложный","hp":5,"hearts":2,"shards":5},{"…` |
| `quests` | список, 4 ключей — см. src/core.js |
| `achievements` | список, 2 ключей — см. src/core.js |
| `factions` | список, 10 шт. — см. src/core.js |
| `sides.Свет` | `["Свет","Буря","Лёд"]` |
| `sides.Тьма` | `["Нежить","Кровь","Пламя"]` |
| `sides.Дикие` | `["Война","Дикий лес"]` |
| `sides.Тени` | `["Тени","Бездна"]` |
| `roles.nuke` | `"Удар"` |
| `roles.teamBuff` | `"Усиление отряда"` |
| `roles.mark` | `"Метка"` |
| `roles.tapBuff` | `"Усиление героя"` |
| `roles.critBuff` | `"Криты"` |
| `presets` | список, 0 ключей — см. src/core.js |
| `curse` | список, 4 ключей — см. src/core.js |
| `alchemy.maxSec` | `7200` |
| `alchemy.potions` | `[{"id":"gold","name":"Зелье алчности","icon":"🧪","kind":"gold","mult":2,"sec":1800,"shardsPer":15,"essence":0,"desc":"×2 золота"},{"id":"dmg","name":"Зелье …` |
| `towerMs.list` | `[{"at":1000,"hero":"seiren","copies":5,"reward":{"tickets":20}},{"at":2500,"pet":"griffin","frags":60,"reward":{"essence":100}},{"at":5000,"art":"crown","lev…` |
| `towerMs.every` | `50000` |
| `towerMs.after` | `{"tickets":100,"essence":500}` |
| `diary` | список, 4 ключей — см. src/core.js |
| `secret` | список, 4 ключей — см. src/core.js |
| `prestige.base` | `500` |
| `prestige.power` | `1.5` |
| `prestige.xp` | `{"floor":1,"ritual":200,"hero":100,"star":20,"ach":50,"trophy":30,"page":150,"title":300,"secret":500}` |
| `prestige.reward` | `{"tickets":2,"essence":10}` |
| `prestige.frameEvery` | `10` |
| `prestige.frames` | `["Бронзовая","Серебряная","Золотая","Платиновая","Изумрудная","Алмазная","Кровавая","Теневая","Звёздная","Божественная"]` |
| `transfer.keep` | `0.7` |
| `transfer.essence` | `50` |
| `trophies` | список, 2 ключей — см. src/core.js |
| `bonds` | список, 12 шт. — см. src/core.js |
| `ranks.count` | `10` |
| `ranks.subs` | `10` |
| `ranks.capMin` | `1000` |
| `ranks.capMax` | `15000` |
| `ranks.shards` | `50` |
| `ranks.growth` | `1.07` |
| `ranks.evoFor` | `{"3":1,"6":2,"9":3}` |
| `ranks.extra` | `[]` |
| `season` | список, 18 ключей — см. src/core.js |
| `events` | список, 9 ключей — см. src/core.js |
| `dailyGift.tickets` | `1` |
| `login.days` | `[{"tickets":1},{"crystals":5},{"tickets":1},{"tickets":1},{"crystals":10},{"tickets":2},{"tickets":5,"crystals":30},{"tickets":1},{"crystals":10},{"tickets":…` |
| `login.big` | `[7,14,21,28,30]` |
| `timeTravel.hours` | `4` |
| `timeTravel.freePerDay` | `1` |
| `timeTravel.ticketCost` | `3` |
| `timeTravel.paidPerDay` | `2` |
| `questChests` | `[{"need":1,"reward":{"crystals":5}},{"need":2,"reward":{"tickets":1}},{"need":4,"reward":{"tickets":2,"crystals":10}}]` |
| `classes.unlockFloor` | `100` |
| `classes.pointsPerFloors` | `25` |
| `classes.pointsPerRitual` | `3` |
| `classes.list` | `[{"id":"blade","name":"Мастер клинка","icon":"⚔","desc":"Сила тапов и способностей героя","nodes":[{"id":"b1","name":"Острая сталь","kind":"heroDmg","per":0.…` |
| `booster.name` | `"Печать силы"` |
| `booster.power` | `3` |
| `booster.unlockFloor` | `150` |
| `booster.cooldownH` | `8` |
| `bones` | список, 18 ключей — см. src/core.js |
| `pets` | список, 16 ключей — см. src/core.js |
| `collection.perHero` | `0.01` |
| `collection.perStar` | `0.01` |
| `collection.setAlly` | `0.1` |
| `perks` | `[{"lvl":10,"name":"Закалка","kind":"own","value":1},{"lvl":25,"name":"Верное оружие","kind":"own","value":1},{"lvl":50,"name":"Мастерство","kind":"own","valu…` |
| `heroAutoInterval` | `1` |
| `heroAutoMaxTps` | `10` |
| `passives.levelStep` | `50` |
| `passives.base` | `{"allDmg":0.02,"tapDmg":0.03,"allyDmg":0.03,"gold":0.03,"critChance":0.0005,"critMult":0.02,"bossDmg":0.03,"bossTime":0.02,"shards":0.02}` |
| `passives.rarity` | `{"E":1,"D":1.1,"C":1.2,"B":1.35,"A":1.5,"S":1.75,"SS":2,"SSS":2.25,"GOD":2.5}` |
| `passives.names` | `{"allDmg":"урон всех","tapDmg":"урон тапа","allyDmg":"урон героев","gold":"золото","critChance":"шанс крита","critMult":"сила крита","bossDmg":"урон по босса…` |
| `passives.heroes` | `{"shorokh":["gold","Ловкие пальцы"],"kostik":["bossTime","Держать строй"],"shmyg":["critMult","Бум!"],"lumi":["tapDmg","Неугасимый фонарь"],"irene":["critCha…` |
| `biomeTitles.dmg` | `0.25` |
| `biomeTitles.gold` | `0.25` |
| `special.minFloor` | `31` |
| `special.chance` | `0.02` |
| `special.hpMult` | `40` |
| `special.timeSec` | `30` |
| `special.cooldownSec` | `120` |
| `special.name` | `"Посланник Башни"` |
| `special.chest` | `{"goldKills":20,"shardBoss":1,"ticketChance":0.3,"tickets":1}` |
| `altar.essence` | `{"E":1,"D":2,"C":4,"B":8,"A":16,"S":40,"SS":60,"SSS":80,"GOD":100}` |
| `altar.ticketCost` | `30` |
| `altar.traceCost` | `{"E":10,"D":20,"C":40,"B":80,"A":160,"S":400,"SS":600,"SSS":800,"GOD":1000}` |
| `altar.rareConfirmFrom` | `"A"` |
| `allies` | список, 52 шт. — см. src/core.js |
