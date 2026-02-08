# 05 - Frontend Features

**React components, pages, routes, API integration, and visualization libraries**

---

## Overview

Three React 17 applications with Material-UI v5:

| Application | Purpose | Port | Auth | Components |
|-------------|---------|------|------|------------|
| **PT-App** | Customer portal | 3000 | 2FA + Google | 100+ |
| **PT-Admin** | Admin console | 3001 | Single-step | 45 |
| **PT-Share** | Public viewer | 3002 | UUID link | 25 |

---

## 1. PT-App (Customer Application)

### Technology Stack
```json
{
  "framework": "React 17.0.2",
  "ui": "@mui/material 5.4.3",
  "state": "redux 4.0.5 + react-redux 7.2.3",
  "routing": "react-router-dom 5.2.0",
  "data": "axios 0.21.1 + react-query 3.13.0",
  "charts": "chart.js 3.9.1 + react-chartjs-2 2.11.1",
  "d3": "d3 5.16.0",
  "timelines": "vis-timeline 7.5.0",
  "tables": "material-table 1.69.3 + mui-datatables 3.7.6",
  "wordcloud": "react-wordcloud 1.2.7 + chartjs-chart-wordcloud 3.9.1",
  "editor": "react-quill 1.3.5",
  "drag": "react-draggable 4.4.3",
  "auth": "react-google-login 5.2.2 + @azure/msal-react 1.5.4"
}
```

### Component Hierarchy
```
src/
├── components/
│   ├── Dashboard/
│   │   ├── DashboardHome.jsx         # Main landing page
│   │   ├── PortfolioMetrics.jsx      # KPI cards
│   │   ├── TechnologyBreakdown.jsx   # Tech classification chart
│   │   └── FilingTrends.jsx          # Time-series line chart
│   ├── Assets/
│   │   ├── AssetList.jsx             # Material-table with patents
│   │   ├── AssetDetail.jsx           # Patent detail view
│   │   ├── AssetCompare.jsx          # Side-by-side comparison
│   │   └── BulkActions.jsx           # Batch operations
│   ├── Family/
│   │   ├── FamilyTree.jsx            # D3.js hierarchical tree
│   │   ├── FamilyGraph.jsx           # Network graph visualization
│   │   └── FamilyTimeline.jsx        # Vis-timeline prosecution history
│   ├── Events/
│   │   ├── EventTimeline.jsx         # vis-timeline integration
│   │   ├── EventList.jsx             # Tabular event list
│   │   └── EventDetail.jsx           # Event detail drawer
│   ├── Search/
│   │   ├── SearchBar.jsx             # Full-text search input
│   │   ├── SearchResults.jsx         # Results grid
│   │   ├── AdvancedFilters.jsx       # Filter sidebar
│   │   └── SavedSearches.jsx         # Saved search management
│   ├── Documents/
│   │   ├── DocumentLibrary.jsx       # Document grid with thumbnails
│   │   ├── DocumentViewer.jsx        # PDF/image viewer
│   │   ├── DocumentUploader.jsx      # Drag-drop uploader
│   │   └── DocumentAnnotations.jsx   # Annotation tools
│   ├── Charts/
│   │   ├── AssigneeBarChart.jsx      # Top assignees (Chart.js)
│   │   ├── TechnologyWordCloud.jsx   # react-wordcloud integration
│   │   ├── GeographyMap.jsx          # Country/state choropleth
│   │   ├── FilingLineChart.jsx       # Time-series filings
│   │   └── StatusPieChart.jsx        # Patent status distribution
│   ├── Collaboration/
│   │   ├── Comments.jsx              # Threaded comments
│   │   ├── Activities.jsx            # Activity feed
│   │   ├── Share.jsx                 # Generate share links
│   │   └── Notifications.jsx         # Notification center
│   └── Common/
│       ├── Header.jsx                # Top navigation bar
│       ├── Sidebar.jsx               # Left navigation drawer
│       ├── Footer.jsx                # Footer
│       ├── Loading.jsx               # Loading spinner
│       ├── ErrorBoundary.jsx         # Error handling
│       └── ConfirmDialog.jsx         # Confirmation modal
```

