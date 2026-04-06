# Finance Dashboard API

A backend REST API for a finance dashboard system with role-based access control (RBAC), built with Node.js, Express, TypeScript, Prisma, and SQLite.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Role Permission Matrix](#role-permission-matrix)
- [API Endpoints](#api-endpoints)
- [Test Credentials](#test-credentials)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js + Express | HTTP server and routing |
| TypeScript | Type safety and code quality |
| Prisma ORM | Database access and schema management |
| SQLite | Lightweight file-based database |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Zod | Request validation |
| Swagger UI | API documentation |
| express-rate-limit | Rate limiting |
| Helmet | Security headers |
| Morgan | HTTP request logging |

---

## Project Structure
finance-dashboard-api/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── env.ts             # Environment config loader
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── swagger.ts         # Swagger/OpenAPI documentation
│   ├── middlewares/
│   │   ├── authenticate.ts    # JWT auth middleware
│   │   ├── rbac.ts            # Role-based access control
│   │   ├── validate.ts        # Zod request validation
│   │   ├── rateLimiter.ts     # Rate limiting
│   │   └── errorHandler.ts    # Global error handler
│   ├── modules/
│   │   ├── auth/              # Register, Login, Profile
│   │   ├── users/             # User management (Admin only)
│   │   ├── records/           # Financial records CRUD
│   │   └── dashboard/         # Analytics and summaries
│   ├── prisma/
│   │   └── seed.ts            # Database seeder
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types
│   ├── utils/
│   │   ├── errors.ts          # Custom error classes
│   │   └── response.ts        # API response helpers
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── package.json
└── tsconfig.json

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Himanshityagii24/Finance-system-Zorvyn.git
cd Finance-system-Zorvyn
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```

**4. Set up the database**
```bash
npx prisma db push
npx prisma generate
```

**5. Seed the database**
```bash
npm run db:seed
```

**6. Start the development server**
```bash
npm run dev
```

Server runs at `http://localhost:3000`

**7. Open API documentation**
http://localhost:3000/api/docs

---

## Environment Variables

Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | SQLite database file path | file:./prisma/dev.db |
| JWT_SECRET | Secret key for JWT signing | — |
| JWT_EXPIRES_IN | Token expiry duration | 7d |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |

---

## Database Setup

This project uses **SQLite** for simplicity and zero-config setup. The database file is created automatically when you run `prisma db push`.

### Available database commands
```bash
# Push schema changes to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed database with test data
npm run db:seed

# Open Prisma Studio (visual database browser)
npm run db:studio
```

---

## API Documentation

Full interactive API documentation is available via Swagger UI:
http://localhost:3000/api/docs

### How to use Swagger UI

1. Open `http://localhost:3000/api/docs` in your browser
2. Click **Authorize** button (top right)
3. Login via `POST /api/auth/login` to get your token
4. Paste the token in the Authorize dialog
5. Click any endpoint → **Try it out** → **Execute**

---

## Role Permission Matrix

| Action | VIEWER | ANALYST | ADMIN |
|--------|--------|---------|-------|
| Register / Login | ✅ | ✅ | ✅ |
| View own records | ✅ | ✅ | ✅ |
| View all records | ❌ | ❌ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update own records | ❌ | ✅ | ✅ |
| Update any record | ❌ | ❌ | ✅ |
| Delete records | ❌ | ✅ | ✅ |
| Access dashboard | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| Activate/deactivate users | ❌ | ❌ | ✅ |

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login and get token | No |
| GET | /api/auth/me | Get my profile | Yes |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users (paginated, filterable, searchable) |
| GET | /api/users/:id | Get user by ID |
| PATCH | /api/users/:id | Update user details |
| PATCH | /api/users/:id/role | Change user role |
| PATCH | /api/users/:id/toggle-status | Activate or deactivate user |
| DELETE | /api/users/:id | Delete user |

### Records
| Method | Endpoint | Description | Who |
|--------|----------|-------------|-----|
| GET | /api/records | Get records (filtered, paginated, searchable) | All |
| POST | /api/records | Create record | Analyst, Admin |
| GET | /api/records/:id | Get single record | All |
| PUT | /api/records/:id | Update record | Analyst (own), Admin |
| DELETE | /api/records/:id | Soft delete record | Analyst (own), Admin |

#### Record query parameters
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Records per page (default: 10, max: 100) |
| type | string | INCOME or EXPENSE |
| category | string | Filter by category |
| search | string | Search in category or notes |
| from | ISO date | Start date filter |
| to | ISO date | End date filter |
| sortBy | string | date, amount, or createdAt |
| sortOrder | string | asc or desc |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/summary | Total income, expenses, net balance, savings rate |
| GET | /api/dashboard/categories | Income and expense breakdown by category |
| GET | /api/dashboard/trends/monthly | Monthly trends for a given year |
| GET | /api/dashboard/trends/weekly | Weekly trends for last 8 weeks |
| GET | /api/dashboard/recent | Most recent transactions |
| GET | /api/dashboard/balance-over-time | Running balance timeline |
| GET | /api/dashboard/top-categories | Top spending or earning categories |

---

## Test Credentials

After running `npm run db:seed`:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| ADMIN | admin@finance.com | admin123 | Full access |
| ANALYST | analyst@finance.com | analyst123 | Own records + dashboard |
| VIEWER | viewer@finance.com | viewer123 | View only + dashboard |
| INACTIVE | inactive@finance.com | inactive123 | Login blocked |

---

## Design Decisions

### SQLite over PostgreSQL
SQLite was chosen for zero-config local setup. The schema is fully compatible with PostgreSQL — switching requires only changing the `provider` in `schema.prisma` and updating `DATABASE_URL`.

### String fields instead of enums for SQLite
SQLite does not natively support enums. Role and TransactionType are stored as strings with validation enforced at the application layer via Zod schemas.

### Soft delete
Records are never permanently deleted. The `isDeleted` flag is set to `true` on delete. This preserves data integrity and audit history.

### Role-based data scoping
- ADMIN sees all records across all users
- ANALYST and VIEWER only see their own records
- This is enforced at the service layer, not just the route layer

### Consistent API responses
Every response follows the same shape:
```json
{
  "success": true | false,
  "message": "...",
  "data": {},
  "meta": {}
}
```

### Centralized error handling
All errors are thrown as typed AppError subclasses and caught by a single global error handler middleware. Routes stay clean with no try/catch duplication.

### JWT stored client-side
Tokens are stateless and stored by the client. No session store needed. Token expiry is configurable via `JWT_EXPIRES_IN`.

---

## Assumptions

1. **Role assignment on register** — Users can self-assign a role on registration. In production this would be admin-only.
2. **SQLite for development** — Production deployment would use PostgreSQL with minimal changes.
3. **Soft delete only** — Deleted records remain in the database and can be restored by updating `isDeleted` to `false` directly.
4. **No email verification** — Registration is immediate without email confirmation.
5. **Single token auth** — No refresh token implementation. Users re-login after token expiry.
6. **Admin cannot delete/deactivate themselves** — Prevents accidental lockout.