# Py Nexus — Enterprise Internship & Learning Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-8.0.1-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.6.0-2D3748.svg?style=flat&logo=prisma)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000.svg?style=flat&logo=express)](https://expressjs.com/)

Py Nexus is a production-ready, enterprise-grade open-source Internship and Learning Management Platform. It streamlines institutional onboarding, department allocations, mentor-intern pairings, curriculum modules tracking, and daily check-in telemetry. 

Built with React 19, Express, and PostgreSQL, the platform implements strict time-based two-factor authentication (2FA), dynamic role-based access control (RBAC), public cryptographic certificate verification, and a native Google Gemini AI Neural Engine for automated grading and telemetry analysis.

---

## 📊 Highlights

* **Enterprise-grade Internship & Learning Management Platform** — Unified workflows for onboarding, curriculum modules tracking, and mentoring.
* **Role-Based Access Control (RBAC)** — Granular permission checks verified dynamically on every endpoint query.
* **Two-Factor Authentication (2FA)** — Enhanced verification using Time-based One-Time Passwords (TOTP) and custom QR visualizers.
* **Attendance Tracking with Geolocation** — Real-time coordinates logging utilizing native browser geolocation APIs.
* **AI-Powered Report Evaluation** — Automated report grading and customized learning suggestions driven by the Google Gemini API.
* **Certificate Verification System** — Publicly verifiable course certificates authenticated by unique SHA256 hashes.
* **React + Express + PostgreSQL + Prisma** — Full stack built with React 19, Express, PostgreSQL database, and Prisma ORM.
* **Modular and Scalable Architecture** — Clean separation of concerns with controllers, services, and middlewares.

---

## 📖 Project Overview

Enterprise internship programs struggle with fragmented tools for attendance, course progress, grading, and mentorship. Py Nexus solves this by offering a unified, high-security dashboard for students, mentors, and administrators. 

### Core Pillars
1. **Dynamic RBAC & 2FA Security**: Multi-layered authentication to secure student profiles and restrict administrative console access.
2. **Attendance Telemetry**: Captured via the browser's HTML5 Geolocation API, checking coordinates and calculating late arrivals.
3. **Curriculum & Verification Ledger**: Course modules paired with auto-generated SHA256 completion certificate hashes.
4. **Gemini Neural Engine**: Leverages AI to auto-grade intern reports and compile performance suggestions.

---

## 🚀 Key Features

### 🔐 Security & Access Control
* **Two-Factor Authentication (2FA)**: Time-based One-Time Passwords (TOTP) supported by QR-code visualizers.
* **Database-Backed Dynamic RBAC**: Middleware verifies permissions directly from the database on every route query.
* **Safe Profile Updates**: Admins securely update intern allocations via strict single-action handlers, preventing profile hijacking.

### 📍 Attendance & Progress Tracking
* **Geolocation Logging**: Captures coordinates and check-in times to verify student presence.
* **Late Threshold Flagging**: Automatically flags check-ins after 9:30 AM as `Late`.
* **Visual Analytics**: Area and pie charts show curriculum progress and stats flows.

### 📝 Curriculums, Tasks & Review Workflows
* **Mentor Task Portal**: Mentors can issue tasks, specify deadlines, and grade submissions.
* **Cryptographic Certificates**: Completion certificates generated with cryptographically unique hashes verify completion on a public search route.
* **AI Report Evaluation**: Report uploads are auto-reviewed by Gemini AI to submit grades and constructive critiques.

---

## 🎨 Tech Stack

| Layer | Technologies | Key Libraries |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite | Lucide Icons, Recharts (Charts Engine), Vanilla CSS Variables |
| **Backend API** | Node.js, Express.js | Cookie-Parser, Helmet (Headers), Express Rate Limit (DDoS Protection) |
| **Database ORM** | PostgreSQL, Prisma client | Parameterized queries, Schema relations, Composite unique keys |
| **Security & Auth** | JSON Web Tokens (JWT) | BcryptJS (Hashing), Speakeasy (TOTP), QRCode (2FA QR Generator) |
| **AI Integration** | Gemini AI HTTPS Client | Gemini 1.5 Flash API calls with rule-based fallback handlers |

---

## 📐 Architecture Diagram

```mermaid
graph TD
    subgraph Frontend Portal (Vite + React 19)
        UI[User Interface Components] --> AuthContext[User Auth Context]
        UI --> Recharts[Analytics Charts]
        UI --> Geo[HTML5 Geolocation API]
    end

    subgraph Backend Server (Express.js)
        API[Express Routing Engine] --> RateLimiter[Rate Limiters & Helmet]
        RateLimiter --> Auth[verifyToken Middleware]
        Auth --> RBAC[requirePermission Middleware]
        RBAC --> Controllers[Route Controllers]
        Controllers --> Services[Business Services]
    end

    subgraph Database & AI Engine
        Services --> Prisma[Prisma ORM Client]
        Prisma --> DB[(PostgreSQL Database)]
        Services --> Gemini[Google Gemini HTTPS Gateway]
    end
```

