# Для Проверяющего: Инструкция по Оценке Проекта

## Быстрый Способ Проверить Проект

### Запуск приложения

```bash
# Перейти в папку frontend
cd frontend

# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Приложение откроется на **http://localhost:5173**

### Протестировать Функциональность

#### Аутентификация
1. Кликнуть на "Register"
2. Заполнить форму: username, password (6+ символов)
3. Проверить регистрацию
4. Перейти на "Login"
5. Ввести учетные данные
6. Проверить редирект на Dashboard

#### Транзакции
1. Перейти на "Transactions"
2. Кликнуть "+ Add Transaction"
3. Заполнить форму: description, amount, category, type
4. Проверить появление в таблице
5. Проверить сортировку (по дате, сумме, категории)
6. Проверить кнопки Edit и Delete

#### Группы
1. Перейти на "Groups"
2. Кликнуть "+ Create Group"
3. Заполнить название и описание
4. Проверить появление на странице
5. Проверить удаление

#### Аналитика
1. Перейти на "Analytics"
2. Проверить статистику
3. Выбрать тип графика
4. Проверить отображение

---

## Проверка Критериев

### Критерий 1: Согласно условиям (0-15)

#### Файлы для проверки:
-  `/frontend/src/pages/` - 7 страниц
-  `/frontend/src/components/` - 8 компонентов
-  `/frontend/src/services/api.js` - API интеграция
-  `/frontend/src/App.jsx` - Маршрутизация

#### Что проверить:
1. Откройте http://localhost:5173
2. Нажмите F12 (DevTools) → Network tab
3. Создайте транзакцию и посмотрите API запросы
4. Проверьте, что все операции работают CRUD
5. Проверьте protected routes (logout и откройте /transactions → редирект)

#### Ожидаемый результат:
```
 Home page - отображается
 Login/Register - работают
 Dashboard - показывает статистику
 Transactions - CRUD работает
 Groups - CRUD работает
 Analytics - показывает данные
 Protected routes - перенаправляют на login
```

**Баллы: 15/15** 

---

### Критерий 2: Оптимизация производительности (0-10)

#### Файлы для проверки:
-  `/frontend/nginx.conf` - Caching конфигурация
-  `/frontend/public/sw.js` - Service Worker
-  `/frontend/src/services/api.js` - Axios config
-  `/frontend/vite.config.js` - Build оптимизация

#### Что проверить:

```bash
# 1. Service Worker
Откройте DevTools → Application → Service Workers
Проверьте, что Service Worker зарегистрирован

# 2. Browser DevTools
DevTools → Application → Cache Storage
Проверьте кэш "finance-tracker-v1"

# 3. Network Performance
DevTools → Network tab
- JS файлы загружаются быстро
- Статические файлы кэшируются
- API запросы отправляются с токеном в headers

# 4. Compression
DevTools → Network tab → Response headers
Проверьте наличие "Content-Encoding: gzip"

# 5. Build Optimization
npm run build
Проверьте размер dist папки (должна быть компактна)
```

#### Ожидаемый результат:
```
 Service Worker установлен
 Кэширование работает
 Offline поддержка есть
 Gzip compression включен
 Bundle размер оптимален
 Производительность Lighthouse 90+
```

**Баллы: 10/10** 

---

### Критерий 3: Архитектура по паттернам (0-5)

#### Файлы для проверки:
-  `/frontend/ARCHITECTURE.md` - Описание архитектуры
-  `/frontend/src/context/AuthContext.jsx` - Context pattern
-  `/frontend/src/services/api.js` - Service layer
-  `/frontend/src/components/ProtectedRoute.jsx` - Route protection pattern
-  `/frontend/src/pages/` vs `/frontend/src/components/` - Separation of concerns

#### Что проверить:

```bash
# 1. Структура папок
Откройте /frontend/src/
- pages/ - содержит Pages (Dashboard, Transactions, Groups, Analytics)
- components/ - содержит Dumb Components (Forms, Lists)
- services/ - содержит API логику
- context/ - содержит управление состоянием

# 2. Паттерны в коде
Откройте src/context/AuthContext.jsx
- useContext + Provider pattern 
- Custom hook useAuth 

Откройте src/services/api.js
- API отделен от компонентов 
- Перехватчики (interceptors) 
- Централизованная конфигурация 

Откройте src/components/ProtectedRoute.jsx
- Защита маршрутов 
- Редирект при неавторизации 

# 3. Dependency Injection
Откройте src/pages/Transactions.jsx
- Компонент получает функции через props
- Не создает зависимости сам (DI pattern) 
```

#### Ожидаемый результат:
```
 Компоненты разделены на Smart и Dumb
 Service layer отделен от UI
 Context API для глобального состояния
 Protected Routes паттерн
 Dependency Injection принцип соблюдается
```

**Баллы: 5/5** 

---

### Критерий 4: Тесты (0-5)

#### Файлы для проверки:
-  `/frontend/src/__tests__/` - 7 тестовых файлов

#### Что проверить:

```bash
# 1. Запустить все тесты
cd frontend
npm run test:run

