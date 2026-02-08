# PatenTrack2 Frontend Visual Architecture

## Application Flow Diagrams

### 1. Customer Frontend Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Application                     │
│                   (Port 3000)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │      Browser URL          │
            │   localhost:3000/         │
            └───────────────────────────┘
                            │
            ┌───────────────┴────────────────┐
            │                                │
      ┌─────▼─────┐                  ┌──────▼──────┐
      │  Route: / │                  │  /dashboard │
      │  (Public) │                  │ (Protected) │
      └─────┬─────┘                  └──────┬──────┘
            │                                │
            ▼                                ▼
    ┌───────────────┐              ┌────────────────┐
    │  Login Page   │              │   Dashboard    │
    │               │              │                │
    │ • Username    │              │ • Header       │
    │ • Password    │──Step 1──┐   │ • Sidebar Nav  │
    │ • 2FA Code    │          │   │ • Stats Cards  │
    └───────┬───────┘          │   │ • Activity     │
            │                  │   └────────┬───────┘
            │                  │            │
            ▼                  │            │
    ┌───────────────────┐     │            │
    │  POST /api/v1/    │     │            │
    │  auth/signin      │     │            │
    │  {username, pwd}  │     │            │
    └─────────┬─────────┘     │            │
              │               │            │
              ▼               │            │
    ┌──────────────────┐     │            │
    │ 2FA Challenge?   │     │            │
    │ Show Code Input  │     │            │
    └─────────┬────────┘     │            │
              │               │            │
              ▼               │            │
    ┌───────────────────┐    │            │
    │  POST /api/v1/    │    │            │
    │  auth/signin      │    │            │
    │  {u, p, code}     │    │            │
    └─────────┬─────────┘    │            │
              │               │            │
              ▼               │            │
    ┌────────────────────┐   │            │
    │ Token + User Data  │───┘            │
    │ Store in           │                │
    │ localStorage       │                │
    └──────────┬─────────┘                │
               │                          │
               └──────────────────────────┘
                    Navigate to /dashboard
```

### 2. Admin Frontend Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Application                       │
│                   (Port 3001)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │      Browser URL          │
            │   localhost:3001/         │
            └───────────────────────────┘
                            │
            ┌───────────────┴────────────────┐
            │                                │
      ┌─────▼─────┐                  ┌──────▼──────┐
      │  Route: / │                  │  /dashboard │
      │  (Public) │                  │ (Protected) │
      └─────┬─────┘                  └──────┬──────┘
            │                                │
            ▼                                ▼
    ┌───────────────┐              ┌────────────────┐
    │  Admin Login  │              │ Admin Dashboard│
    │               │              │                │
    │ • Username    │              │ • Header       │
    │ • Password    │              │   (with role)  │
    │ • No 2FA      │              │ • Sidebar:     │
    └───────┬───────┘              │   - Users      │
            │                      │   - Customers  │
            ▼                      │   - Analytics  │
    ┌──────────────────┐           │   - Settings   │
    │  POST /api/v1/   │           │ • Admin Stats  │
    │  auth/signin/    │           └────────┬───────┘
    │  admin           │                    │
    │  {u, p}          │                    │
    └────────┬─────────┘                    │
             │                              │
             ▼                              │
    ┌──────────────────┐                   │
    │ Token + User     │                   │
    │ (with role)      │                   │
    │ localStorage     │                   │
    └────────┬─────────┘                   │
             │                             │
             └─────────────────────────────┘
                  Navigate to /dashboard
```

