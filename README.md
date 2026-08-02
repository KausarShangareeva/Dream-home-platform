# Дом мечты — Шангареевы

React (Vite) + Node/Express + MongoDB. Первая версия: **Главная**, **Другие мечты**, **Садака**.
Остальное (Мамин уголок, Хадисы, Что учесть и т.д.) — следующим шагом.

## Структура

```
client/   — React-фронтенд (деплоится на Netlify)
server/   — Express API (деплоится на Render)
```

## 1. Локальный запуск

### Backend
```bash
cd server
cp .env.example .env      # впишите свой MONGODB_URI
npm install
npm run dev                # http://localhost:4000
```

### Frontend
```bash
cd client
cp .env.example .env       # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

## 2. MongoDB Atlas

1. [cloud.mongodb.com](https://cloud.mongodb.com) → создать бесплатный кластер (M0)
2. Database Access → создать пользователя с паролем
3. Network Access → **Allow access from anywhere** (0.0.0.0/0) — иначе Render не сможет подключиться
4. Connect → Drivers → скопировать строку вида
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/dream-home?retryWrites=true&w=majority`
   — это и есть `MONGODB_URI`

## 3. Деплой backend на Render

1. Залейте папку `server/` в свой GitHub-репозиторий (или весь проект целиком — Render можно направить в конкретную подпапку)
2. render.com → **New → Web Service** → подключить репозиторий
3. **Root Directory**: `server` (если пушите весь монорепо целиком)
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. В **Environment** добавьте переменные:
   - `MONGODB_URI` — строка из шага 2
   - `CLIENT_ORIGIN` — адрес вашего сайта на Netlify (можно временно `*`, потом заменить на реальный)
7. Deploy. После деплоя Render даст адрес вида `https://dream-home-server.onrender.com`

⚠️ На бесплатном тарифе Render сервер "засыпает" после ~15 минут без запросов — первый запрос после паузы может занять 30-60 секунд.

## 4. Деплой frontend на Netlify

1. `client/` → залить в тот же (или отдельный) репозиторий
2. Netlify → **Add new site → Import from Git** → выбрать репозиторий
3. **Base directory**: `client`
4. **Build command**: `npm run build`
5. **Publish directory**: `client/dist`
6. **Environment variables**: `VITE_API_URL` = `https://dream-home-server.onrender.com/api` (адрес из шага Render)
7. Deploy

## 5. После деплоя

Вернитесь в Render и обновите `CLIENT_ORIGIN` на реальный адрес Netlify-сайта (например `https://dom-mechty.netlify.app`) — это защищает API от посторонних запросов.

## Что дальше

Как только эта версия заработает — можно постепенно добавлять остальные разделы (Мамин уголок с языками/книгами/Кораном, Хадисы, Что учесть) тем же способом: новая Mongoose-модель на бэке + новый React-компонент на фронте.
