# sadykoff-cli

Простой CLI для добавления функциональности в проекты Next.js

## Команды

### `npx sadykoff@latest add metrica`

Добавляет в проект Яндекс Метрику:
- переменные в `.env` и `.env.local`
- типы для `window.ym`
- компонент `lib/yandex-metrica.tsx`
- хелпер `lib/reach-goal.tsx`
- вставку компонента в `app/layout.tsx`

---

## Установка локально

```bash
npm install
npm link