### 3. Share Frontend Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Share Application                       │
│                   (Port 3002)                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────────┐
            │      Share Link URL           │
            │  localhost:3002/{code}/{type} │
            └───────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
  ┌─────▼─────┐      ┌──────▼───────┐   ┌──────▼──────┐
  │  Route: / │      │ /:code/:type │   │  /dashboard │
  │  (Public) │      │   (Public)   │   │ (Protected) │
  └─────┬─────┘      └──────┬───────┘   └──────┬──────┘
        │                   │                   │
        ▼                   ▼                   ▼
  ┌──────────┐      ┌──────────────┐    ┌──────────────┐
  │  Landing │      │  Auto-Auth   │    │   Shared     │
  │  Page    │      │  Handler     │    │   Content    │
  │          │      │              │    │   Viewer     │
  │ "Use a   │      │ useEffect    │    │              │
  │  valid   │      │ triggers on  │    │ • Overview   │
  │  link"   │      │ mount        │    │ • Documents  │
  └──────────┘      └──────┬───────┘    │ • Details    │
                           │            │ • Read-only  │
                           ▼            └──────────────┘
                  ┌────────────────┐
                  │  GET /api/v1/  │
                  │  auth/         │
                  │  authenticate/ │
                  │  {code}/{type} │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │ Token + Guest  │
                  │ User Data      │
                  │ localStorage   │
                  └────────┬───────┘
                           │
                           └──────► Navigate to /dashboard
```

## Component Hierarchy

### Customer App Component Tree

```
main.tsx
└── <React.StrictMode>
    └── <QueryClientProvider>
        └── <BrowserRouter>
            └── <App>
                └── <AuthProvider>
                    └── <Routes>
                        ├── <Route path="/">
                        │   └── <Login>
                        │       ├── username input
                        │       ├── password input
                        │       └── code input (conditional)
                        │
                        └── <Route path="/dashboard">
                            └── <ProtectedRoute>
                                └── <Dashboard>
                                    ├── <header>
                                    │   ├── title
                                    │   ├── user name
                                    │   └── logout button
                                    ├── <aside>
                                    │   └── <nav>
                                    │       ├── Dashboard
                                    │       ├── Patents
                                    │       ├── Analytics
                                    │       └── Reports
                                    └── <main>
                                        ├── <h2>Dashboard</h2>
                                        ├── Stats Grid
                                        │   ├── Total Patents
                                        │   ├── Active Monitoring
                                        │   └── Recent Updates
                                        └── Recent Activity
```

### Admin App Component Tree

```
main.tsx
└── <React.StrictMode>
    └── <QueryClientProvider>
        └── <BrowserRouter>
            └── <App>
                └── <AuthProvider>
                    └── <Routes>
                        ├── <Route path="/">
                        │   └── <Login>
                        │       ├── username input
                        │       └── password input
                        │
                        └── <Route path="/dashboard">
                            └── <ProtectedRoute>
                                └── <Dashboard>
                                    ├── <header>
                                    │   ├── title
                                    │   ├── user (name + role)
                                    │   └── logout button
                                    ├── <aside>
                                    │   └── <nav>
                                    │       ├── Dashboard
                                    │       ├── Users
                                    │       ├── Customers
                                    │       ├── Analytics
                                    │       └── Settings
                                    └── <main>
                                        ├── <h2>Admin Dashboard</h2>
                                        ├── Stats Grid
                                        │   ├── Total Users
                                        │   ├── Active Customers
                                        │   ├── Total Patents
                                        │   └── System Status
                                        └── Recent Activity
```

### Share App Component Tree

```
main.tsx
└── <React.StrictMode>
    └── <QueryClientProvider>
        └── <BrowserRouter>
            └── <App>
                └── <AuthProvider>
                    └── <Routes>
                        ├── <Route path="/">
                        │   └── <Login>
                        │       └── "Use valid link" message
                        │
                        ├── <Route path="/:code/:type">
                        │   └── <Login>
                        │       └── Auto-auth spinner
                        │
                        └── <Route path="/dashboard">
                            └── <ProtectedRoute>
                                └── <Dashboard>
                                    ├── <header>
                                    │   ├── title
                                    │   ├── viewing as
                                    │   └── exit button
                                    ├── <aside>
                                    │   └── <nav>
                                    │       ├── Overview
                                    │       ├── Documents
                                    │       └── Details
                                    └── <main>
                                        ├── <h2>Shared Content</h2>
                                        ├── Info Panel
                                        ├── Stats Grid
                                        │   ├── Document Count
                                        │   └── Last Updated
                                        └── Documents List
