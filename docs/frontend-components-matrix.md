# PatenTrack2 Frontend Components Matrix

## Quick Reference Table

### Application Comparison

| Feature | Customer Frontend | Admin Frontend | Share Frontend |
|---------|------------------|----------------|----------------|
| **Package Name** | `@patentrack/web-customer` | `@patentrack/web-admin` | `@patentrack/web-share` |
| **Dev Port** | 3000 | 3001 | 3002 |
| **Authentication** | 2FA (username/password + code) | Single-step (username/password) | URL-based (code/type params) |
| **Auth Endpoint** | `POST /api/v1/auth/signin` | `POST /api/v1/auth/signin/admin` | `GET /api/v1/auth/authenticate/:code/:type` |
| **Routes** | `/`, `/dashboard` | `/`, `/dashboard` | `/`, `/:code/:type`, `/dashboard` |
| **User Role** | Customer | Admin (with role field) | Guest/Shared Viewer |
| **Primary Use** | Patent tracking for customers | System administration | Public share link viewing |

---

## Technology Stack (All Applications)

| Category | Library | Version | Purpose |
|----------|---------|---------|---------|
| **UI Framework** | React | ^18.2.0 | User interface |
| **Rendering** | React DOM | ^18.2.0 | DOM manipulation |
| **Routing** | React Router DOM | ^6.21.3 | Client-side routing |
| **Language** | TypeScript | ^5.3.3 | Type safety |
| **Build Tool** | Vite | ^5.0.12 | Dev server & bundling |
| **State (Global)** | Zustand | ^4.5.0 | State management |
| **State (Server)** | TanStack Query | ^5.17.19 | Data fetching & caching |
| **HTTP Client** | Axios | ^1.12.0 | API requests |
| **Styling** | Tailwind CSS | ^3.4.1 | Utility-first CSS |
| **CSS Processing** | PostCSS | ^8.4.33 | CSS transformations |
| **Autoprefixer** | Autoprefixer | ^10.4.17 | Vendor prefixes |
| **Linting** | ESLint | ^8.56.0 | Code quality |
| **React Plugin** | @vitejs/plugin-react | ^4.2.1 | Vite React support |

---

## Component Breakdown

### Customer Frontend (`web-customer`)

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `main.tsx` | Entry | 26 | App bootstrap, QueryClient setup |
| `App.tsx` | Root | 27 | Route definitions, AuthProvider wrapper |
| `components/ProtectedRoute.tsx` | HOC | 27 | Route authentication guard |
| `context/AuthContext.tsx` | Context | 78 | Auth state + 2FA login logic |
| `lib/api-client.ts` | Utility | 35 | Axios instance with interceptors |
| `pages/Login.tsx` | Page | 127 | 2-step login form |
| `pages/Dashboard.tsx` | Page | 100 | Customer dashboard UI |

**Total Components:** 7  
**Total Lines of Code:** ~420

### Admin Frontend (`web-admin`)

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `main.tsx` | Entry | 26 | App bootstrap, QueryClient setup |
| `App.tsx` | Root | 27 | Route definitions, AuthProvider wrapper |
| `components/ProtectedRoute.tsx` | HOC | 27 | Route authentication guard |
| `context/AuthContext.tsx` | Context | 77 | Admin auth state with role |
| `lib/api-client.ts` | Utility | 35 | Axios instance with interceptors |
| `pages/Login.tsx` | Page | 100 | Single-step admin login |
| `pages/Dashboard.tsx` | Page | 113 | Admin dashboard with stats |

**Total Components:** 7  
**Total Lines of Code:** ~405

### Share Frontend (`web-share`)

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `main.tsx` | Entry | 26 | App bootstrap, QueryClient setup |
| `App.tsx` | Root | 28 | Route definitions with share path |
| `components/ProtectedRoute.tsx` | HOC | 27 | Route authentication guard |
| `context/AuthContext.tsx` | Context | 74 | Code-based authentication |
| `lib/api-client.ts` | Utility | 35 | Axios instance with interceptors |
| `pages/Login.tsx` | Page | 77 | Share link auto-auth handler |
| `pages/Dashboard.tsx` | Page | 96 | Shared content viewer |

**Total Components:** 7  
**Total Lines of Code:** ~363

---

## Route Inventory

### Customer Routes

