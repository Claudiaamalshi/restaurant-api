Restaurant API - Production-Ready REST API
A feature-rich, production-quality REST API for restaurant ordering system built with Node.js, Express, TypeScript, Sequelize, and MySQL.

📋 Table of Contents
Features
Tech Stack
Architecture
Getting Started
Database Schema
API Documentation
Testing
AI Tools Used
✨ Features
Authentication & Authorization
✅ Secure JWT authentication with access & refresh tokens
✅ Token rotation on refresh
✅ Password hashing using bcrypt (12 rounds)
✅ Email uniqueness and normalization
✅ Rate limiting on auth endpoints (5 req/15min)
✅ Brute-force protection (account lockout)
✅ Role-based access control (RBAC)
Restaurant Management
✅ Complete CRUD operations
✅ Restaurant ownership system
✅ Seed data generation using faker.js
Menu Management
✅ Categories and dishes management
✅ Dish ratings system
✅ Pagination support
✅ Consolidated endpoint with filters
✅ Include/exclude unavailable items
✅ Multi-field sorting
Order Management
✅ Place, update, and view orders
✅ Transactional integrity (atomic operations)
✅ 10,000+ orders for performance testing
✅ Proper database indexing
✅ Audit fields on key tables
✅ Order status workflow
Reporting
✅ Sales by day/week/month
✅ Top-selling items (quantity & revenue)
✅ Average order value by period
✅ Advanced filtering & pagination
✅ Date range queries
✅ Restaurant-specific reports
Data Quality
✅ Zod validation on all inputs
✅ Clear error messages
✅ Input coercion and safe defaults
✅ Comprehensive error handling
🛠 Tech Stack
Technology	Purpose
Node.js	Runtime environment
TypeScript	Type-safe development
Express.js	Web framework
Sequelize	ORM for MySQL
MySQL	Primary database
JWT	Authentication tokens
Zod	Runtime validation
Jest/Supertest	Testing framework
bcrypt	Password hashing
ESLint/Prettier	Code quality
🏗 Architecture
src/
├── config/          # Configuration files (env, database)
├── models/          # Sequelize models
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Express middleware (auth, validation, rate limit)
├── routes/          # API route definitions
├── validators/      # Zod schemas
├── utils/           # Utility functions (JWT, errors)
├── types/           # TypeScript type definitions
├── seeders/         # Database seeders
├── tests/           # Test suites
├── app.ts           # Express app configuration
└── index.ts         # Server entry point
🚀 Getting Started
Prerequisites
Node.js >= 18.0.0
npm >= 9.0.0
MySQL >= 8.0
Installation
Clone the repository
bash
git clone <your-repo-url>
cd restaurant-api
Install dependencies
bash
npm install
Set up environment variables
bash
cp .env.example .env
Edit .env with your configuration:

env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_api
DB_USER=root
DB_PASSWORD=your_password

# JWT Secrets (generate strong secrets!)
JWT_ACCESS_SECRET=your_32_char_min_access_secret_here
JWT_REFRESH_SECRET=your_32_char_min_refresh_secret_here
Create MySQL database
bash
mysql -u root -p
CREATE DATABASE restaurant_api;
exit;
Run migrations
bash
npm run db:migrate
Seed database (optional)
bash
npm run db:seed
Running the Application
Development mode:

bash
npm run dev
Production mode:

bash
npm run build
npm start
Run tests:

bash
npm test
Run tests with coverage:

bash
npm run test:coverage
Lint code:

bash
npm run lint
npm run lint:fix
Format code:

bash
npm run format
Database Commands
bash
# Run all migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Seed database
npm run db:seed

# Reset database (undo migrations + migrate + seed)
npm run db:reset
📊 Database Schema
See the ERD diagram in the artifacts above for complete schema details.

Key Tables
users: Authentication and user management
restaurants: Restaurant information and ownership
menus: Menu container (1:1 with restaurant)
categories: Menu categories with availability
dishes: Menu items with ratings
orders: Order records with status tracking
order_items: Order line items with price snapshots
Indexes
Performance-critical indexes:

orders(restaurant_id, status, created_at) - Reporting queries
orders(user_id, created_at) - User order history
dishes(category_id, is_available) - Menu queries
order_items(order_id) - Order details
📚 API Documentation
Base URL
http://localhost:3000/api/v1
Health Check
GET /health
Authentication Endpoints
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
Restaurant Endpoints
GET    /api/v1/restaurants
GET    /api/v1/restaurants/:id
POST   /api/v1/restaurants
PUT    /api/v1/restaurants/:id
DELETE /api/v1/restaurants/:id
Menu Endpoints
GET    /api/v1/menus/:restaurantId/categories
GET    /api/v1/menus/:restaurantId/dishes
GET    /api/v1/menus/:restaurantId/consolidated
POST   /api/v1/menus/categories
PUT    /api/v1/menus/categories/:id
DELETE /api/v1/menus/categories/:id
POST   /api/v1/menus/dishes
PUT    /api/v1/menus/dishes/:id
DELETE /api/v1/menus/dishes/:id
Order Endpoints
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders
PUT    /api/v1/orders/:id/status
Reporting Endpoints
GET /api/v1/reports/sales?from=2025-01-01&to=2025-01-31&groupBy=day
GET /api/v1/reports/top-items?limit=10&sortBy=revenue
GET /api/v1/reports/average-order-value?from=2025-01-01
Full Swagger documentation available at:

http://localhost:3000/api-docs
🧪 Testing
Running Tests
bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
Test Coverage
Target coverage: 70%+ across all metrics

Branches: 70%
Functions: 70%
Lines: 70%
Statements: 70%
Test Structure
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
🤖 AI Tools Used
This project was developed with assistance from:

Windsurf/Cursor - Code generation and boilerplate scaffolding
Claude (Anthropic) - Architecture decisions, query optimization, documentation
GitHub Copilot - Code completion and test generation
All AI-generated code has been reviewed, tested, and understood before integration.

📝 Architecture Decisions
See ARCHITECTURE.md for detailed documentation on:

User roles and permissions
Order status workflow
Data model relationships
Security measures
Performance optimizations
🔒 Security Features
JWT with short-lived access tokens (15min)
Refresh token rotation
bcrypt password hashing (12 rounds)
Rate limiting (100 req/15min general, 5 req/15min auth)
Brute-force protection (5 attempts lockout)
Helmet.js security headers
Input validation on all endpoints
SQL injection prevention (parameterized queries)
XSS prevention
🚀 Performance Optimizations
Database connection pooling
Composite indexes on frequently queried columns
Pagination on all list endpoints
Eager loading to prevent N+1 queries
Proper use of database transactions
10,000+ order records for stress testing
📈 Future Enhancements
 Redis caching layer
 WebSocket for real-time updates
 Docker containerization
 Idempotency keys for orders
 E2E testing with Cypress
 GraphQL API option
 Payment gateway integration
📄 License
MIT

👤 Author
Claudia Warnakulaarachchi

Note: This is an assessment project demonstrating production-ready API development practices.