### Routes
```javascript
// src/routes.js
const routes = [
  { path: '/login', component: Login },
  { path: '/verify', component: VerifyCode },
  { path: '/dashboard', component: Dashboard, auth: true },
  { path: '/assets', component: AssetList, auth: true },
  { path: '/assets/:id', component: AssetDetail, auth: true },
  { path: '/family/:id', component: FamilyTree, auth: true },
  { path: '/events', component: EventTimeline, auth: true },
  { path: '/search', component: Search, auth: true },
  { path: '/documents', component: DocumentLibrary, auth: true },
  { path: '/charts', component: ChartsPage, auth: true },
  { path: '/settings', component: Settings, auth: true },
  { path: '/settings/users', component: UserManagement, auth: true },
  { path: '/settings/integrations', component: Integrations, auth: true },
];
```

### Redux Store Structure
```javascript
// src/reducers/
{
  auth: {
    user: {},
    token: '',
    isAuthenticated: false,
    loading: false
  },
  assets: {
    list: [],
    current: {},
    filters: {},
    loading: false,
    error: null
  },
  family: {
    tree: {},
    loading: false
  },
  events: {
    timeline: [],
    filters: {},
    loading: false
  },
  ui: {
    sidebarOpen: true,
    darkMode: false,
    notifications: []
  }
}
```

### API Integration Pattern
```javascript
// src/api/client.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4200';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach JWT
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('x-auth-token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('x-auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Visualization Libraries

#### Chart.js Integration
```javascript
// src/components/Charts/FilingLineChart.jsx
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: years,
  datasets: [{
    label: 'Patent Filings',
    data: filingCounts,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};

<Line data={data} options={options} />
```

#### D3.js Family Tree
```javascript
// src/components/Family/FamilyTree.jsx
import * as d3 from 'd3';

useEffect(() => {
  const svg = d3.select(svgRef.current);
  const tree = d3.tree().size([height, width]);
  const root = d3.hierarchy(familyData);
  
  const nodes = tree(root);
  
  svg.selectAll('.link')
    .data(nodes.links())
    .enter().append('path')
    .attr('class', 'link')
    .attr('d', d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));
      
  svg.selectAll('.node')
    .data(nodes.descendants())
    .enter().append('circle')
    .attr('class', 'node')
    .attr('cx', d => d.y)
    .attr('cy', d => d.x)
    .attr('r', 5);
}, [familyData]);
```

#### Vis-timeline Integration
```javascript
// src/components/Events/EventTimeline.jsx
import { Timeline } from 'vis-timeline';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

useEffect(() => {
  const items = events.map(event => ({
    id: event.id,
    content: event.type,
    start: new Date(event.date),
    type: 'box',
    className: `event-${event.category}`
  }));
  
  const timeline = new Timeline(
    containerRef.current,
    items,
    options
  );
  
  return () => timeline.destroy();
}, [events]);
```

#### Word Cloud
```javascript
// src/components/Charts/TechnologyWordCloud.jsx
import ReactWordcloud from 'react-wordcloud';

const words = keywords.map(k => ({ text: k.word, value: k.count }));

<ReactWordcloud
  words={words}
  options={{
    rotations: 2,
    rotationAngles: [0, 90],
    fontSizes: [12, 60]
  }}
/>
```

---

## 2. PT-Admin-Application (Admin Console)

### Purpose
System administration, customer management, user provisioning, company search.

### Technology Stack
Same as PT-App but lighter dependency set (45 deps vs 92).

### Key Components
```
src/components/
├── Customers/
│   ├── CustomerList.jsx
│   ├── CustomerDetail.jsx
│   ├── CreateCustomer.jsx
│   └── DatabaseProvisioning.jsx
├── Users/
│   ├── UserList.jsx
│   ├── UserForm.jsx
│   └── RoleManagement.jsx
├── CompanySearch/
│   ├── GlobalSearch.jsx
│   └── SearchResults.jsx
├── Keywords/
│   ├── KeywordManager.jsx
│   └── TaxonomyEditor.jsx
└── Analytics/
    ├── UsageMetrics.jsx
    └── SystemHealth.jsx