```typescript
<Route path="/" element={<Login />} />
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

| Path | Public | Component | Features |
|------|--------|-----------|----------|
| `/` | ✅ | Login | Username/password input, 2FA code step |
| `/dashboard` | ❌ | Dashboard | Stats cards, navigation sidebar, activity feed |

### Admin Routes

```typescript
<Route path="/" element={<Login />} />
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

| Path | Public | Component | Features |
|------|--------|-----------|----------|
| `/` | ✅ | Login | Admin username/password login |
| `/dashboard` | ❌ | Dashboard | Admin stats, user/customer management links |

### Share Routes

```typescript
<Route path="/" element={<Login />} />
<Route path="/:code/:type" element={<Login />} />
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

| Path | Public | Component | Features |
|------|--------|-----------|----------|
| `/` | ✅ | Login | Landing for invalid links |
| `/:code/:type` | ✅ | Login | Auto-authentication via URL params |
| `/dashboard` | ❌ | Dashboard | Read-only shared content view |

---

## Navigation Menus

### Customer Dashboard Sidebar
1. Dashboard (current)
2. Patents
3. Analytics
4. Reports

### Admin Dashboard Sidebar
1. Dashboard (current)
2. Users
3. Customers
4. Analytics
5. Settings

### Share Dashboard Sidebar
1. Overview (current)
2. Documents
3. Details

---

## API Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | App | Request Body | Response |
|----------|--------|-----|--------------|----------|
| `/api/v1/auth/signin` | POST | Customer | `{ username, password }` | Token or 2FA challenge |
| `/api/v1/auth/signin` | POST | Customer | `{ username, password, code }` | `{ token, user }` |
| `/api/v1/auth/signin/admin` | POST | Admin | `{ username, password }` | `{ token, user }` |
| `/api/v1/auth/authenticate/:code/:type` | GET | Share | URL params | `{ token, user }` |

### API Client Configuration

| Feature | Implementation |
|---------|----------------|
| Base URL | `/api/v1` |
| Content-Type | `application/json` |
| Auth Header | `Bearer ${token}` from localStorage |
| 401 Handling | Auto logout + redirect to `/` |
| Error Extraction | `error.response?.data?.message` |

---

## State Management Patterns

### Auth Context (Customer)

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, code?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

### Auth Context (Admin)

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;  // Additional field
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;  // No code param
  logout: () => void;
  isLoading: boolean;
}
```

### Auth Context (Share)

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  authenticateWithCode: (code: string, type: string) => Promise<void>;  // Different method
  logout: () => void;
  isLoading: boolean;
}
```

---

## Dashboard Metrics

### Customer Dashboard Cards

| Metric | Current Value | Color |
|--------|---------------|-------|
| Total Patents | 0 | Blue (text-blue-600) |
| Active Monitoring | 0 | Green (text-green-600) |
| Recent Updates | 0 | Purple (text-purple-600) |

### Admin Dashboard Cards

| Metric | Current Value | Color |
|--------|---------------|-------|
| Total Users | 0 | Blue (text-blue-600) |
| Active Customers | 0 | Green (text-green-600) |
| Total Patents | 0 | Purple (text-purple-600) |
| System Status | OK | Yellow (text-yellow-600) |

### Share Dashboard Cards

| Metric | Current Value | Color |
|--------|---------------|-------|
| Document Count | 0 | Blue (text-blue-600) |
| Last Updated | N/A | Gray (text-gray-600) |

---

## Build & Development Commands

### Development Servers

```bash
# Start customer frontend (port 3000)
pnpm --filter @patentrack/web-customer dev

# Start admin frontend (port 3001)
pnpm --filter @patentrack/web-admin dev

# Start share frontend (port 3002)
pnpm --filter @patentrack/web-share dev

# Start all frontends
pnpm --filter "@patentrack/web-*" dev
```

### Production Builds

```bash
# Build customer frontend
pnpm --filter @patentrack/web-customer build

# Build admin frontend
pnpm --filter @patentrack/web-admin build

# Build share frontend
pnpm --filter @patentrack/web-share build

# Build all frontends
pnpm --filter "@patentrack/web-*" build
```

### Quality Checks

```bash
# Lint all frontends
pnpm --filter "@patentrack/web-*" lint

# Type check all frontends
pnpm --filter "@patentrack/web-*" type-check

