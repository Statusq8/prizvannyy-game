# Призванный: Башня Гачи — рабочий проект

**Играть:** откройте `releases/stable/0.11.0/index.html` на телефоне (или в браузере компьютера). Один файл, интернет не нужен.

## Android
См. `ANDROID.md` — сборка APK через GitHub Actions или Android Studio.

## Структура
- `work/src/core/` — ядро (без интерфейса, тестируется в Node). Баланс — только в `balance.js`.
- `work/src/ui/` — интерфейс. `work/assets/` — манифест, извлечённые и экспортированные картинки.
- `work/tests/` — `core.test.js` (Node), `e2e/run.js` (Playwright, телефон 390×844).
- `releases/stable/<версия>/` — проверенные сборки. Работаем в `work/`, stable не трогаем, пока тесты не пройдены.
- `legacy/` — Python-модули (эталон правил, 98 тестов), документы. Старые HTML-прототипы в архив не включены (есть в исходном ZIP).
- `docs/` — аудит прототипов, отчёты тестов, листы ассетов. `tools/` — скрипты (экспорт ассетов, генерация героев, паритет).

## Команды (из `work/`)
- `node --test tests/*.test.js` — тесты ядра
- `node build.js` — сборка `dist/index.html`
- `node tests/e2e/run.js` — браузерный тест со скриншотами
- Python: `cd legacy/python && python3 -m unittest discover -p 'test_*.py'`
