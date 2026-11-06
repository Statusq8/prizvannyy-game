# Настройки (экран; сейчас — старый pgSet в ui3.js)

## Состав (по коду)
Звук: весь звук, музыка, звуки боя, интерфейса, вибрация. Графика: анимированные герои, экономия батареи, эффекты (Все/Меньше/Выкл), кадры (30/60). Числа: урон отряда, запись чисел (1.5aa / 1.5e18). Язык. Уведомления: офлайн-сундук. Сохранение: экспорт, импорт, резервные копии, облако (позже), сброс. Прочее: поддержка, версия.
Убрать: фоторежим, обучение, уведомления PvE и событий (выключены); версия — из package.json, а не «0.74».

## Шаг 1 — макет (референс)
```
Mobile game settings screen, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments). Background: a dark stone chamber inside the Tower with a large violet stained glass window, gears and old clockwork on the walls, candles, dark mood. Top: a thin dark strip with a square back button on the left, an ornate title plate "Settings" in the center. Below one long ornate panel with section header plates "Sound", "Graphics", "Numbers", "Save": rows with a small gold icon, a label and on the right either an ornate toggle switch (violet glowing ON with gold knob, dark OFF) or a small segmented switch of 2–3 ornate buttons ("All / Less / Off", "30 / 60"); in the Save section rows with an arrow "›" and one red danger row "Reset progress" with a skull icon. At the bottom a small version plate "v0.124". Readable at phone size, uncluttered.
```
