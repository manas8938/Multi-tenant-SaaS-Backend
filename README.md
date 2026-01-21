# 🚀 Multi-Tenant SaaS Backend

A production-ready, scalable multi-tenant SaaS backend built with NestJS, Prisma, PostgreSQL, and Redis.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## ✨ Features

- **Multi-Tenancy** - Complete tenant isolation with role-based access
- **Authentication** - JWT with refresh tokens
- **Subscriptions** - Free/Pro/Enterprise tiers
- **Email Service** - Async email with BullMQ
- **Audit Logging** - Track all actions
- **API Keys** - Secure API access
- **Dashboard** - Analytics endpoints
- **Swagger Docs** - Auto-generated API documentation

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | NestJS 10.x |
| Language | TypeScript 5.x |
| Database | PostgreSQL 15 |
| ORM | Prisma 5.x |
| Cache/Queue | Redis 7 + BullMQ |
| Auth | JWT + Passport |
| Docs | Swagger/OpenAPI |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

git clone https://github.com/manas8938/Multi-tenant-SaaS-Backend.git
cd Multi-tenant-SaaS-Backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev

### API Documentation
http://localhost:3000/docs

## 📋 API Endpoints

### Auth
- POST /api/v1/auth/register - Register user
- POST /api/v1/auth/login - Login user
- POST /api/v1/auth/refresh - Refresh token
- GET /api/v1/auth/me - Get current user

### Users
- GET /api/v1/users - List users
- POST /api/v1/users - Create user
- GET /api/v1/users/:id - Get user
- PATCH /api/v1/users/:id - Update user
- DELETE /api/v1/users/:id - Delete user

### Tenants
- GET /api/v1/tenants - List tenants
- POST /api/v1/tenants - Create tenant
- GET /api/v1/tenants/:id - Get tenant
- PATCH /api/v1/tenants/:id - Update tenant
- DELETE /api/v1/tenants/:id - Delete tenant

### Subscriptions
- GET /api/v1/subscriptions/tenant/:tenantId - Get subscription
- GET /api/v1/subscriptions/plans - List plans
- PATCH /api/v1/subscriptions/:id - Update subscription

### Invitations
- POST /api/v1/invitations - Send invitation
- GET /api/v1/invitations/tenant/:tenantId - List invitations
- POST /api/v1/invitations/accept - Accept invitation

### API Keys
- POST /api/v1/api-keys - Create API key
- GET /api/v1/api-keys/tenant/:tenantId - List API keys
- DELETE /api/v1/api-keys/:id - Revoke API key

### Dashboard
- GET /api/v1/dashboard/user - User stats
- GET /api/v1/dashboard/tenant/:tenantId - Tenant stats
- GET /api/v1/dashboard/admin - Admin stats

### Health
- GET /api/v1/health - Health check

## 📁 Project Structure

src/
├── common/           # Shared utilities
├── config/           # Configuration
├── database/         # Prisma module
├── modules/          # Feature modules
│   ├── auth/
│   ├── users/
│   ├── tenants/
│   ├── subscription/
│   ├── invitations/
│   ├── api-keys/
│   ├── notifications/
│   ├── audit-logs/
│   ├── billing/
│   ├── dashboard/
│   ├── health/
│   ├── cache/
│   └── email/
├── queues/           # BullMQ processors
└── main.ts

## 🐳 Docker

docker-compose up -d postgres redis
npm run start:dev

## 📄 License

MIT License - see LICENSE file.

## 👨‍💻 Author

**Muhammad Anas Nawaz**
- GitHub: [@manas8938](https://github.com/manas8938)
- Email: anakxofficial@gmail.com
