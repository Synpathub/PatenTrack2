# PatenTrack

**Patent Portfolio Oversight for C-Suite Executives**

PatenTrack is a B2B patent intelligence platform that provides comprehensive patent portfolio management, ownership tracking, and transaction analysis for corporations, banks, law firms, universities, and government entities.

## 🏗 Architecture

This is a TypeScript monorepo consolidating all PatenTrack services:

```
PatenTrack2/
├── packages/           # Shared libraries & backend services
│   ├── core/          # Domain types, validation, constants
│   ├── shared/        # Logger, config, utilities
│   ├── db/            # Database schema, migrations, repositories
│   ├── api/           # Fastify REST API + WebSocket
│   ├── ingestion/     # USPTO/EPO data ingestion workers
│   ├── processing/    # Entity normalization, analysis workers
│   ├── scheduler/     # Cron jobs & scheduled tasks
│   └── monitoring/    # Health checks, alerts, reporting
├── apps/              # Front-end applications
│   ├── web-admin/     # Admin dashboard (React + Vite)
│   ├── web-customer/  # Customer portal (React + Vite)
│   └── web-share/     # Public share viewer (React + Vite)
└── infrastructure/    # Deployment & operations
    ├── docker/        # Docker Compose for local dev
    ├── pm2/           # PM2 process management
    ├── scripts/       # Deployment scripts
    └── monitoring/    # Health reports
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (use `nvm` with `.nvmrc`)
- pnpm 8+
- Docker & Docker Compose

### Installation

```bash
# Clone repository
git clone https://github.com/Synpathub/PatenTrack2.git
cd PatenTrack2

# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL, Redis)
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Run database migrations
pnpm db:migrate

# Seed database with test data
pnpm db:seed

# Start development servers
pnpm dev
```

**Services will be available at:**
- 🌐 API Server: http://localhost:4200
- 🏥 Health Check: http://localhost:4200/health
- 📚 API Docs: http://localhost:4200/docs
- 👥 Customer Portal: http://localhost:3000
- 🔧 Admin Portal: http://localhost:3001
- 🔗 Share Viewer: http://localhost:3002

### Test Credentials

After running `pnpm db:seed`, use these credentials (password: `password123`):

- **Super Admin:** `admin`
- **Acme Corp Admin:** `acme_admin`
- **Acme Corp User:** `acme_user`
- **FNB Admin:** `fnb_admin`

## 📦 Packages

### Backend Services

| Package | Description |
|---------|-------------|
| `@patentrack/core` | Domain types, validation schemas, constants |
| `@patentrack/shared` | Logger, config, error classes, utilities |
| `@patentrack/db` | Drizzle ORM schema, migrations, repositories |
| `@patentrack/api` | Fastify REST API server |
| `@patentrack/ingestion` | USPTO/EPO data ingestion workers |
| `@patentrack/processing` | Entity normalization & analysis |
| `@patentrack/scheduler` | Scheduled jobs & cron tasks |
| `@patentrack/monitoring` | Health checks & GitHub alerting |

### Front-End Apps

| App | Port | Description |
|-----|------|-------------|
| `web-customer` | 3000 | Customer patent portfolio dashboard |
| `web-admin` | 3001 | Admin configuration & management |
| `web-share` | 3002 | Public share link viewer |

## 🛠 Development

### Common Commands

```bash
# Install dependencies
pnpm install

# Run all dev servers
pnpm dev

# Build all packages
pnpm build

# Lint all code
pnpm lint

# Type-check all code
pnpm type-check

# Run all tests
pnpm test

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

### Package-Specific Commands

```bash
# Work on a specific package
pnpm --filter @patentrack/api dev
pnpm --filter @patentrack/api test
pnpm --filter @patentrack/api build

# Work on a specific app
pnpm --filter web-customer dev
```

### Database Commands

```bash
# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## 🏭 Production Deployment

### Prerequisites

- Linux server with Docker
- PM2 installed globally
- Environment variables configured in `.env`

### Deploy

```bash
# On server: /opt/patentrack
./infrastructure/scripts/deploy.sh
```

This script will:
1. Pull latest code from `main` branch
2. Install dependencies
3. Build all packages
4. Run database migrations
5. Reload PM2 services
6. Verify health

### Process Management

```bash
# Start all services
./infrastructure/scripts/start.sh

# Stop all services
./infrastructure/scripts/stop.sh

# Check health
./infrastructure/scripts/health-check.sh

# View logs
pm2 logs

# Monitor processes
pm2 monit
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
pnpm --filter @patentrack/db test
```

## 📊 Monitoring

### Health Checks

- **Liveness:** `GET /health` - Returns OK if process is running
- **Readiness:** `GET /health/ready` - Checks database & Redis connectivity

### Automated Monitoring

- PM2 process monitoring
- Scheduled health checks (daily at 6 AM UTC)
- Automatic GitHub Issue creation on failures
- Daily health reports in `infrastructure/monitoring/reports/`

## 🏛 Architecture Decisions

See `docs/adr/` for detailed architecture decision records:

1. [Full-Stack TypeScript](docs/adr/001-typescript-fullstack.md)
2. [PostgreSQL Over MySQL](docs/adr/002-postgresql-migration.md)
3. [Row-Level Security for Multi-Tenancy](docs/adr/003-rls-multitenancy.md)
4. [Fastify API Framework](docs/adr/004-fastify-api-framework.md)
5. [Drizzle ORM](docs/adr/005-drizzle-orm.md)
6. [BullMQ Job Queue](docs/adr/006-bullmq-job-queue.md)
7. [Monorepo Structure](docs/adr/007-monorepo-structure.md)

## 🔒 Security

- **Multi-tenancy:** Row-Level Security (RLS) ensures tenant isolation
- **Authentication:** JWT tokens with bcrypt password hashing
- **Rate Limiting:** Prevents brute-force attacks
- **Input Validation:** Zod schemas validate all API inputs
- **CORS:** Configured origins whitelist
- **Security Scanning:** CodeQL checks on every PR

## 🤝 Contributing

### Workflow

1. Create feature branch from `main`
2. Make changes
3. Run `pnpm lint && pnpm type-check && pnpm test`
4. Commit with conventional commits format
5. Open PR to `main`
6. CI must pass (lint, type-check, test, build)
7. Requires 1 approval
8. Merge → auto-deploy to production

### Code Style

- **TypeScript Strict Mode:** No `any` types allowed
- **ESLint:** Enforced on CI
- **Prettier:** Auto-format on commit
- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `chore:`

## 📝 License

Proprietary - © 2024 Synpathub

## 📧 Support

For issues or questions:
- Create a GitHub Issue
- Contact: [support email]

---

Built with ❤️ using TypeScript, React, Fastify, PostgreSQL, and Drizzle ORM