```

## Data Flow Architecture

### Authentication State Flow

```
┌──────────────────────────────────────────────────────────┐
│                    AuthContext Provider                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  State:                                            │  │
│  │  • user: User | null                               │  │
│  │  • isLoading: boolean                              │  │
│  │  • isAuthenticated: boolean                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Methods:                                          │  │
│  │  • login() / authenticateWithCode()                │  │
│  │  • logout()                                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Storage:                                          │  │
│  │  • localStorage.token                              │  │
│  │  • localStorage.user (JSON)                        │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  Login   │    │Protected │    │Dashboard │
  │  Page    │    │  Route   │    │  Page    │
  └──────────┘    └──────────┘    └──────────┘
  • useAuth()     • useAuth()     • useAuth()
  • login()       • isAuth?        • user data
                  • isLoading?     • logout()
```

### API Request Flow

```
Component
    │
    ▼
apiClient.request()
    │
    ├─► Request Interceptor
    │   └─► Add Authorization: Bearer {token}
    │
    ├─► HTTP Request
    │   └─► Proxy: /api → http://localhost:4200
    │
    ├─► Response Interceptor
    │   ├─► 401? → logout() + redirect
    │   └─► Extract error message
    │
    └─► Return to Component
```

### React Query Integration (Configured but Unused)

```
QueryClientProvider
    │
    ├─► defaultOptions:
    │   ├─► refetchOnWindowFocus: false
    │   └─► retry: 1
    │
    └─► Available to all components
        (Not currently utilized)
```

## File Dependencies

### Customer Frontend Dependencies

```
main.tsx
├── React
├── ReactDOM
├── BrowserRouter ◄── react-router-dom
├── QueryClient ◄── @tanstack/react-query
└── App.tsx
    ├── Routes, Route ◄── react-router-dom
    ├── AuthProvider ◄── ./context/AuthContext
    ├── ProtectedRoute ◄── ./components/ProtectedRoute
    ├── Login ◄── ./pages/Login
    └── Dashboard ◄── ./pages/Dashboard

AuthContext.tsx
├── React (createContext, useContext, useState, useEffect)
└── apiClient ◄── ./lib/api-client
    ├── axios
    └── Interceptors

ProtectedRoute.tsx
├── Navigate ◄── react-router-dom
└── useAuth ◄── ./context/AuthContext

Login.tsx
├── useState, useNavigate ◄── react-router-dom
└── useAuth ◄── ./context/AuthContext

Dashboard.tsx
└── useAuth ◄── ./context/AuthContext
```

### Shared Dependencies Across All Apps

```
All package.json files contain:
├── react@^18.2.0
├── react-dom@^18.2.0
├── react-router-dom@^6.21.3
├── @tanstack/react-query@^5.17.19
├── axios@^1.12.0
├── zustand@^4.5.0
├── typescript@^5.3.3
├── vite@^5.0.12
├── tailwindcss@^3.4.1
├── eslint@^8.56.0
└── @vitejs/plugin-react@^4.2.1
```

## API Endpoint Map

```
Backend (Port 4200)
    │
    └── /api/v1/
        │
        ├── /auth/
        │   ├── POST /signin
        │   │   ├─► Customer login (step 1)
        │   │   └─► Customer login (step 2, with code)
        │   │
        │   ├── POST /signin/admin
        │   │   └─► Admin login
        │   │
        │   └── GET /authenticate/:code/:type
        │       └─► Share link authentication
        │
        └── (Other endpoints not yet implemented in UI)
```

## State Persistence Strategy

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │           localStorage                        │ │
│  │                                               │ │
│  │  Keys:                                        │ │
│  │  ├─► "token": "eyJhbG..."                    │ │
│  │  └─► "user": '{"id":"1","name":"..."}'       │ │
│  │                                               │ │
│  │  On App Load:                                 │ │
│  │  AuthContext reads localStorage               │ │
│  │  └─► Sets initial user state                 │ │
│  │                                               │ │
│  │  On Login:                                    │ │
│  │  Saves token + user                           │ │
│  │                                               │ │
│  │  On Logout:                                   │ │
│  │  Clears token + user                          │ │
│  │                                               │ │
│  │  On 401 Error:                                │ │
│  │  Auto-clears token + user                     │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Routing Architecture

### Route Protection Flow

```
Browser navigates to /dashboard
    │
    ▼
