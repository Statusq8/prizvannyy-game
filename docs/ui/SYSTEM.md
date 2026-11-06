# Системные окна («Голос Башни») и всплывающие подсказки (тосты)

## Что есть в коде
`sys({ title, text, html, btns })` в ui3.js: заголовок, текст печатается по буквам, свой html (поле ввода, сетка наград), кнопки (обычная / красная), иногда «глитч». Тост: `toast('Заголовок<small>подпись</small>')` — короткая плашка сверху.

## Шаг 1 — макет (референс)
```
Mobile game UI mockup, vertical 9:16 portrait, dark fantasy manhwa style, same style as the other Tower screens (violet and gold ornaments), over a darkened battle screen. Center: a "System" message window from the Voice of the Tower — an ornate dark violet window with a gold-violet frame, faint digital glitch lines and small floating runes, a title plate with a glowing violet eye emblem and the word "SYSTEM", a paragraph of white text, a dark text input field with a gold border, and at the bottom two buttons side by side: a dark violet "Cancel" and a glowing gold "OK"; below it a second smaller window of the same style with one red glowing "Delete" danger button and a dark "Cancel". Top of the screen: a toast notification — a small ornate horizontal banner with a round icon on the left (gold chest), a bold gold title line "Reward received" and a smaller second line "+2 tickets · +5 crystals". Readable at phone size.
```
