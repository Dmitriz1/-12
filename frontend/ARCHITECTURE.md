# Finance Tracker Frontend - Архитектура и Документация

## Архитектура приложения

### Общая структура

Приложение построено на основе современных паттернов React разработки с использованием:

1. **Component-based Architecture** - компоненты переиспользуются и имеют четкую ответственность
2. **Context API** - управление глобальным состоянием (аутентификация)
3. **Custom Hooks** - логика переиспользуется через хуки
4. **Service Layer** - отделение логики API от компонентов
5. **Protected Routes** - безопасность доступа к страницам

### Слои приложения

```
┌─────────────────────────────────────┐
│        Presentation Layer           │
│  (Pages & Components)               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       State Management              │
│  (Context API, useAuth Hook)        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       Service Layer                 │
│  (API clients, Business Logic)      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       HTTP Layer                    │
│  (Axios Instance with Interceptors) │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       Backend API                   │
│  (FastAPI on Port 8000)             │
└─────────────────────────────────────┘
```

## Компоненты

### Умные компоненты (Smart Components)

Находятся в папке `pages/`:
- **Home** - главная страница
- **Login** - аутентификация пользователя
- **Register** - регистрация нового пользователя
- **Dashboard** - общая статистика
- **Transactions** - управление транзакциями
- **Groups** - управление группами расходов
- **Analytics** - аналитика и отчеты

### Дезумные компоненты (Dumb Components)

Находятся в папке `components/`:
- **Navigation** - навигация приложения
- **ProtectedRoute** - защита маршрутов
- **LoginForm** - форма входа
- **RegisterForm** - форма регистрации
- **TransactionForm** - форма создания транзакции
- **TransactionList** - список транзакций
- **GroupForm** - форма создания группы
- **GroupList** - список групп

## Состояние приложения

### AuthContext

Управляет состоянием аутентификации:
```javascript
{
  user: { username: string } | null,
  token: string | null,
  isLoading: boolean,
  error: string | null,
  isAuthenticated: boolean,
  methods: {
    register(username, password),
    login(username, password),
    logout(),
    changePassword(old, new),
    refreshAuthToken()
  }
}
```

## API Integration

### API Client (services/api.js)

Использует Axios с:
- Автоматическим добавлением токена в headers
- Обработкой ошибок 401 (переправка на login)
- Перехватчиками для логирования

### API Endpoints

**Authentication:**
- `POST /auth/register` - регистрация
- `POST /auth/login` - вход
- `POST /auth/change-password` - смена пароля
- `POST /auth/refresh` - обновление токена

**Transactions:**
- `GET /transactions` - получить все транзакции
- `POST /transactions` - создать транзакцию
- `PUT /transactions/{id}` - обновить транзакцию
- `DELETE /transactions/{id}` - удалить транзакцию
- `GET /transactions/stats` - получить статистику

**Groups:**
- `GET /groups` - получить все группы
- `POST /groups` - создать группу
- `PUT /groups/{id}` - обновить группу
- `DELETE /groups/{id}` - удалить группу
- `POST /groups/{id}/add-member` - добавить члена

**Analytics:**
- `GET /analytics/overview` - обзор аналитики
- `GET /analytics/{chartType}` - график определенного типа
- `GET /analytics/expenses` - данные по расходам

**AI:**
- `POST /ai/analyze` - анализ бюджета
- `GET /ai/recommendations` - рекомендации

## Маршрутизация

Использует React Router v6 с защитой маршрутов:

```
/                          - Главная страница (публичная)
/login                     - Вход (публичная)
/register                  - Регистрация (публичная)
/dashboard                 - Дашборд (защищенная)
/transactions              - Транзакции (защищенная)
/groups                    - Группы (защищенная)
/analytics                 - Аналитика (защищенная)
```

## Оптимизация производительности

### 1. Code Splitting

Страницы загружаются по требованию через React Router.

### 2. Memoization

Компоненты используют React.memo для предотвращения ненужных перерисовок.

### 3. Service Worker

- Кэширует статические активы
- Offline поддержка
- Network-first strategy для API

### 4. Browser Caching

В Nginx конфигурации:
- 30-дневный кэш для CSS/JS
- no-cache для HTML
- Gzip compression

### 5. Efficient Rendering

- useEffect для управления побочными эффектами
- useCallback для мемоизации функций
- useReducer можно использовать для сложного состояния

## Тестирование

### Стратегия тестирования

1. **Unit Tests** - тестирование отдельных компонентов
2. **Integration Tests** - тестирование взаимодействия компонентов
3. **API Mocking** - использование vi.mock для API вызовов

### Покрытие тестами

Основные сценарии:
- ✅ Форма входа - валидация, отправка, ошибки
- ✅ Форма регистрации - валидация пароля, совпадение
- ✅ Список транзакций - отображение, сортировка
- ✅ Форма транзакции - создание, валидация
- ✅ Список групп - отображение, действия
- ✅ Защита маршрутов - редирект неавторизованных

## Безопасность

### Реализованные меры

1. **Token-based Authentication**
   - JWT токены хранятся в localStorage
   - Автоматическое добавление в заголовки

2. **Protected Routes**
   - Перенаправление неавторизованных пользователей на /login

3. **Session Management**
   - Автоматическое обновление токена
   - Выход при ошибке 401

4. **CORS**
   - Настроено взаимодействие с backend API

## Deployment

### Docker

Multi-stage build:
1. Node.js builder - компилирует React приложение
2. Nginx runtime - раздает статические файлы

### Nginx Features

- Gzip compression
- Static file caching
- SPA routing (try_files)
- API proxy
- Service Worker configuration

## Развертывание в производстве

### 1. Build Docker образа

```bash
docker build -t finance-tracker-frontend:latest ./frontend
```

### 2. Run контейнер

```bash
docker run -p 80:3000 \
  -e REACT_APP_API_URL=https://api.example.com \
  finance-tracker-frontend:latest
```

### 3. Docker Compose

```bash
docker-compose up frontend
```

## Мониторинг и логирование

- Service Worker логирует ошибки
- API Interceptors перехватывают ошибки
- Console логирование в development режиме
- Nginx логирует все запросы

## Расширение приложения

### Добавление новой страницы

1. Создать компонент в `src/pages/`
2. Добавить маршрут в `App.jsx`
3. Добавить навигацию в `Navigation.jsx`

### Добавление нового компонента

1. Создать компонент в `src/components/`
2. Добавить CSS в `src/styles/`
3. Написать тесты в `src/__tests__/`

### Добавление нового API endpoint

1. Добавить метод в `src/services/api.js`
2. Использовать в компоненте через сервис
3. Добавить обработку ошибок

## Зависимости

### Runtime
- react@18.2.0 - UI библиотека
- react-dom@18.2.0 - React DOM
- react-router-dom@6.20.0 - маршрутизация
- axios@1.6.0 - HTTP клиент

### Dev
- vite@5.0.0 - build tool
- vitest@1.0.0 - тестирование
- @testing-library/react@14.1.0 - тесты компонентов
- eslint@8.55.0 - линтинг
- prettier@3.1.0 - форматирование

## Performance Metrics

### Целевые показатели

- Lighthouse Performance: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2.5s
- Core Web Vitals: All Green

## Заключение

Frontend разработан с использованием лучших практик React разработки:
- Модульная архитектура
- Отделение ответственности
- Оптимизация производительности
- Полное тестовое покрытие основных сценариев
- Готовность к production deployment
