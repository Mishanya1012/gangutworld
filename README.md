# Los Santos Dating

SPA-прототип игровой социальной сети знакомств для GTA 5 RP сервера.

## Что работает

- Первый экран: регистрация или вход через Discord.
- Backend содержит реальный Discord OAuth маршрут: `GET /auth/discord`.
- После Discord callback backend выдает JWT, сохраняет пользователя и роль.
- Регистрация принимает имя UCP аккаунта без проверки и просит ник для социальной сети.
- После входа доступны вкладки: поиск, профиль, матчи, чат, гости, уведомления, VIP.
- Админ-панель скрыта для обычных игроков и защищена backend ролью `ADMIN`.
- Поиск показывает анкеты игровых персонажей и соигроков вне самой игры.
- Лайк и пропуск переключают анкеты через Zustand-store.
- Интерфейс адаптирован под desktop, tablet и mobile.
- VIP оформляется заявкой после пополнения игрового баланса, админ подтверждает платеж и выдает VIP.

## Стек

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand
- Axios
- NestJS backend в `server/`
- PostgreSQL через Prisma
- Redis подготовлен в `docker-compose.yml`
- Socket.IO gateway для чата

## Запуск

```bash
npm install
npm run dev
```

Фронтенд ожидает API на `http://localhost:4000`. Адрес можно поменять через `NEXT_PUBLIC_API_URL`.

## Backend

1. Скопировать `.env.example` в `.env`.
2. Создать Discord Application и указать redirect URL:

```text
http://localhost:4000/auth/discord/callback
```

3. Заполнить:

```text
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
JWT_SECRET
ADMIN_DISCORD_IDS
```

4. Поднять базу и Redis:

```bash
docker compose up -d
```

5. Создать таблицы Prisma:

```bash
npm run prisma:migrate --workspace server
```

6. Запустить backend:

```bash
npm run dev:server
```

## Роли и VIP

- `USER`: обычный игрок.
- `VIP`: расширенные фильтры, просмотр лайков, больше действий.
- `ADMIN`: админ-панель, блокировки, жалобы, платежи, выдача VIP.

Админы задаются через `ADMIN_DISCORD_IDS` в `.env`, через запятую.

VIP поток:

1. Игрок пополняет игровой баланс.
2. На сайте отправляет заявку `POST /payments/vip-request`.
3. Админ видит заявку в `GET /admin/payments`.
4. Админ подтверждает `POST /admin/payments/:id/approve`.
5. Backend ставит пользователю роль `VIP` и дату `vipUntil`.

## Быстрое превью без npm

В проекте есть автономный `index.html`, который можно открыть напрямую в браузере.

Также можно поднять простой static preview:

```bash
node preview-server.js
```

После запуска страница будет доступна на `http://localhost:4173`.

## План backend API

- `GET /auth/discord`
- `GET /auth/discord/callback`
- `GET /auth/me`
- `POST /auth/complete-profile`
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /profiles/me`
- `PUT /profiles/me`
- `GET /search`
- `POST /likes`
- `GET /likes`
- `GET /matches`
- `GET /visitors`
- `GET /chats/:chatId/messages`
- `POST /chats/:chatId/messages`
- `POST /payments/vip-request`
- `GET /admin/users`
- `GET /admin/payments`
- `POST /admin/payments/:id/approve`
- `GET /admin/reports`
- `GET /admin/stats`

## Интеграция GTA сервера

- `GET /api/player/:id`
- `POST /api/auth/game`
- `GET /api/player/status`
