# Code Review

## Ядро

### `app/database.py`
- `sessionmaker` вместо `async_sessionmaker` — SQLAlchemy 2.0 рекомендует `async_sessionmaker` для async
- `declarative_base()` устарело в 2.0 — рекомендуется `class Base(DeclarativeBase): pass`
- `get_db` — лишний `try/finally`, `async with` уже закрывает сессию

### `app/main.py`
- `@app.on_event("startup")` устарело — нужен `lifespan` context manager
- `create_all` при старте приложения — не подходит для prod, нужны миграции (Alembic)

### `app/core/redis.py`
- Используется синхронный `redis.Redis` вместо `redis.asyncio.Redis`
- Хост `"redis"` захардкожен, не читается из env

### `app/core/cache.py`
- **КРИТИЧЕСКИЙ БАГ**: декоратор синхронный (`def wrapper`), оборачивает async функцию
- `result = func(*args, **kwargs)` возвращает coroutine object, не данные
- В Redis сохраняется мусор, `json.loads` при чтении падает
- Фактически кэш не работает

---

## Модели

### `app/models/user.py`
- Пароль хранится в открытом виде — нет хэширования (bcrypt/argon2)
- Нет `nullable=False` на обязательных полях

### `app/models/transaction.py`
- `default=datetime.utcnow` — `utcnow()` устарело в Python 3.12+, нужно `datetime.now(timezone.utc)`
- Нет `nullable=False` на обязательных полях
- Нет `index=True` на `user_id` (FK без индекса — медленные запросы)
- Нет валидации `type` на уровне модели (любая строка, не только `expense`/`income`)

### `app/models/group.py`
- Нет `nullable=False` на обязательных полях

---

## Репозитории

### `app/repositories/userrepo.py`
- `from typing import Any` — импортирован, не используется

### `app/repositories/transactionrepo.py`
- `update` возвращает `bool | Transaction` — непоследовательный тип, лучше `Transaction | None`
- `get_all_transactions` не сортирует по дате

### `app/repositories/grouprepo.py`
- `update` возвращает `bool | Group` — то же замечание

---

## Сервисы

### `app/services/auth_service.py`
- `from sqlalchemy.orm import Session` — импортирован, не используется
- Пароль не хэшируется при создании и не проверяется через хэш при логине

### `app/services/transaction_service.py`
- `from sqlalchemy.orm import Session` — импортирован, не используется
- `@cache(ttl=120)` на `get_transactions` — кэш сломан (см. `cache.py`)

### `app/services/group_service.py`
- `from sqlalchemy.orm import Session` — импортирован, не используется
- `from app.models.group import Group` — импортирован, не используется

---

## Роутеры

### `app/routers/auth.py`
- Импортированы оба `Session` и `AsyncSession`, используется только `AsyncSession`
- `auth_required` — тип `db: Session` но реально получает `AsyncSession`
- `auth_required` — заглушка, берёт первого юзера из БД (нет настоящей авторизации)

### `app/routers/transactions.py`
- `from sqlalchemy.orm import Session` — импортирован, не используется
- `data.dict()` устарело в Pydantic v2 — нужно `data.model_dump()`

### `app/routers/analytics.py`
- `datetime.utcnow()` устарело в Python 3.12+

---

## Схемы

### `app/schemas/user.py`, `transaction.py`, `group.py`
- `class Config` — стиль Pydantic v1, нужно `model_config = ConfigDict(from_attributes=True)`
- `TransactionCreate.type: str` — принимает любую строку, нужно `Literal["expense", "income"]`
- `TransactionCreate.amount: float` — нет валидации на положительное значение (`gt=0`)

---

## Безопасность и ядро авторизации

### `app/core/security.py`
- Токены хранятся в памяти (`sessions = {}`) — теряются при перезапуске, нет TTL, не работает при нескольких процессах
- Токен не проверяется в `auth_required` — заглушка не использует его вообще
- Нет JWT

---

## Графики (`app/services/charts/`)

