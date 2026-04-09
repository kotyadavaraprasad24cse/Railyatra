# RailYatra

A public railway reservation frontend and Node.js backend project.

## Structure

- `railway-frontend.html` — frontend UI for train search, booking, PNR lookup, and management.
- `backend/` — Express.js backend with MySQL support.

## Setup

1. Copy `.env.example` to `.env` and update your database credentials.
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
4. Open `railway-frontend.html` in a browser.

## Notes

- The backend reads database connection values from environment variables.
- `node_modules/` is excluded from source control.
- Before running the backend, create a MySQL database named `railway` and add the required tables for `train`, `passenger`, `schedule`, `booking`, and `payment`.
