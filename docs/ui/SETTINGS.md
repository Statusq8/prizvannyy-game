# Настройки (экран; сейчас — старый pgSet в ui3.js)

## Состав (по коду)
Звук: весь звук, музыка, звуки боя, интерфейса, вибрация. Графика: анимированные герои, экономия батареи, эффекты (Все/Меньше/Выкл), кадры (30/60). Числа: урон отряда, запись чисел (1.5aa / 1.5e18). Язык. Уведомления: офлайн-сундук. Сохранение: экспорт, импорт, резервные копии, облако (позже), сброс. Прочее: поддержка, версия.
Убрать: фоторежим, обучение, уведомления PvE и событий (выключены); версия — из package.json, а не «0.74».

## Шаг 1 — макет (референс)
```
Mobile game settings screen, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments). Background: a dark stone chamber inside the Tower with a large violet stained glass window, gears and old clockwork on the walls, candles, dark mood. Top: a thin dark strip with a square back button on the left, an ornate title plate "Settings" in the center. Below one long ornate panel with section header plates "Sound", "Graphics", "Numbers", "Save": rows with a small gold icon, a label and on the right either an ornate toggle switch (violet glowing ON with gold knob, dark OFF) or a small segmented switch of 2–3 ornate buttons ("All / Less / Off", "30 / 60"); in the Save section rows with an arrow "›" and one red danger row "Reset progress" with a skull icon. At the bottom a small version plate "v0.124". Readable at phone size, uncluttered.
```

## Макет пользователя — references/settings_mockup_v1.png (1024×1536, принят)
Длинная панель, шапки разделов со стрелками-лучами, строки «иконка — название — переключатель / сегменты / ›», красная строка «Сбросить прогресс», внизу плашка версии.
Правки при сборке (пункты — те, что реально работают в игре): Звук — Музыка, Звуки боя, Звуки интерфейса, Вибрация (озвучки нет); Графика — Качество (Высокое/Среднее/Низкое = эффекты Все/Меньше/Выкл), Частота кадров 30/60, Экономия батареи, Анимированные герои; Отображение — Числа урона, Формат чисел (1.5aa / 1.5e18); Сохранение — Экспорт, Импорт, Резервные копии, Облако (позже), Сбросить. Аккаунт и промокод — когда будет сервер.

## Лист A — интерфейс
```
Use the attached mockup as the exact style reference — same ornaments, colors and shapes. Game UI asset sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 4x2 grid with wide spacing, each item separate, NO TEXT anywhere: 1) ornate toggle switch ON — glowing violet track with a gold round knob on the right; 2) same toggle switch OFF — dark track with a dark knob on the left; 3) small dark segmented button with gold-violet border (empty); 4) same small button active, glowing gold-violet (empty); 5) gold chevron arrow pointing right; 6) long thin dark-red glowing row strip with fading ends (danger row background); 7) small ornate version plate with pointed violet-gold ends (empty); 8) section header plate with spiky violet-gold ends and long glowing light rays going left and right (empty).
```

## Лист B — иконки
```
Use the attached mockup as the exact style reference. Game icon sheet, dark fantasy manhwa style, flat solid pure green (#00FF00) background, 6x3 grid with wide spacing, each icon separate, square, no frames, no text, gold icons with violet accents: 1) music note; 2) speaker with sound waves; 3) vibrating smartphone; 4) small bell; 5) monitor screen; 6) picture frame with mountains; 7) sparkles; 8) battery with a leaf; 9) small chibi knight running; 10) stopwatch; 11) bar chart; 12) crossed swords; 13) digits "123"; 14) cloud with an up arrow; 15) scroll with an arrow going out; 16) scroll with an arrow coming in; 17) small treasure chest with a shield (backup); 18) red glowing skull.
```

## Фон (без интерфейса)
```
Vertical 2:3 mobile game background, dark fantasy manhwa style: a dark stone chamber inside the Tower, a large violet stained glass window at the top center, big bronze gears and an old clock with violet face on the right, gears and candles on the left, chains, cracked stone floor at the bottom. Top part detailed, the middle calm and dark for a long UI panel. No text, no UI.
```
