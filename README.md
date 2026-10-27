# Event Equipment Rental System

A full-stack MERN application for renting event equipment. Supports role-based access for Admin and Normal Users.

## Tech Stack

- **Frontend**: React.js + React Bootstrap
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (JSON Web Tokens)

## Features

### Authentication
- Sign-up with validation (email format, password strength, required fields)
- Login with secure JWT authentication
- Logout functionality
- Password change for all users

### Admin Capabilities
- Dashboard with stats (total equipment, users, rentals)
- Equipment CRUD (add, view, update, delete)
- User management (add, view, update, remove)
- Rental management (view all, approve, cancel)

### Normal User Capabilities
- Browse available equipment catalog
- Search/filter by name and category
- View equipment details
- Request equipment rental (event name, dates, quantity)
- View personal rental history
- Change password

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
   Server runs on `http://localhost:5000`

3. **Frontend**:
   ```bash
   cd client
   npm install
   npm start
   ```
   Client runs on `http://localhost:3000`

4. **Seed Data** (optional):
   ```bash
   cd server
   npm run seed
   ```
   Creates an admin user (`admin@example.com` / `Admin@123`) and sample equipment.

## Deployment (Vercel)

Both frontend and backend are deployed as separate Vercel projects:

### Backend
- Root directory: `server`
- Build command: `npm install`
- Environment variables: Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` in Vercel dashboard

### Frontend
- Root directory: `client`
- Build command: `npm run build`
- Environment variable: Set `REACT_APP_API_URL` to your backend Vercel URL