# Preview production builds
pnpm --filter @patentrack/web-customer preview
pnpm --filter @patentrack/web-admin preview
pnpm --filter @patentrack/web-share preview
```

---

## Vite Configuration

### Port Assignments

| App | Dev Port | API Proxy |
|-----|----------|-----------|
| web-customer | 3000 | http://localhost:4200 |
| web-admin | 3001 | http://localhost:4200 |
| web-share | 3002 | http://localhost:4200 |

### Common Vite Settings

```typescript
{
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: <specific_port>,
    proxy: {
      '/api': {
        target: 'http://localhost:4200',
        changeOrigin: true,
      },
    },
  },
}
```

---

## Styling Utilities (Tailwind)

### Common Classes Used

| Category | Classes |
|----------|---------|
| **Layout** | `min-h-screen`, `max-w-7xl`, `mx-auto`, `flex`, `grid` |
| **Spacing** | `px-4`, `py-2`, `space-y-4`, `gap-6`, `mb-6` |
| **Typography** | `text-2xl`, `text-3xl`, `font-bold`, `font-semibold` |
| **Colors** | `bg-white`, `bg-gray-100`, `text-gray-700`, `text-blue-600` |
| **Effects** | `shadow`, `shadow-md`, `rounded`, `rounded-lg` |
| **Interactive** | `hover:bg-blue-700`, `focus:outline-none`, `focus:ring-2` |
| **Responsive** | `sm:px-6`, `md:grid-cols-2`, `lg:grid-cols-3` |

---

## Missing Features & Gaps

### ❌ Not Implemented

1. **Visualization Libraries**
   - No D3.js
   - No Chart.js
   - No Recharts
   - No data visualization components

2. **Data Fetching**
   - React Query configured but unused
   - No API hooks
   - No real data loading
   - Static placeholder values

3. **Complete Navigation**
   - Sidebar links non-functional (`href="#"`)
   - No sub-pages implemented
   - Limited routing (only Login + Dashboard)

4. **Component Library**
   - No reusable UI components
   - No tables or lists
   - No forms beyond login
   - No modals or dialogs

5. **Advanced Features**
   - No search functionality
   - No filtering/sorting
   - No pagination
   - No real-time updates

### ✅ Implemented & Working

1. **Authentication**
   - JWT token management
   - LocalStorage persistence
   - Auto-redirect on 401
   - Protected routes

2. **Routing**
   - Client-side routing
   - Route guards
   - Auto-redirect logic

3. **UI Foundation**
   - Responsive layouts
   - Consistent styling
   - Header/sidebar structure
   - Card-based design

4. **Infrastructure**
   - TypeScript setup
   - Vite configuration
   - ESLint rules
   - Build pipeline

---

## Development Priorities

### Phase 1: Core Functionality
1. Implement data fetching with React Query
2. Create reusable component library
3. Build actual navigation pages
4. Connect dashboard to real data

### Phase 2: Visualization
1. Add Recharts for simple charts
2. Implement D3.js for custom visualizations
3. Create chart components library
4. Build interactive dashboards

### Phase 3: Features
1. User management (admin)
2. Patent listing and search (customer)
3. Document viewer (share)
4. Analytics and reporting

### Phase 4: Polish
1. Loading states and skeletons
2. Error boundaries
3. Toast notifications
4. Form validation
5. Accessibility improvements

---

## Folder Structure Template

```
apps/web-{app}/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable components
│   │   ├── common/        # Shared UI components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   ├── pages/             # Route page components
│   ├── services/          # API service modules
│   ├── types/             # TypeScript type definitions
│   ├── App.css            # App-specific styles
│   ├── App.tsx            # Root component
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── .eslintrc.js           # ESLint configuration
├── index.html             # HTML template
├── package.json           # Dependencies
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

---

## Quick Facts

- **Total Applications:** 3
- **Total Components:** 21 (7 per app)
- **Total Routes:** 7 (2 customer, 2 admin, 3 share)
- **Lines of Code:** ~1,188 (combined)
- **Dependencies:** 11 runtime, 11 dev
- **Supported Node Version:** Based on `.nvmrc` in root
- **Package Manager:** pnpm (workspace)
- **Monorepo Tool:** Turbo (turbo.json)

---

## URLs & Endpoints Summary

### Development URLs
- Customer: http://localhost:3000
- Admin: http://localhost:3001
- Share: http://localhost:3002
- API Backend: http://localhost:4200

### Share Link Format
```
http://localhost:3002/{code}/{type}
```
Example: `http://localhost:3002/abc123/report`

### API Base
```
/api/v1/*
```
All requests proxied to backend at port 4200
