# Сюжетный свиток на экране боя (#questPanel из ui4.js)

## Что есть
Справа на экране боя: «КВЕСТ», текущий шаг сюжетной цепочки (STORY в ui4.js), кнопка «Забрать 🎟 N», строка «100 этаж: магазин, PvE» (что откроется дальше), «−» — свернуть в иконку свитка. Решение пользователя (0.117): маленький сворачиваемый свиток.

## Шаг 1 — макет (референс)
```
Mobile game battle screen fragment, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments). On the right side of a dark battle arena: a small vertical quest scroll — an old parchment scroll with dark wooden rollers on top and bottom and a violet wax seal, a tiny header ribbon "Quest" with a small minus button, a quest text "Upgrade the main hero to level 10", a thin progress bar "7/10", a small gold "Claim" button with a ticket icon and "1", and under a thin line a small note "Floor 100: Market". Next to it the same scroll collapsed — a small rolled scroll icon with a violet seal and a red notification dot. Readable at phone size.
```

## Макет пользователя — references/story_scroll_mockup_v1.png (1024×1536, принят)
Раскрытый свиток (валики сверху и снизу, фиолетовая лента в углу, печать с башней внизу), плашка «Квест» и «−», текст задания, полоса 7/10, золотая кнопка «🎟 1 Забрать», линия и «100 этаж: Рынок»; свёрнутый — свиток с печатью и красной точкой.
Свои детали: полоса — QS_ART.bar/bar_fill, кнопка — TT_ART.gbtn.

## Лист
```
Use the attached mockup as the exact style reference — same ornaments, colors and shapes. Game UI asset sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 2x2 grid with wide spacing, each item separate, NO TEXT anywhere: 1) tall open parchment scroll with dark wood and gold rollers on top and bottom, a violet ribbon in the top left corner and a violet wax seal with a tower emblem and ribbons hanging from the bottom roller (empty parchment); 2) small dark header plate with gold-violet border (empty); 3) small square dark button with a gold minus sign; 4) small rolled-up parchment scroll with a violet wax seal and violet ribbons (collapsed icon).
```
