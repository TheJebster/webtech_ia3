# Event Equipment Rental System

A full-stack MERN application for renting event equipment, with role-based access for **Admin** and **Normal Users**.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite + React Bootstrap + React Router |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Charts | Recharts |
| Deploy | Vercel (frontend + serverless backend) |

## Features

### Authentication
- Sign-up with validation (email format, password strength, required fields)
- Login with secure JWT authentication
- Logout functionality
- Change password for all users
- Editable profile (name and email)

### Admin Capabilities
- Live dashboard with stat cards and charts (revenue by category, rentals by status, bookings over time)
- Equipment CRUD with images, search and category filtering
- User management (add, view, update role, remove)
- Rental management (view all, approve, return, cancel)

### Normal User Capabilities
- Browse the equipment catalog with images
- Search and filter by name and category
- View equipment details with live price estimation
- Request equipment rental (event name, dates, quantity)
- View personal rental history
- Change password and update profile

### Engineering Highlights
- **Live data sync** — lists refresh automatically (5 s polling + window focus), so changes made by an admin appear for users without a manual reload
- **Consistent stock** — approving a rental atomically decrements equipment quantity; cancelling/returning restores it; over-booking is rejected
- **Date-conflict guard** — overlapping bookings for the same equipment are validated
- **MongoDB aggregation** — dashboard analytics computed server-side with `$lookup`, `$group`, `$dateToString`
- **Live API inspector** — in-app panel showing every React → Express → MongoDB request/response
- **Security** — bcrypt password hashing, JWT expiry, global 401 auto-logout, role middleware

## Equipment Categories
- 🔊 Audio (speakers, microphones, mixers)
- 💡 Lighting (stage lights, LED panels, spotlights)
- 🪑 Furniture (tables, chairs, podiums)
- ⛺ Structures (tents, stages, canopies)
- 📽 Visual (projectors, screens, monitors)
- 🎉 Decor (backdrops, flower stands, red carpets)

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (via Docker or local install)

### Setup

1. **Start MongoDB** (if using Docker):
   ```bash
   docker start mongodb
   ```

2. **Backend**:
   ```bash
   cd server
   cp .env.example .env    # Edit with your values
   npm install
   npm run dev
   ```
   Server runs on `http://localhost:5000` — health check at `/api/health`

3. **Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Client runs on `http://localhost:5173`

4. **Seed Data**:
   ```bash
   cd server
   npm run seed
   ```
   Idempotent — creates/updates the accounts and equipment below without deleting existing users.

### Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin@123` |
| User | `user@example.com` | `User@123` |

## API Overview

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| PUT | `/api/auth/profile` | Authenticated |
| PUT | `/api/auth/change-password` | Authenticated |
| GET | `/api/health` | Public |
| GET | `/api/equipment` | Authenticated |
| POST/PUT/DELETE | `/api/equipment[/:id]` | Admin |
| GET | `/api/users` | Admin |
| POST/PUT/DELETE | `/api/users[/:id]` | Admin |
| GET | `/api/rentals` | Authenticated |
| GET | `/api/rentals/stats` | Admin |
| POST | `/api/rentals` | Authenticated |
| PUT | `/api/rentals/:id/status` | Admin |
| DELETE | `/api/rentals/:id` | Admin |

## Deployment (Vercel)

Both frontend and backend are deployed as separate Vercel projects.

### Backend
- Root directory: `server`
- Build command: `npm install`
- Environment variables: `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`, `CLIENT_URL`

### Frontend
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL` set to the backend URL