---

## 🗄️ Database Design

The database schema is fully normalized and configured with index nodes to ensure fast queries.

```mermaid
erDiagram
    users ||--o{ enrollments : "has"
    users ||--o{ reports : "submits"
    users ||--o{ task_submissions : "submits"
    users ||--o{ attendance : "logs"
    users }|--|| roles : "possesses"
    users }|--|| departments : "allocated_to"
    departments }|--|| organizations : "belongs_to"
    roles }|--|{ permissions : "assigns"
    courses ||--o{ enrollments : "tracks"
    courses ||--o{ lessons : "has"
    tasks ||--o{ task_submissions : "has"
    courses ||--o{ certificates : "issues"
```

### Key Schema Configurations
* **Unique Mappings**:
  * `uq_enrollments_user_course`: Restricts duplicate enrollment in the same course.
  * `uq_attendance_user_date`: Limits attendance logging to one check-in per student per day.
  * `uq_certificates_user_course`: Restricts certificate generation to one per course completion.
* **Performance Indexes**: High-performance indexes are placed on foreign keys (`category_id`, `assigned_to_id`, `task_id`) and search hashes (`certificate_hash`) to optimize search query latency.

---

## ⚙️ Environment Setup

Create `.env` files in the respective project directories:

### Backend Configuration (`backend/.env`)
```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/py_nexus?schema=public"

# Expiry & validation secrets
JWT_SECRET="YOUR_SECURE_JWT_SECRET_KEY"

# Server ports
PORT=5000
NODE_ENV="development"

# Google Gemini API key
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```

### Frontend Configuration (`frontend/.env`)
```env
# Target endpoint pointing to the backend API Server
VITE_API_URL="http://localhost:5000/api"
```

---

## 📂 Project Structure

```text
Py-Nexus
├── backend/                  # Express.js backend API server
├── frontend/                 # React 19 + Vite frontend application
├── prisma/                   # Database schemas, migrations, and seeds
├── docs/                     # Project screenshots and assets
│   └── screenshots/          # Platform preview screenshots
├── README.md                 # Main setup and documentation guide
├── LICENSE                   # MIT License
└── .env.example              # Master environment configurations
```

---

## 💻 Installation & Setup Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally

### 1. Database & Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables file (`.env`) matching `.env.example`.
4. Apply the Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database with core permissions, roles, and dummy courses:
   ```bash
   npx prisma db seed
   ```
6. Start the backend engine:
   ```bash
   npm run dev
   ```

### 2. Client Portal Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables file (`.env`) matching `.env.example`.
4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to **`http://localhost:5173`**.

---

## 👥 Demo Login Credentials

For evaluation and testing, the database seeding script registers these accounts:

| Role | Username / Email | Password | System Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@py_nexus.dev` | `superadmin123` | Full root access, user deletion, permission configs |
| **Admin** | `admin@py_nexus.dev` | `admin123` | Department changes, user registry mappings |
| **Mentor** | `mentor@py_nexus.dev` | `mentor123` | Issue tasks, review submissions, audit check-ins |
| **Intern** | `intern@py_nexus.dev` | `intern123` | Log geolocation check-in, upload task submissions, view AI advice |

---

## 📸 Screenshots Section

Here is a preview of the platform in action:

| Student Dashboard Dashboard | Mentor Assignments Console |
| :---: | :---: |
| ![Student Dashboard](docs/screenshots/student_dashboard.png) | ![Mentor Assignments](docs/screenshots/mentor_console.png) |

---

## 🔗 API Overview

* **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/login/verify-2fa`
* **RBAC**: `GET /api/roles/permissions`, `POST /api/roles/assign`, `PATCH /api/users/:id`
* **Attendance**: `POST /api/attendance/checkin`, `POST /api/attendance/checkout`, `GET /api/attendance/my-stats`
* **Tasks**: `POST /api/tasks`, `GET /api/tasks`, `POST /api/tasks/submit`, `POST /api/tasks/review/:submissionId`
* **Gemini AI**: `POST /api/ai/query`, `GET /api/ai/insights`, `GET /api/ai/recommendations`

---

## 🔮 Future Scope

1. **Lazy Loading React Pages**: Transition components using `React.lazy()` to optimize chunk sizes.
2. **Strict TypeScript Migration**: Transition the project to TypeScript to enforce typed payloads and prevent unexpected runtime exceptions.
3. **Plagiarism Scanners**: Check task submissions for copy-paste patterns.

---

## 👥 Contributors

**Pradeep Yadav**  
*Full Stack Developer*

### Responsibilities:
* System Architecture
* React Frontend Development
* Express Backend Development
* PostgreSQL Database Design
* Prisma ORM Integration
* Authentication & Security
* AI Integration

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
