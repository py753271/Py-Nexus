# Py Nexus — Enterprise React Frontend Portal

This directory contains the React 19 + Vite frontend application for Py Nexus, an Enterprise Internship & Learning Management Platform. It features a multi-tabbed Administrator Command Tower and a student telemetry dashboard.

## Tech Stack & Design System

- **Vite + React 19**: Powered by React's latest engine and Vite's super-fast HMR server.
- **Custom CSS Variables Design System**: Implemented with CSS variable theme tokens (dark/light toggles) and tailored animation states. No heavy CSS library bloated dependencies.
- **Lucide Icons**: Fluid iconography maps for crisp menu links and statistics widgets.
- **Recharts Analytics**: Dynamic blueprints showing learning progress and stats flows.

---

## Local Setup & Run Steps

### 1. Configure Environment variables
Ensure you have the environment configuration file containing the API endpoint pointer:
```bash
# In this directory (frontend)
cp .env.example .env
```
Ensure your `.env` contains:
```env
VITE_API_URL="http://localhost:5000/api"
```

### 2. Install Packages
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The client portal will be running locally on **`http://localhost:5173`**.

---

## Key Portal Interfaces

### Student Dashboard
- **Telemetry Check-In**: Geolocation widget tracking coordinates and check-in times.
- **Course Flow chart**: Recharts data curves mapping learning module metrics.
- **My Tasks**: List of issued assignments, grading logs, and submission forms.
- **AI Neural Assistant**: Dedicated floating and full-page copilot helper.

### Admin Command Center
- **Asset Registry**: CRUD panels for Organizations and Sector/Departments.
- **Dynamic RBAC Editor**: Assign and revoke custom security permissions.
- **Intern & Mentor Mappings**: Update user records, assign departments, and hook up mentors.
- **Telemetry Auditing**: Access list of check-in coordinates from student logs.