<Route path="/dashboard">
    │
    ▼
<ProtectedRoute>
    │
    ├─► useAuth()
    │   ├─► isLoading?
    │   │   └─► Show loading spinner
    │   │
    │   ├─► !isAuthenticated?
    │   │   └─► <Navigate to="/" replace />
    │   │
    │   └─► isAuthenticated?
    │       └─► Render children
    │
    └─► {children}
        └─► <Dashboard />
```

## Build Process Flow

```
Development Mode (npm run dev)
    │
    ├─► Vite Dev Server starts
    │   ├─► Port assignment (3000/3001/3002)
    │   ├─► Hot Module Replacement (HMR)
    │   ├─► API proxy to :4200
    │   └─► TypeScript compilation (on-demand)
    │
    └─► Browser connects
        └─► React Fast Refresh active

Production Build (npm run build)
    │
    ├─► TypeScript compilation (tsc)
    │   └─► Type checking + emit
    │
    ├─► Vite build
    │   ├─► Bundle optimization
    │   ├─► Code splitting
    │   ├─► Asset optimization
    │   └─► Output to dist/
    │
    └─► Build artifacts
        ├─► dist/index.html
        ├─► dist/assets/*.js
        └─► dist/assets/*.css
```

## Styling Architecture

```
Tailwind CSS
    │
    ├─► Config: tailwind.config.js
    │   └─► Content: "./src/**/*.{js,ts,jsx,tsx}"
    │
    ├─► PostCSS Processing
    │   ├─► autoprefixer
    │   └─► tailwindcss
    │
    └─► Output Classes
        ├─► Utilities
        ├─► Components (none custom)
        └─► Base styles

CSS Files:
├─► index.css
│   └─► @tailwind base/components/utilities
└─► App.css
    └─► App-specific overrides
```

## Network Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Client Side                       │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │  Customer  │  │   Admin    │  │   Share    │    │
│  │   :3000    │  │   :3001    │  │   :3002    │    │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │
│        │               │               │            │
│        └───────────────┼───────────────┘            │
│                        │                            │
│                   /api/* requests                   │
│                        │                            │
└────────────────────────┼────────────────────────────┘
                         │
                    Vite Proxy
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│                  Server Side                         │
│                                                      │
│              Backend API Server                      │
│                  :4200                               │
│                                                      │
│  Endpoints:                                          │
│  • POST /api/v1/auth/signin                          │
│  • POST /api/v1/auth/signin/admin                    │
│  • GET  /api/v1/auth/authenticate/:code/:type        │
│  • ... (other endpoints)                             │
└──────────────────────────────────────────────────────┘
```

## Summary Diagram

```
┌────────────────────────────────────────────────────────────┐
│                   PatenTrack2 Frontend                     │
│                      Architecture                          │
└────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼────────────────┐
            │               │                │
            ▼               ▼                ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ Customer  │   │   Admin   │   │   Share   │
    │  :3000    │   │   :3001   │   │   :3002   │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │                │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │React 18.2 │   │React 18.2 │   │React 18.2 │
    │TypeScript │   │TypeScript │   │TypeScript │
    │Vite 5.0   │   │Vite 5.0   │   │Vite 5.0   │
    │Tailwind 3 │   │Tailwind 3 │   │Tailwind 3 │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │                │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │2FA Login  │   │Admin Auth │   │Link Auth  │
    │Dashboard  │   │Dashboard  │   │Viewer     │
    │Patents    │   │Users Mgmt │   │Read-Only  │
    │Analytics  │   │Settings   │   │Docs       │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │                │
          └───────────────┼────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Backend  │
                    │   :4200   │
                    │  API v1   │
                    └───────────┘
```
