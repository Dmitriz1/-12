# Приложение для отслеживания расходов

FastAPI-приложение для управления личными финансами: учёт доходов и расходов, аналитика, визуализация, AI-рекомендации и CLI-интерфейс.

## Стек

- **Backend**: FastAPI, SQLAlchemy (async), PostgreSQL, Redis
- **Визуализация**: matplotlib (PNG), plotext (CLI)
- **AI**: Groq API (Llama 3.1)
- **Деплой**: Docker Compose
- **Миграции**: Alembic
- **Тесты**: pytest + pytest-asyncio + httpx

## Запуск

1. Скопируй `.env.example` в `.env` и вставь Groq API ключ (бесплатно: https://console.groq.com/keys):
   ```
   cp .env.example .env
   ```

2. Запусти через Docker Compose:
   ```
   docker compose up -d
   ```

3. Применить миграции (при первом запуске):
   ```
   alembic upgrade head
   ```

4. Swagger-документация: http://localhost:8000/docs

## Тестовые данные

Логин: `demo` / `demo123` (создаётся через `/auth/register`)

## API

### Авторизация

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход, возвращает токен |
| POST | `/auth/change-password` | Смена пароля |
| POST | `/auth/refresh` | Обновление токена |

### Транзакции

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/transactions/` | Список (фильтры: `category`, `dt_from`, `dt_to`, `limit`, `offset`) |
| POST | `/transactions/` | Создание |
| PATCH | `/transactions/{id}` | Редактирование |
| DELETE | `/transactions/{id}` | Удаление |

### Группы

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/groups/` | Список групп |
| POST | `/groups/` | Создание |
| PATCH | `/groups/{id}` | Редактирование |
| DELETE | `/groups/{id}` | Удаление |

### Аналитика

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/analytics/by-category` | Расходы по категориям (JSON) |
| GET | `/analytics/by-category/chart.png` | Круговая диаграмма |
| GET | `/analytics/timeline` | Динамика по времени (JSON) |
| GET | `/analytics/timeline/chart.png` | График (`kind=line\|bar`, `granularity=day\|week\|month`) |
| GET | `/analytics/groups` | Аналитика по группам |

### AI

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/ai/recommendations` | Персональные финансовые советы |

## CLI

```
python cli.py
```

Возможности: просмотр транзакций, добавление, редактирование, удаление, аналитика, графики в терминале (plotext), AI-рекомендации.

## Тесты

```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/app pytest tests/
```

70 тестов покрывают все эндпоинты.

## Выполненные требования по ТЗ

- ✅ Модели данных: транзакции, группы, пользователи
- ✅ Миграции (Alembic)
- ✅ API: регистрация, аутентификация, смена пароля, обновление токена
- ✅ API транзакций: CRUD, пагинация, фильтры по категории и дате
- ✅ API групп: CRUD, аналитика по группам
- ✅ Визуализация: круговая диаграмма, линейный и столбчатый графики
- ✅ ИИ-функции: учёт доходов, персональные рекомендации (Groq/Llama 3.1)
- ✅ Тесты для всех эндпоинтов
- ✅ Docker Compose
