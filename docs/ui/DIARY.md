# Дневник призванного (экран; сейчас — старая вкладка diary)

## Правила (CONFIG.diary)
Бестиарий: первая победа над видом — запись; все враги и боссы биома — страница заполнена (награда `CONFIG.diary.page`); `CONFIG.diary.master` побед над видом — «знаток» (`masterReward`). Герои: цитата и история открываются звёздами (`loreStars`).
0.126: награды дневника — билеты и 💎 (эссенция бесполезна — PvE выключено).

## Шаг 1 — макет (референс)
```
Mobile game bestiary journal screen, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments). Background: a dark stone library inside the Tower, a big open ancient book lying on a desk, candles, violet magic dust, dark mood. Top: a thin dark strip with a square back button on the left, an ornate title plate "Diary" in the center, tickets and crystals with "+" on the right. Under it 2 ornate tabs: Bestiary, Heroes (Bestiary active). Below a horizontal row of small round biome medallions with a left/right arrow (current biome highlighted). Then a big parchment-like dark page panel with the biome name on a header plate, a progress bar "4/6 entries" and a small reward plate (ticket and crystal icons) with a "Claim" button. Inside the page a 3-column grid of enemy cards: each card is a dark ornate frame with a monster portrait (skeleton, ghoul, giant rat, bone knight, boss with a crown badge), the monster name under it and a kill counter with a skull icon; one card has a gold "Expert" ribbon; undiscovered cards show a dark silhouette with "???". Readable at phone size, uncluttered.
```
