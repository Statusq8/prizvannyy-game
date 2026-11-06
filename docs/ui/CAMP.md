# Лагерь (как город в Idle Heroes) — 6 ноября 2026

Цель: максимально освободить экран боя — все системы живут в зданиях лагеря.

## Ответы
1. Вход: **одна кнопка «Лагерь»** в углу экрана боя (↙), ульта — в другом углу (↘).
2. Здания: **Дом/Штаб** (герои: прокачка, звёзды, слияние), **Портал** (призыв), **Кузница** (руны, алтарь, алхимия, кости), **Ферма + Рынок** (пассивный доход/офлайн; магазин). Каждая новая функция вводит **своё здание/локацию**; здание появляется, когда функция открывается.
3. На экране боя — **минимум**: валюты, этаж, враг с HP, ульта + кнопки «Лагерь» и «Улучшить» (быстрая прокачка без выхода из боя).
4. Лор: **летающий остров** — кусок скалы рядом с Башней, связан с ней порталом.

## Правка 6 ноября — лагерь из островов, открываются постепенно
- В начале виден **только Главный остров** с основными функциями; остальное скрыто облаками. Закрытые острова **полностью спрятаны** (без силуэтов и подсказок) — сюрприз при открытии.
- Каждая новая функция = **свой островок**, он выплывает из облаков и пристыковывается мостом/цепями выше предыдущего.
- Острова стоят **столбиком вверх** вдоль Башни (выше = дальше прогресс). Экран **листается вверх-вниз** (как город Idle Heroes); влево-вправо не листается, а слегка **двигается** (панорама на ширину острова, с упором на краях).
- Порядок (этажи из ANSWERS_UNLOCKS):
  1. Главный остров — всегда: Штаб (герои, прокачка), Врата Башни (в бой)
  2. Остров Портала — этаж 25
  3. Остров Кузницы (артефакты) — этаж 50
  4. Остров Фермы и Рынка — этаж ~100 (предложение, уточнить)
  5. Остров Ритуала — этаж 200
  6. Логово питомцев — этаж 1250
  7. Костяная мастерская — этаж 2000
- Арт: длинный вертикальный фон неба + каждый остров отдельной картинкой на зелёном фоне.

## Макет вертикального лагеря (референс)
```
Mobile game screen, vertical 9:16 portrait, dark fantasy manhwa style, view of several small floating rock islands stacked vertically in the sky beside a giant dark tower rising into violet clouds. Bottom island (largest): a headquarters house with a banner and a glowing gate leading to the tower. Middle island above it: a glowing violet summoning portal circle with stone pillars. Above it only thick violet clouds, nothing visible inside them. Islands linked by stone bridges and hanging chains, lanterns, small floating rocks, violet magic light. Leave the top 10% and bottom 15% calm for UI. No text, no UI, no characters.
```

## (старое) Следующий шаг — макет лагеря
```
Mobile game screen, vertical 9:16 portrait, dark fantasy manhwa style, a small floating rock island in the sky next to a giant dark tower that rises into violet clouds, connected to the tower by a glowing violet portal arch. On the island a cozy hero camp seen from slightly above (isometric-like): a headquarters house with a banner (largest building, center), a glowing violet summoning portal circle with stone pillars, a blacksmith forge with smoke and orange fire, a small farm with crops and a windmill, a market stall with tents and crates, plus 2–3 empty building plots marked with stones for future buildings. Paths, lanterns, small details, floating rocks around the island, violet magic light. Leave the top 10% and bottom 15% of the image calm for UI. No text, no UI, no characters.
```
Потом: лист отдельных зданий на зелёном фоне (каждое здание отдельно + состояние «закрыто»/руины) — чтобы здания появлялись по мере открытия.
