# RailYatra

A public railway reservation system with Node.js backend and responsive HTML/CSS/JS frontend.

## Structure

- `railway-frontend.html` — Interactive frontend UI for train search, booking, PNR lookup, and management.
- `backend/` — Express.js backend with MySQL database integration.
- `testing.sql` — Database schema and initialization queries.

## Setup

### Prerequisites
- Node.js (v12+)
- MySQL Server (v5.7+)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd DBMS-Project
   ```

2. **Set up the database:**
   - Open MySQL and run the queries in `testing.sql` to create the database schema
   - Tables: `train`, `passenger`, `schedule`, `booking`, `payment`

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=railway
   PORT=3000
   ```

4. **Install and start the backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Server will run on `http://localhost:3000`

5. **Open the frontend:**
   - Open `railway-frontend.html` in a web browser
   - Or serve it via a local server for better performance

## Features

- **Train Search:** Filter by source, destination, and date
- **Ticket Booking:** Book tickets with passenger details and seat class selection
- **PNR Status:** Check booking status using PNR number
- **Booking Management:** View all bookings and cancel if needed
- **50+ Trains:** Extensive train network coverage across major Indian cities
- **Responsive Design:** Works on desktop and mobile devices

## API Endpoints

- `GET /health` — Health check
- `POST /book` — Create a new booking
- `GET /bookings` — Get all bookings
- `GET /pnr/:pnr` — Check PNR status
- `PUT /cancel/:pnr` — Cancel a booking

## Environment Variables

All sensitive data must be set via environment variables (see `.env.example`). Never commit actual `.env` file to version control.

## Architecture

- Frontend communicates with backend via REST API
- Backend handles business logic and database operations
- MySQL database stores all persistent data
- Train master data is seeded on server startup

## Deployment Guide

### For Local Development
1. Follow the Installation steps above
2. Run backend on `http://localhost:3000`
3. Open `railway-frontend.html` in browser
4. Frontend automatically detects localhost and connects to local backend

### For Production (Public Deployment)

**Step 1: Deploy Backend**

Choose one of these services:

**Option A: Railway.app (Recommended - Free Tier)**
```bash
npm install -g railway
railway login
railway init
railway up
```

**Option B: Heroku**
```bash
npm install -g heroku
heroku login
heroku create your-app-name
git push heroku main
```

**Option C: Render.com**
- Connect GitHub repo
- Set environment variables
- Deploy automatically

**Step 2: Update Frontend API URL**

After deploying backend, edit `railway-frontend.html`:
```javascript
// Line ~15
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-deployed-backend-url.com'; // Add your backend URL here
```

Replace `https://your-deployed-backend-url.com` with your actual backend URL (e.g., `https://railyatra-backend.railway.app`)

**Step 3: Deploy Frontend**

Host frontend on:
- **GitHub Pages** (static hosting)
- **Vercel** (free, zero-config)
- **Netlify** (free, zero-config)
- **Any web server**

### Environment Variables for Deployed Backend

When deploying the backend, set these variables in your hosting platform:
```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=railway
PORT=3000 (or as required by platform)
```

## Notes

- `node_modules/` and `.env` are excluded from git via `.gitignore`
- Always update `.env` with actual credentials before running locally
- The frontend's `API_BASE` variable can be updated for different deployment environments