- Код чистый, хорошая декомпозиция
- Константы `TITLE = "Expenses by category"` / `"Income vs Expense over time"` на английском

---

## Тесты

### `tests/conftest.py`
- `asyncio_default_fixture_loop_scope = "session"` + `asyncio_default_test_loop_scope = "session"` — документация рекомендует функциональный scope для лучшей изоляции
- `_mock_redis` синхронный fixture, а `_clean_db` асинхронный — порядок выполнения корректен, но стоит выровнять стиль

### `tests/test_cli.py`
- Тесты не покрывают `show_transactions` с реальной проверкой данных в таблице
- Нет теста на `add_transaction` с невалидной суммой

---

## Инфраструктура

### `Dockerfile`
- Нет `.dockerignore` — в образ попадают `.venv`, тесты, `.git`, PNG-файлы
- Нет `--no-cache-dir` при `pip install` — образ тяжелее нужного
- Uvicorn запускается с одним воркером — нет `--workers` параметра

### `docker-compose.yml`
- Пароли и логин к БД в открытом виде (`user`/`password`) — для прода нужны secrets
- Порты 5432 и 6379 выставлены наружу — в проде закрыть
- `REDIS_URL` задан в env, но нигде не читается в коде (используется захардкоженный `host="redis"`)

---

## CLI (`cli.py`)

- `BASE_URL = "http://localhost:8000"` захардкожен — нет способа переключить на другой адрес без правки кода
- Нет обработки ошибок сети (сервер недоступен — падает с traceback)
- Пароль при вводе виден в терминале (убран `password=True` не везде)

---

## Безопасность

- Пароли в открытом виде в БД
- Нет настоящей JWT авторизации (заглушка)
- Нет валидации `type` транзакции на уровне схемы (принимает любую строку)
- GROQ_TOKEN читается из env, но нет проверки на пустое значение

---

---

## Проверка по документации (context7)

### FastAPI
- `@app.on_event("startup")` — **подтверждено устаревшим**, рекомендуется `lifespan`:
  ```python
  @asynccontextmanager
  async def lifespan(app: FastAPI):
      await create_tables()
      yield
  app = FastAPI(lifespan=lifespan)
  ```
- Использование `Depends()` — корректно
- Современный стиль: `user_id: Annotated[int, Depends(auth_required)]`

### Pydantic v2
- `class Config: from_attributes = True` — **подтверждено устаревшим**, нужно:
  ```python
  model_config = ConfigDict(from_attributes=True)
  ```
- `Literal["expense", "income"]` для поля `type` — **подтверждено как best practice**
- `data.dict()` — **подтверждено устаревшим**, нужно `data.model_dump()`

### redis-py
- **Подтверждено**: для async приложений обязательно:
  ```python
  import redis.asyncio as redis
  redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)
  ```
  Синхронный `redis.Redis` блокирует event loop

### pytest-asyncio
- `asyncio_default_fixture_loop_scope = "session"` — **валидная конфигурация** согласно документации
- Для интеграционных тестов session scope допустим, function scope лучше для изоляции

### matplotlib
- `matplotlib.use("Agg")` — **корректно** для серверного рендеринга без дисплея
- `plt.close(fig)` в `save_to_png` — **корректно**, предотвращает утечку памяти
- Наша реализация графиков соответствует рекомендациям

---

## Итог

| Категория | Критично | Некритично |
|-----------|----------|------------|
| Сломано | `cache.py` — декоратор не работает с async | — |
| Безопасность | Пароли открытым текстом, токены в памяти | Нет JWT, порты открыты |
| Устаревший API | `utcnow()`, `data.dict()`, Pydantic v1 Config | `@on_event`, `sessionmaker` |
| Валидация | `type` транзакции принимает любую строку | `amount` без проверки на > 0 |
| Инфраструктура | Нет `.dockerignore` | `REDIS_URL` не используется |
| Неиспользуемые импорты | — | 5 файлов |
| Отсутствующие индексы | — | `user_id` FK |
| CLI | Нет обработки сетевых ошибок | `BASE_URL` захардкожен |
