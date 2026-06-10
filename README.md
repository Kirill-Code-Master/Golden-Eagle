## Сайт ювелірного магазину "Golden Eagle"

**Golden Eagle** - це вебсайт ювелірного магазину, який надає користувачам зручний доступ до каталогу прикрас, інформації про вироби та можливості оформлення замовлень онлайн. Платформа поєднує сучасний дизайн, інтуїтивний інтерфейс і функціонал електронної комерції для комфортного вибору та придбання ювелірних виробів.

# 🦅 Golden Eagle — Ювелірний магазин

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)

**Golden Eagle** — повноцінний full-stack застосунок ювелірного магазину. Надає користувачам зручний доступ до каталогу прикрас з можливістю перегляду виробів, управління асортиментом і оформлення замовлень онлайн. Платформа поєднує сучасний мінімалістичний дизайн, REST API та MongoDB для комфортного вибору і придбання ювелірних виробів.

---

## Зміст

- [Функціональність](#функціональність)
- [Технологічний стек](#технологічний-стек)
- [Структура проекту](#структура-проекту)
- [Вимоги](#вимоги)
- [Встановлення](#встановлення)
- [Змінні середовища](#змінні-середовища)
- [Запуск](#запуск)
- [API Reference](#api-reference)
- [Скрипти](#скрипти)

---

## Функціональність

- 📋 **Каталог виробів** — перегляд ювелірних прикрас з назвою, ціною, категорією та залишком на складі
- 🔍 **Пошук за ID** — отримання деталей конкретного виробу з коректною обробкою 404
- ➕ **Додавання товарів** — створення нових позицій через REST API
- ✏️ **Редагування** — оновлення характеристик наявних виробів
- 🗑️ **Видалення** — видалення позицій з каталогу
- ❤️ **Health check** — ендпоінт перевірки стану сервера
- 🔄 **Проксування запитів** — Vite proxy усуває CORS-проблеми в режимі розробки

---

## Технологічний стек

### Backend
| Технологія | Версія | Призначення |
|---|---|---|
| Node.js | 20+ | Середовище виконання |
| Express | 4.x | HTTP-сервер та маршрутизація |
| Mongoose | 8.x | ODM для MongoDB |
| dotenv | 16.x | Управління змінними середовища |
| cors | 2.x | Обробка CORS-заголовків |

### Frontend
| Технологія | Версія | Призначення |
|---|---|---|
| React | 18 | UI-бібліотека |
| Vite | 5 | Збірник та dev-сервер |
| JavaScript (ESM) | ES2022+ | Мова розробки |

### База даних
| Технологія | Призначення |
|---|---|
| MongoDB | Документоорієнтована база даних |
| MongoDB Atlas | Хмарний хостинг (для продакшену) |

---

## Структура проекту

```
golden-eagle/
├── back/                        # Backend (Node.js + Express)
│   ├── src/
│   │   ├── .cache/
│   │   │   └── products.json    # Тестові seed-дані
│   │   ├── .env                 # Змінні середовища (не в git)
│   │   ├── app.js               # Express-застосунок та маршрути
│   │   ├── db.js                # Підключення до MongoDB
│   │   ├── product.js           # Mongoose-модель Product
│   │   └── server.js            # Точка входу, запуск сервера
│   ├── package-lock.json
│   └── package.json
│
├── front/                       # Frontend (React + Vite)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.jsx         # Головна сторінка / каталог
│   │   ├── index.css            # Глобальні стилі
│   │   └── main.jsx             # Точка входу React
│   ├── index.html
│   ├── package.json
│   └── vite.config.js           # Vite + проксі на :3000
│
├── .gitignore
├── package.json                 # Кореневий — скрипти запуску
└── README.md
```

---

## Вимоги

Перед початком роботи переконайтеся, що у вас встановлено:

- [Node.js](https://nodejs.org/) версії **20 або вище**
- [npm](https://npmjs.com/) версії **9 або вище**
- [MongoDB](https://www.mongodb.com/) (локально або [Atlas](https://www.mongodb.com/atlas))

Перевірити версії:

```bash
node --version   # v20.x.x
npm --version    # 9.x.x або вище
```

---

## Встановлення

**1. Клонуйте репозиторій:**

```bash
git clone https://github.com/your-username/golden-eagle.git
cd golden-eagle
```

**2. Встановіть усі залежності одною командою:**

```bash
npm run install:all
```

Або вручну по частинах:

```bash
npm install                  # кореневі залежності (concurrently)
npm install --prefix back    # залежності бекенду
npm install --prefix front   # залежності фронтенду
```

**3. Налаштуйте змінні середовища** — див. розділ [нижче](#змінні-середовища).

---

## Змінні середовища

Створіть файл `back/src/.env` (або `back/.env`, залежно від вашої конфігурації) на основі прикладу нижче.

> ⚠️ Файл `.env` **не повинен** потрапляти до системи контролю версій. Переконайтеся, що він є у `.gitignore`.

```env
# Порт, на якому запускається Express-сервер
PORT=3000

# Рядок підключення до MongoDB
# Локально:
MONGODB_URI=mongodb://localhost:27017/golden-eagle
# Або через MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/golden-eagle

# Необов'язково: 1 — використовувати публічні DNS (Cloudflare/Google)
# Корисно при проблемах із підключенням до Atlas у деяких мережах
CUSTOM_DNS=0

# Середовище виконання
NODE_ENV=development
```

| Змінна | Обов'язкова | За замовчуванням | Опис |
|---|---|---|---|
| `PORT` | Ні | `3000` | Порт Express-сервера |
| `MONGODB_URI` | **Так** | — | Рядок підключення до MongoDB |
| `CUSTOM_DNS` | Ні | `0` | `1` — підмінює DNS на 1.1.1.1 / 8.8.8.8 |
| `NODE_ENV` | Ні | `development` | Середовище (`development` / `production`) |

---

## Запуск

### Режим розробки (рекомендовано)

Запускає бекенд і фронтенд **одночасно** з кольоровим виводом у терміналі:

```bash
npm run dev
```

| Сервіс | URL |
|---|---|
| 🟡 API (бекенд) | http://localhost:3000 |
| 🔵 UI (фронтенд) | http://localhost:53029 |
| ✅ Health check | http://localhost:3000/api/health |

Фронтенд проксує всі запити `/api/*` на бекенд — CORS не виникає.

### Продакшен

```bash
# Зібрати статику фронтенду
npm run build --prefix front

# Запустити бекенд у продакшені
npm run start --prefix back
```

> В продакшені Express повинен роздавати зібрану папку `front/dist` як статику.  
> Додайте до `app.js`:
> ```js
> import { fileURLToPath } from 'url'
> import path from 'path'
> const __dirname = path.dirname(fileURLToPath(import.meta.url))
> app.use(express.static(path.join(__dirname, '../../front/dist')))
> ```

---

## API Reference

Базова URL: `http://localhost:3000`

### Health

| Метод | Ендпоінт | Опис |
|---|---|---|
| `GET` | `/api/health` | Перевірка стану сервера |

**Відповідь `200`:**
```json
{ "status": "ok", "service": "golden-eagle-back" }
```

---

### Products

| Метод | Ендпоінт | Опис |
|---|---|---|
| `GET` | `/api/products` | Отримати всі товари |
| `GET` | `/api/products/:id` | Отримати товар за ID |
| `POST` | `/api/products` | Створити новий товар |
| `PUT` | `/api/products/:id` | Оновити товар за ID |
| `DELETE` | `/api/products/:id` | Видалити товар за ID |

#### Модель товару

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Золота каблучка з діамантом",
  "price": 12999,
  "category": "Каблучки",
  "image": "https://example.com/images/ring-1.jpg",
  "stock": 5
}
```

| Поле | Тип | Обов'язкове | Опис |
|---|---|---|---|
| `name` | `String` | **Так** | Назва виробу |
| `price` | `Number` | **Так** | Ціна у гривнях |
| `category` | `String` | Ні | Категорія (Каблучки, Ланцюжки, Браслети, Сережки, Підвіски, Обручки, Хрестики) |
| `image` | `String` | Ні | URL зображення |
| `stock` | `Number` | Ні | Кількість на складі |

#### Приклади запитів

**Отримати всі товари:**
```bash
curl http://localhost:3000/api/products
```

**Отримати товар за ID:**
```bash
curl http://localhost:3000/api/products/507f1f77bcf86cd799439011
```

**Створити товар:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Золотий браслет", "price": 7499, "category": "Браслети", "stock": 7}'
```

**Оновити товар:**
```bash
curl -X PUT http://localhost:3000/api/products/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"price": 13499, "stock": 3}'
```

**Видалити товар:**
```bash
curl -X DELETE http://localhost:3000/api/products/507f1f77bcf86cd799439011
```

#### Коди відповідей

| Код | Значення |
|---|---|
| `200` | Успішно |
| `201` | Створено |
| `204` | Видалено (без тіла відповіді) |
| `400` | Невалідні дані запиту |
| `404` | Товар не знайдено |
| `500` | Внутрішня помилка сервера |

---

## Скрипти

### Кореневий `package.json`

| Команда | Опис |
|---|---|
| `npm run dev` | Запустити бекенд і фронтенд одночасно |
| `npm run install:all` | Встановити залежності для всіх частин проекту |

### `back/package.json`

| Команда | Опис |
|---|---|
| `npm run dev` | Запустити бекенд з авторестартом (`node --watch`) |
| `npm start` | Запустити бекенд без авторестарту (продакшен) |

### `front/package.json`

| Команда | Опис |
|---|---|
| `npm run dev` | Запустити Vite dev-сервер з HMR |
| `npm run build` | Зібрати статику у `front/dist` |
| `npm run preview` | Переглянути production-збірку локально |

---

## Ліцензія

Цей проект розроблений у навчальних цілях.