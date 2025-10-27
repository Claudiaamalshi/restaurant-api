# Restaurant API - Production-Ready REST API

Production-grade REST API for a restaurant ordering system built with Node.js, Express, TypeScript, Sequelize, and MySQL.

## Table of Contents

- **[Features](#features)**
- **[Tech Stack](#tech-stack)**
- **[Architecture](#architecture)**
- **[Getting Started](#getting-started)**
- **[Database Schema](#database-schema)**
- **[API Documentation](#api-documentation)**
- **[Testing](#testing)**
- **[Security](#security)**
- **[Performance](#performance)**
- **[Future Enhancements](#future-enhancements)**
- **[License](#license)**
- **[Author](#author)**

## Features

### Authentication & Authorization

- Secure JWT auth with access and refresh tokens
- Token rotation on refresh
- Password hashing using bcrypt (12 rounds)
- Email uniqueness and normalization
- Rate limiting on auth endpoints (5 req/15min)
- Brute-force protection (account lockout)
- Role-based access control (RBAC)

### Restaurant Management

- Full CRUD for restaurants
- Restaurant ownership model
- Seed data generation with faker.js

### Menu Management

- Categories and dishes management
- Dish ratings system
- Pagination support
- Consolidated endpoint with filters
- Include/exclude unavailable items
- Multi-field sorting

### Order Management

- Place, update, and view orders
- Transactional integrity (atomic operations)
- 10,000+ orders for performance testing
- Proper database indexing and audit fields
- Order status workflow

### Reporting

- Sales by day/week/month
- Top-selling items (quantity and revenue)
- Average order value by period
- Advanced filtering and pagination
- Date range queries
- Restaurant-specific reports

### Data Quality

- Zod validation on all inputs
- Clear error messages
- Input coercion and safe defaults
- Comprehensive error handling

## Tech Stack

| Technology      | Purpose                          |
| --------------- | -------------------------------- |
| Node.js         | Runtime environment               |
| TypeScript      | Type-safe development             |
| Express.js      | Web framework                     |
| Sequelize       | ORM for MySQL                     |
| MySQL           | Primary database                  |
| JWT             | Authentication tokens             |
| Zod             | Runtime validation                |
| Jest/Supertest  | Testing framework                 |
| bcrypt          | Password hashing                  |
| ESLint/Prettier | Code quality                      |

## Architecture

```text
src/
├── config/          # Configuration files (env, database)
├── models/          # Sequelize models
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Auth, validation, rate limit
├── routes/          # API route definitions
├── validators/      # Zod schemas
├── utils/           # Helpers (JWT, errors)
├── types/           # Type definitions
├── seeders/         # Database seeders
├── tests/           # Test suites
├── app.ts           # Express app configuration
└── index.ts         # Server entry point
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0  / Docker desktop

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd restaurant-api
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_api
DB_USER=root
DB_PASSWORD=your_password

# JWT Secrets (generate strong secrets!)
JWT_ACCESS_SECRET=your_32_char_min_access_secret_here
JWT_REFRESH_SECRET=your_32_char_min_refresh_secret_here
```

4. Create MySQL database

To set up and start the configured MySQL Docker image using Docker Compose, follow these steps:

Create a `.env` file in the root directory (check `.env.example`) and add the following environment variables:

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

Start the MySQL Docker container:

```bash
docker compose up
```

5. Run migrations and seed

```bash
npm run db:migrate
# optional
npm run db:seed
```

### Running the Application

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

### Project Scripts

Testing:

```bash
npm test
npm run test:coverage
```

Linting and formatting:

```bash
npm run lint
npm run lint:fix
npm run format
```

Database commands:

```bash
# Run all migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Seed database
npm run db:seed

# Reset database (undo migrations + migrate + seed)
npm run db:reset
```

## Database Schema

See the ERD diagram in the artifacts above for complete schema details.

### Key Tables

- `users`: Authentication and user management
- `restaurants`: Restaurant information and ownership
- `menus`: Menu container (1:1 with restaurant)
- `categories`: Menu categories with availability
- `dishes`: Menu items with ratings
- `orders`: Order records with status tracking
- `order_items`: Order line items with price snapshots

### Indexes

Performance-critical indexes:

- `orders(restaurant_id, status, created_at)` — reporting queries
- `orders(user_id, created_at)` — user order history
- `dishes(category_id, is_available)` — menu queries
- `order_items(order_id)` — order details

## API Documentation

Base URL:

```
http://localhost:3000/api/v1
```

Health Check:

```http
GET /health
```

### Authentication Endpoints

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Restaurant Endpoints

```http
GET    /api/v1/restaurants
GET    /api/v1/restaurants/:id
POST   /api/v1/restaurants
PUT    /api/v1/restaurants/:id
DELETE /api/v1/restaurants/:id
```

### Menu Endpoints

```http
GET    /api/v1/menus/:restaurantId/categories
GET    /api/v1/menus/:restaurantId/dishes
GET    /api/v1/menus/:restaurantId/consolidated
POST   /api/v1/menus/categories
PUT    /api/v1/menus/categories/:id
DELETE /api/v1/menus/categories/:id
POST   /api/v1/menus/dishes
PUT    /api/v1/menus/dishes/:id
DELETE /api/v1/menus/dishes/:id
```

### Order Endpoints

```http
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders
PUT    /api/v1/orders/:id/status
```

### Reporting Endpoints

```http
GET /api/v1/reports/sales?from=2025-01-01&to=2025-01-31&groupBy=day
GET /api/v1/reports/top-items?limit=10&sortBy=revenue
GET /api/v1/reports/average-order-value?from=2025-01-01
```

Full Swagger documentation available at:

```
http://localhost:3000/api-docs
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Coverage Targets

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Test Structure

```text
src/tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── validators/
└── integration/
    ├── auth.test.ts
    ├── restaurants.test.ts
    ├── menus.test.ts
    ├── orders.test.ts
    └── reports.test.ts
```

## AI Tools Used

This project was developed with assistance from:

- Windsurf/Cursor — Code generation and scaffolding
- Claude (Anthropic) — Architecture decisions, query optimization, documentation
- GitHub Copilot — Code completion and test generation

All AI-generated code has been reviewed, tested, and understood before integration.

## Architecture Decisions

See `ARCHITECTURE.md` for details on:

- User roles and permissions
- Order status workflow
- Data model relationships
- Security measures
- Performance optimizations

## Security

- JWT with short-lived access tokens (15min)
- Refresh token rotation
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min general, 5 req/15min auth)
- Brute-force protection (5-attempt lockout)
- Helmet.js security headers
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention

## Performance

- Database connection pooling
- Composite indexes on frequently queried columns
- Pagination on all list endpoints
- Eager loading to prevent N+1 queries
- Proper use of database transactions
- 10,000+ order records for stress testing

## Future Enhancements

- Redis caching layer
- WebSocket for real-time updates
- Docker containerization
- Idempotency keys for orders
- E2E testing with Cypress
- GraphQL API option
- Payment gateway integration

## License

MIT

## Author

Claudia Warnakulaarachchi

Note: This is an assessment project demonstrating production-ready API development practices.
