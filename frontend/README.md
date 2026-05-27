# Frontend README

## Finance Tracker Frontend

A modern React-based web application for managing personal finances and shared expenses.

### Features

- 🔐 User authentication (register, login, password change)
- 💰 Transaction tracking (income and expenses)
- 👥 Expense groups for shared costs
- 📊 Analytics and visualizations
- 🔄 Real-time API integration
- 📱 Responsive design
- ⚡ Optimized performance with code splitting
- 🛡️ Service Worker for offline support

### Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Docker & Nginx** - Containerization and deployment

### Getting Started

#### Prerequisites

- Node.js 18+
- npm or yarn

#### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Update environment variables if needed:
```env
VITE_API_URL=http://localhost:8000
```

#### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

#### Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests once (CI mode):
```bash
npm run test:run
```

### Code Quality

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

### Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components (routes)
│   ├── services/           # API services
│   ├── context/            # React context (auth state)
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS stylesheets
│   ├── __tests__/          # Test files
│   ├── App.jsx             # Root component
│   └── main.jsx            # Entry point
├── public/
│   └── sw.js              # Service Worker
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── vitest.config.js       # Test configuration
├── Dockerfile             # Docker image definition
├── nginx.conf             # Nginx server config
└── package.json           # Dependencies and scripts
```

### API Integration

The app connects to the backend API at the configured `VITE_API_URL`.

#### API Endpoints Used:

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/change-password` - Change password
- `POST /auth/refresh` - Refresh token
- `GET/POST /transactions` - Manage transactions
- `GET/POST /groups` - Manage expense groups
- `GET /analytics` - Get analytics data
- `POST /ai/analyze` - AI-powered analysis

### Authentication

The app uses token-based authentication. The JWT token is stored in `localStorage` and automatically added to API requests.

Token refresh logic is handled automatically when making API calls.

### Docker Deployment

#### Build Docker image:
```bash
docker build -t finance-tracker-frontend .
```

#### Run container:
```bash
docker run -p 80:3000 finance-tracker-frontend
```

#### Using Docker Compose:
```bash
docker-compose up frontend
```

### Performance Optimizations

- **Code Splitting**: Lazy-loaded page components
- **Caching**: Service Worker for offline support
- **Compression**: Gzip compression in Nginx
- **Browser Caching**: Long-term caching for static assets
- **Minification**: Automatic minification in production build

### Service Worker Features

- Offline support with cache fallback
- Network-first strategy for dynamic content
- Cache validation and updates
- Message handling for cache updates

### Testing Strategy

Tests cover:
- Form validation and submission
- Component rendering
- User interactions
- API integration (mocked)
- Navigation and routing
- Auth flow

Example test categories:
- **LoginForm** - Auth form functionality
- **TransactionForm** - Transaction creation
- **TransactionList** - Transaction display and sorting
- **GroupList** - Group display and management
- **ProtectedRoute** - Auth protection

### Configuration

#### Environment Variables

Create `.env.local` in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# App Settings
VITE_APP_TITLE=Finance Tracker
```

### Troubleshooting

#### CORS Issues
Make sure the backend is configured to accept requests from the frontend origin.

#### API Connection Issues
Check that:
1. Backend is running on the correct URL
2. `VITE_API_URL` is set correctly
3. Network requests show in browser DevTools

#### Build Issues
Clear cache and reinstall:
```bash
rm -rf node_modules
npm install
npm run build
```

### Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browsers with ES2020 support

### License

MIT
