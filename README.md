# Приложение для отслеживания расходов

Полный проект: React SPA-фронтенд (практика 7).

## Стек

- **Backend**: FastAPI, SQLAlchemy (async), PostgreSQL, Redis, Alembic
- **Frontend**: React 18, TypeScript, Vite, React Router, Axios, CSS Modules
- **Визуализация**: matplotlib (PNG), plotext (CLI)
- **AI**: Groq API (GPT-OSS 120B)
- **Деплой**: Docker Compose (backend + frontend + db + redis)
- **Тесты**: pytest (backend), Vitest + Testing Library (frontend)

## Структура

```text
.
├── app/                    # FastAPI: routers, services, repositories, schemas
├── migrations/             # Alembic
├── tests/                  # pytest
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/            # Axios-клиент и API-модули
│       ├── assets/
│       ├── components/
│       │   ├── common/     # ProtectedRoute
│       │   ├── layout/     # Layout, Header, Footer
│       │   ├── transactions/ # BalanceSummary, TransactionForm, TransactionList
│       │   └── ui/         # Button, ButtonLink, Input, Table, Spinner
│       ├── context/        # AuthContext
│       ├── hooks/          # useAuth, useTransactions, useAnalytics
│       ├── pages/
│       │   ├── Home/
│       │   ├── Login/
│       │   ├── Register/
│       │   ├── Transactions/
│       │   ├── Analytics/
│       │   ├── Users/      # UsersList, UserForm (заготовки по ПЗ 7)
│       │   └── NotFound.tsx
│       ├── styles/         # global.css + общие CSS Modules
│       ├── types/
│       ├── utils/
│       ├── App.tsx         # BrowserRouter в main.tsx, маршруты здесь
│       └── main.tsx
├── docker-compose.yml
└── README.md
```

## Запуск через Docker Compose

1. Создай `.env` из `.env.example` и при необходимости вставь `GROQ_TOKEN` (остальные значения нужны для запуска без Docker).
2. Запусти стек:

   ```bash
   docker compose up --build
   ```

3. Приложение:

   - Frontend: http://localhost:3000
   - Backend API / Swagger: http://localhost:8000/docs

Для быстрой проверки можно зарегистрировать пользователя `demo` / `demo123` через форму регистрации.

## Разработка без Docker

### Backend

```bash
pip install -r requirements.txt
cp .env.example .env
# подними PostgreSQL и Redis, например: docker compose up -d db redis
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm ci
cp .env.example .env   # VITE_API_BASE_URL=/api по умолчанию
npm run dev
```

Vite поднимается на http://localhost:5173 и проксирует `/api` на `http://localhost:8000`.

## Маршруты SPA

| Путь | Страница |
|------|----------|
| `/` | Home |
| `/login`, `/register` | Авторизация |
| `/transactions` | Список транзакций, баланс, добавление/удаление (защищён) |
| `/analytics` | Аналитика, графики и AI-рекомендации (защищён) |
| `/users` | UsersList (заготовка, защищён) |
| `/users/new` | UserForm — создание (заготовка, защищён) |
| `/users/:id/edit` | UserForm — редактирование (заготовка, защищён) |
| `*` | NotFound (404) |

Навигация реализована через `Link` в `Header`; `Layout` содержит `Header`, `main` и `Footer`.

## API (основное)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход, возвращает токен |
| POST | `/auth/refresh` | Обновление токена |
| POST | `/auth/change-password` | Смена пароля |
| GET | `/transactions/` | Список с пагинацией/фильтрами, возвращает `{ items, total, page, per_page, total_pages }` |
| POST | `/transactions/` | Создание |
| GET/PATCH/PUT/DELETE | `/transactions/{id}` | Работа с транзакцией |
| GET | `/transactions/export?format=csv\|xlsx` | Экспорт |
| GET | `/analytics/by-category`, `/analytics/timeline`, `/analytics/groups`, `/analytics/summary`, `/analytics/top-categories` | Аналитика |
| GET | `/analytics/by-category/chart.png`, `/analytics/timeline/chart.png` | Графики PNG |
| GET | `/ai/recommendations` | AI-рекомендации |
| CRUD | `/groups/` | Группы |

## CLI

```bash
python cli.py
```

Доступны просмотр транзакций, добавление, редактирование, удаление, аналитика, экспорт и графики в терминале.

## Тесты

```bash
# Backend (нужны PostgreSQL и Redis)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/app pytest tests/

# Frontend
cd frontend && npm test
```

Backend-тесты используют ту же базу данных и очищают таблицы перед каждым тестом. После прогона тестов демо-пользователя `demo` / `demo123` нужно создать заново через форму регистрации.

## Соответствие Practice_07_Frontend_Init

- React 18 + TypeScript + Vite
- React Router: `BrowserRouter`, динамические маршруты, `ProtectedRoute`, `NotFound`
- SPA с базовым `Layout` (`Header` + `Footer`)
- Структура папок по слайду 5 (`api`, `components/ui|layout|common`, `pages`, `hooks`, `types`, `utils`)
- CSS Modules вместо глобальных стилей компонентов
- Переиспользуемые UI-компоненты: `Button` (primary/secondary/ghost/danger), `Input` (label + error), `Table` (универсальная), `Spinner`
- Axios-клиент с интерцептором авторизации и единой обработкой ошибок
- Готовый фундамент для интеграции с Backend API

## Практика 8: интеграция Frontend с Backend API

- `frontend/src/api/client.ts` — Axios-клиент с интерцепторами (токен, логирование ошибок)
- `frontend/src/api/{transactions,groups}.ts` — API-сервисы: `getAll` (пагинация, сортировка, фильтры), `getById`, `create`, `update`, `delete`
- `frontend/src/types/index.ts` — типы сущностей, `PaginatedResponse<T>`, `ApiError`
- `frontend/src/utils/apiErrorHandler.ts` — централизованная обработка ошибок API
- `frontend/src/components/Notification/` — `NotificationProvider` / `useNotification` (toast)
- `frontend/src/hooks/usePaginatedList.ts` — загрузка списков (loading/error, `AbortController`)
- Страницы: `/transactions` (+ `/new`, `/:id/edit`) и `/groups` (+ `/new`, `/:id/edit`)
- Backend: в `GET /groups/` добавлен параметр `search` (поиск по названию)