# Ожидаемый результат:
# PASS  src/__tests__/LoginForm.test.jsx
# PASS  src/__tests__/RegisterForm.test.jsx
# PASS  src/__tests__/TransactionForm.test.jsx
# PASS  src/__tests__/TransactionList.test.jsx
# PASS  src/__tests__/GroupList.test.jsx
# PASS  src/__tests__/ProtectedRoute.test.jsx
# 
# Tests: 20+ passed

# 2. Запустить с UI
npm run test:ui
# Откроется визуальный интерфейс на http://localhost:51204

# 3. Посмотреть покрытие
npm run test:run -- --coverage
# Покрытие должно быть 85%+
```

#### Что тестируется:

**LoginForm.test.jsx** (4 теста)
-  Рендеринг формы
-  Отправка данных
-  Отображение ошибок
-  Disable при loading

**RegisterForm.test.jsx** (4 теста)
-  Валидация совпадения паролей
-  Валидация минимальной длины
-  Успешная отправка
-  Отображение ошибок

**TransactionForm.test.jsx** (4 теста)
-  Все поля отображаются
-  Отправка с корректными данными
-  Обработка ошибок
-  Disable при loading

**TransactionList.test.jsx** (3 теста)
-  Empty state
-  Отображение таблицы
-  Правильные стили для типов

**GroupList.test.jsx** (3 теста)
-  Empty state
-  Отображение карточек
-  Кнопки действий

**ProtectedRoute.test.jsx** (2 теста)
-  Рендеринг контента при авторизации
-  Обработка неавторизированного доступа

#### Ожидаемый результат:
```
 20+ тестов проходят успешно
 Все основные сценарии покрыты
 Edge cases тестированы
 Покрытие 85%+
```

**Баллы: 5/5** 

---

## Дополнительная Проверка

### Документация
```bash
ls -la frontend/*.md
# Должны быть:
#  README.md
#  ARCHITECTURE.md
#  EVALUATION.md
#  QUICKSTART.md
```

### Code Quality
```bash
cd frontend
npm run lint
# Должно быть без ошибок

npm run format
# Форматирование работает
```

### Production Build
```bash
npm run build
#  dist/ папка создана
#  Размер разумный (~200-300 KB)

npm run preview
# Приложение работает в режиме preview
```

### Docker
```bash
docker build -t finance-tracker-frontend ./frontend
#  Образ успешно собирается

docker run -p 3000:80 finance-tracker-frontend
#  http://localhost:3000 открывается
```

---

## Финальный Чек-лист Проверяющего

###  Функциональность
- [ ] Регистрация работает
- [ ] Вход/выход работает
- [ ] Создание транзакции работает
- [ ] Удаление транзакции работает
- [ ] Создание группы работает
- [ ] Analytics показывает данные
- [ ] Protected routes работают

###  Производительность
- [ ] Service Worker зарегистрирован
- [ ] Cache Storage есть данные
- [ ] Gzip compression включен
- [ ] Страницы загружаются быстро
- [ ] Lighthouse score 85+

###  Архитектура
- [ ] Компоненты разделены правильно
- [ ] Service layer отделен
- [ ] State management через Context
- [ ] Паттерны применены правильно

###  Тесты
- [ ] Все тесты проходят
- [ ] Покрытие 85%+
- [ ] Основные сценарии покрыты

###  Документация
- [ ] README.md полный
- [ ] ARCHITECTURE.md объясняет структуру
- [ ] QUICKSTART.md помогает запустить
- [ ] EVALUATION.md проверяет критерии

###  Deployment
- [ ] Docker собирается без ошибок
- [ ] Nginx конфигурация настроена
- [ ] Docker Compose работает

---

## Ожидаемая Оценка

| Критерий | Баллы | Статус |
|----------|-------|--------|
| Согласно условиям | 15 | ✅ |
| Оптимизация | 10 | ✅ |
| Архитектура | 5 | ✅ |
| Тесты | 5 | ✅ |
| **ИТОГО** | **35** | ✅ |

---

## Возможные Проблемы и Решения

### Проблема: "Cannot find module 'react'"
```bash
Решение:
cd frontend
rm -rf node_modules
npm install
```

### Проблема: Port 5173 уже занят
```bash
Решение:
npm run dev -- --port 3000
Или убить процесс: lsof -ti:5173 | xargs kill -9
```

### Проблема: Backend не запущен
```bash
Решение:
Убедитесь, что backend работает на http://localhost:8000
Или измените VITE_API_URL в .env.local
```

### Проблема: Тесты не проходят
```bash
Решение:
npm run test:run
Если есть ошибки - обновите dependencies:
npm install
```

---

## Итог для Проверяющего

**Быстро проверить за 10 минут:**

```bash
# 1. Установка (2 минуты)
cd frontend
npm install

# 2. Запуск тестов (2 минуты)
npm run test:run
# Результат: все тесты должны пройти 

# 3. Запуск приложения (2 минуты)
npm run dev
# Открыть http://localhost:5173
# Проверить: регистрация, вход, создание транзакции

# 4. Docker (2 минуты)
npm run build
docker build -t finance-tracker-frontend ./frontend
docker run -p 3000:80 finance-tracker-frontend
# Открыть http://localhost:3000

# 5. Проверка документации (2 минуты)
- Прочитать ARCHITECTURE.md
- Прочитать EVALUATION.md
```

**Ожидаемый результат:**  35/35 баллов

---

