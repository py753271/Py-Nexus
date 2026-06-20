# Py Nexus — Enterprise Backend Service

This directory contains the Express.js server and database schema configs for Py Nexus, an Enterprise Internship & Learning Management Platform. It is fully integrated with PostgreSQL and Prisma ORM, utilizing JWT with Multi-Factor (2FA) Security and Dynamic Permission-Based RBAC.

## Tech Stack & Core Features

- **Express.js API Engine**: Handled with modular routers and middleware error barriers.
- **PostgreSQL + Prisma ORM**: Structured tables with unique indexes on composite lookups (e.g. unique daily check-ins, unique certificates, and unique course enrollments).
- **Two-Factor Authentication (2FA)**: Time-based OTP (TOTP) generators using `speakeasy` and QR-code visualizers.
- **Dynamic RBAC Middleware**: Permission mapping with db-cache lookup queries per request.
- **Gemini AI Integration**: Custom auto-grading pipeline and telemetry insights.

## Prerequisites

- **Node.js** (v18+)
- **npm** (v9+)
- **PostgreSQL** instance running locally or on the cloud

---

## Local Setup & Run Steps

### 1. Configure Environments
Copy the environment variables template and configure your parameters:
```bash
# In this directory (backend)
cp .env.example .env
```
Ensure your `.env` contains the database connection string, JWT key, and Gemini API key:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/py_nexus?schema=public"
JWT_SECRET="YOUR_SECURE_JWT_SECRET"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=5000
NODE_ENV="development"
```

### 2. Install Packages
```bash
npm install
```

### 3. Apply Migrations & Seed Registries
Run Prisma migrations to construct database tables and run the custom seed script to populate organizations, departments, roles, permissions, course milestones, and mock users:
```bash
# Apply migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### 4. Fire up Backend Server
```bash
npm run dev
```
The server will boot up and bind to **`http://localhost:5000`**.

---

## API Registry Overview

### Authentication & 2FA
- `POST /api/auth/register` - Create user profile.
- `POST /api/auth/login` - Single-Factor login.
- `POST /api/auth/login/verify-2fa` - Multi-Factor TOTP login.
- `POST /api/auth/2fa/generate` - Setup TOTP secret.
- `POST /api/auth/2fa/verify-setup` - Enable 2FA.
- `POST /api/auth/2fa/disable` - Disable 2FA.

### Organization & RBAC
- `GET /api/organization` - Fetch details.
- `PATCH /api/users/:id` - Assign roles/departments/mentors (Admin only).
- `POST /api/roles/assign` - Map custom role.
- `GET /api/roles/permissions` - List permissions.

### Daily Attendance Telemetry
- `POST /api/attendance/checkin` - Log check-in with geolocation metadata.
- `POST /api/attendance/checkout` - Log checkout.
- `GET /api/attendance/my-stats` - Fetch personal logs and percentages.
- `GET /api/attendance/logs` - Fetch all logs (Admin only).

### Intern Tasks & Submissions
- `POST /api/tasks` - Assign task (Mentor only).
- `GET /api/tasks` - List assigned tasks.
- `POST /api/tasks/submit` - Upload submission link.
- `POST /api/tasks/review/:submissionId` - Grade task submission (Mentor only).

### Gemini AI Copilot
- `POST /api/ai/query` - Chat Assistant.
- `GET /api/ai/insights` - Telemetry performance reviews.
- `GET /api/ai/recommendations` - Adaptive learning topics advice.