```

### Routes
```javascript
[
  '/admin/login',
  '/admin/dashboard',
  '/admin/customers',
  '/admin/customers/:id',
  '/admin/users',
  '/admin/company-search',
  '/admin/keywords',
  '/admin/analytics'
]
```

---

## 3. PT-Share (Public Share Viewer)

### Purpose
Read-only patent portfolio viewer accessed via UUID share links.

### Technology Stack
Minimal React app (32 deps) - read-only, no authentication.

### Key Components
```
src/components/
├── ShareView.jsx          # Main shared portfolio view
├── AssetGrid.jsx          # Read-only patent grid
├── AssetDetailModal.jsx   # Patent popup
└── ChartsSummary.jsx      # Basic analytics charts
```

### Routes
```javascript
[
  '/share/:shareCode',
  '/share/:shareCode/assets',
  '/share/:shareCode/charts'
]
```

### Authorization
```javascript
// Validate share code on mount
useEffect(() => {
  apiClient.get(`/share/validate/${shareCode}`)
    .then(res => {
      if (res.data.valid && !res.data.expired) {
        setAuthorized(true);
        fetchSharedData(shareCode);
      } else {
        setError('Invalid or expired share link');
      }
    });
}, [shareCode]);
```

---

## Visualization Feature Matrix

| Feature | PT-App | PT-Admin | PT-Share | Library |
|---------|--------|----------|----------|---------|
| Line Charts | ✅ | ✅ | ✅ | Chart.js |
| Bar Charts | ✅ | ✅ | ✅ | Chart.js |
| Pie Charts | ✅ | ✅ | ✅ | Chart.js |
| Word Cloud | ✅ | ❌ | ❌ | react-wordcloud |
| Family Tree | ✅ | ❌ | ❌ | D3.js |
| Timeline | ✅ | ❌ | ❌ | vis-timeline |
| Network Graph | ✅ | ❌ | ❌ | D3.js |
| Data Tables | ✅ | ✅ | ✅ | material-table |
| Drag & Drop | ✅ | ❌ | ❌ | react-draggable |
| Rich Text Editor | ✅ | ❌ | ❌ | react-quill |

---

## State Management Patterns

### Redux Thunk Actions
```javascript
// src/actions/assets.js
export const fetchAssets = (filters) => async (dispatch) => {
  dispatch({ type: 'FETCH_ASSETS_REQUEST' });
  try {
    const res = await apiClient.get('/assets', { params: filters });
    dispatch({ type: 'FETCH_ASSETS_SUCCESS', payload: res.data });
  } catch (err) {
    dispatch({ type: 'FETCH_ASSETS_FAILURE', payload: err.message });
  }
};
```

### React Query Integration (Unused)
**Note:** react-query 3.13.0 installed but not implemented in legacy code.
Current pattern uses Redux Thunk exclusively.

---

## UI/UX Patterns

### Material-UI Theme
```javascript
// src/themes/index.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif'
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' }
  }
});
```

### Dark Mode Toggle
```javascript
// src/useDarkMode.js
export default function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  return [darkMode, setDarkMode];
}
```

---

## Performance Optimizations

### Code Splitting
```javascript
// src/routes.js
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const AssetList = lazy(() => import('./components/Assets/AssetList'));

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Virtualization (react-virtualized)
```javascript
// src/components/Assets/AssetList.jsx
import { List } from 'react-virtualized';

<List
  width={width}
  height={height}
  rowCount={assets.length}
  rowHeight={80}
  rowRenderer={({ index, key, style }) => (
    <AssetRow key={key} style={style} asset={assets[index]} />
  )}
/>
```

---

## Next Steps

Proceed to [06-data-flow-diagram.md](./06-data-flow-diagram.md) for system architecture diagrams.
