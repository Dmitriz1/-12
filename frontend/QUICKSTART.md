# Quick Start Guide - Finance Tracker Frontend

## 🚀 Быстрый старт

### Требования
- Node.js 18+ ([скачать](https://nodejs.org/))
- npm 9+ (идет с Node.js)
- Docker & Docker Compose (опционально для развертывания)

### Установка и запуск (5 минут)

```bash
# 1. Перейти в папку frontend
cd frontend

# 2. Установить зависимости
npm install

# 3. Создать .env.local файл
cp .env.example .env.local

# 4. Запустить dev сервер
npm run dev
```

Приложение откроется на **http://localhost:5173**

---

## 📋 Основные команды

| Команда | Описание |
|---------|---------|
| `npm run dev` | Запуск dev сервера с HMR |
| `npm run build` | Собрать для production |
| `npm run preview` | Просмотр production сборки |
| `npm run test` | Запуск тестов в watch режиме |
| `npm run test:ui` | Тесты с UI интерфейсом |
| `npm run test:run` | Запуск тестов один раз (CI) |
| `npm run lint` | Проверка кода |
| `npm run format` | Форматирование кода |

---

## 🔌 Интеграция с Backend

### Конфигурация API

В файле `.env.local`:

```env
# Для локальной разработки
VITE_API_URL=http://localhost:8000

# Для production
VITE_API_URL=https://api.example.com
```

### Запуск с backend

**Вариант 1: Локально с proxy**
```bash
# Terminal 1 - Backend (из корня проекта)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend (из папки frontend)
npm run dev
```

**Вариант 2: Docker Compose** (рекомендуется)
```bash
# Из корня проекта
docker-compose -f docker-compose.override.yml up
```

Приложение будет доступно на:
- Frontend: http://localhost
- Backend: http://localhost:8000
- Database: localhost:5432

---

## 📝 Первые шаги в приложении

1. **Регистрация**
   - Перейти на `/register`
   - Заполнить форму (username, пароль 6+ символов)
   - Нажать "Register"

2. **Вход**
   - Перейти на `/login`
   - Ввести учетные данные
   - Вы попадете на Dashboard

3. **Создать транзакцию**
   - Перейти на "Transactions"
   - Нажать "+ Add Transaction"
   - Заполнить форму
   - Сохранить

4. **Создать группу**
   - Перейти на "Groups"
   - Нажать "+ Create Group"
   - Заполнить название и описание
   - Сохранить

5. **Просмотреть аналитику**
   - Перейти на "Analytics"
   - Выбрать тип графика
   - Посмотреть статистику

---

## 🧪 Тестирование

### Запуск всех тестов

```bash
npm run test:run
```

### Watch режим (для разработки)

```bash
npm run test
```

### С UI (визуальный интерфейс)

```bash
npm run test:ui
```

Откроется интерфейс на http://localhost:51204 (или другой порт)

### Тестовые сценарии

Тесты покрывают:
- ✅ Аутентификация (вход, регистрация)
- ✅ Управление транзакциями
- ✅ Управление группами
- ✅ Валидация форм
- ✅ Сортировка и фильтрация
- ✅ Защита маршрутов

---

## 🐳 Docker развертывание

### Локальная разработка

```bash
# Собрать образ
docker build -t finance-tracker-frontend:dev ./frontend

# Запустить контейнер
docker run -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:8000 \
  finance-tracker-frontend:dev
```

Приложение на: http://localhost:3000

### Production развертывание

```bash
# 1. Build образа
docker build -t finance-tracker-frontend:latest ./frontend

# 2. Push на Docker Hub (опционально)
docker tag finance-tracker-frontend:latest username/finance-tracker-frontend:latest
docker push username/finance-tracker-frontend:latest

# 3. Deploy через Docker
docker run -d -p 80:80 \
  -e REACT_APP_API_URL=https://api.example.com \
  finance-tracker-frontend:latest

# 4. Docker Compose (all-in-one)
docker-compose -f docker-compose.override.yml up -d
```

---

## 🔍 Debug режим

### Browser DevTools

Откройте приложение в браузере и нажмите F12:

**Network tab:**
- Посмотреть все API запросы
- Проверить статусы и ответы
- Проверить headers с токеном

**Application tab:**
- Посмотреть localStorage (токен)
- Service Worker статус
- Cache storage

**Console tab:**
- Ошибки приложения
- ServiceWorker логи
- Любые сообщения от приложения

### VSCode Debug

Создать `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

---

## 🆘 Решение проблем

### Ошибка: Cannot find module 'react'

**Решение:**
```bash
rm -rf node_modules
npm install
```

### CORS ошибка при запросе к API

**Проверить:**
1. Backend запущен на правильном порту (8000)
2. `VITE_API_URL` указывает на правильный адрес
3. Backend позволяет CORS запросы

### Token expired / Unauthorized

**Это нормально! Приложение:**
1. Перенаправляет на страницу логина
2. Стирает старый токен
3. Просит повторной аутентификации

### Страница показывает "No transactions found"

**Это нормально:**
1. Создайте новую транзакцию через форму
2. Или создайте данные через API
3. Они появятся на странице

---

## 📚 Документация

Подробную информацию найдете в:

- **[README.md](./README.md)** - общая информация о проекте
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - архитектура приложения
- **[EVALUATION.md](./EVALUATION.md)** - проверка по критериям оценки

---

## 💡 Полезные ссылки

- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite Docs](https://vitejs.dev)
- [Vitest Docs](https://vitest.dev)
- [Axios Docs](https://axios-http.com)

---

## 📞 Контакты и поддержка

При возникновении проблем:
1. Проверьте эту документацию
2. Посмотрите ошибки в консоли браузера
3. Проверьте Network tab в DevTools
4. Убедитесь что backend запущен

---

## ✨ Следующие шаги

После успешного запуска:

1. **Кастомизация**
   - Измените цвета в `src/styles/App.css`
   - Добавьте новые компоненты
   - Расширьте функциональность

2. **Production**
   - Замените `VITE_API_URL` на production адрес
   - Запустите `npm run build`
   - Deploy на Vercel, Netlify или свой сервер

3. **Мониторинг**
   - Добавьте аналитику
   - Настройте логирование
   - Мониторьте производительность

---

**Готово? Начинайте разработку! 🎉**
