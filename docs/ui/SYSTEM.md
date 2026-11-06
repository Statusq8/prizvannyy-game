# Системные окна («Голос Башни») и всплывающие подсказки (тосты)

## Что есть в коде
`sys({ title, text, html, btns })` в ui3.js: заголовок, текст печатается по буквам, свой html (поле ввода, сетка наград), кнопки (обычная / красная), иногда «глитч». Тост: `toast('Заголовок<small>подпись</small>')` — короткая плашка сверху.

## Шаг 1 — макет (референс)
```
Mobile game UI mockup, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments), over a darkened battle screen. Center: a "System" message window from the Voice of the Tower — an ornate dark violet window with a gold-violet frame, faint digital glitch lines and small floating runes, a title plate with a glowing violet eye emblem and the word "SYSTEM", a paragraph of white text, a dark text input field with a gold border, and at the bottom two buttons side by side: a dark violet "Cancel" and a glowing gold "OK"; below it a second smaller window of the same style with one red glowing "Delete" danger button and a dark "Cancel". Top of the screen: a toast notification — a small ornate horizontal banner with a round icon on the left (gold chest), a bold gold title line "Reward received" and a smaller second line "+2 tickets · +5 crystals". Readable at phone size.
```

## Макет пользователя — references/system_mockup_v1.png (1024×1536, принят)
Окно СИСТЕМА: глаз с рунным кругом над плашкой «СИСТЕМА», подзаголовок «Послание Голоса Башни» с линиями, текст, поле ввода, силуэт Башни, кнопки «Отмена» (тёмная) и «OK» (золотая); глитч-полосы по краям. Малое окно: вопрос и «Отмена» / «Удалить» (красная). Тост сверху: круглая иконка (сундук), золотой заголовок, строка ниже.
Свои детали: золотая и тёмная кнопки — TT_ART.gbtn / vbtn; тексты по-русски.

## Лист — детали
```
Use the attached mockup as the exact style reference — same ornaments, colors and shapes. Game UI asset sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 3x3 grid with wide spacing, each item separate, NO TEXT anywhere: 1) glowing violet eye emblem with spiky violet flames inside a rune circle (crest); 2) wide title plate with spiky violet-gold ends (empty); 3) big ornate window frame, dark violet with gold-violet spiky corners and gems (empty); 4) small wide window frame of the same style (empty); 5) dark text input field with a glowing gold-violet border (empty); 6) red glowing button with gold border (empty); 7) toast banner: horizontal ornate plate with a round frame on the left (both empty); 8) wide strip of a dark tower silhouette on a glowing violet landscape (decor); 9) small gold treasure chest icon.
```

## Собрано — 0.129
Лист → tools/systemcut.py → assets/system; стили — src/system.js (перекрывает ui3.css): глаз и плашка «СИСТЕМА» над окном, заголовок окна — золотой подзаголовок с линиями, силуэт Башни над кнопками, последняя кнопка — золотая (TT_ART.gbtn), красная — red, остальные — тёмные (TT_ART.vbtn); тост — плашка с сундуком слева.
