# How to Run the HR Management System

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `backend` directory with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/dayflow_db"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the backend server:**
   ```bash
   node src/server.js
   ```
   
   Or with nodemon (auto-restart on changes):
   ```bash
   npx nodemon src/server.js
   ```

   The backend will run on `http://localhost:3001`

## Step 2: Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Step 3: Access the Application

1. Open your browser and go to: `http://localhost:5173`
2. Login with your credentials (from the seeded database)
3. Navigate through the dashboard

## Quick Start (Both Servers)

### Option 1: Run in separate terminals
- Terminal 1: `cd backend && node src/server.js`
- Terminal 2: `cd frontend && npm run dev`

### Option 2: Use npm scripts (if added)
- Backend: `cd backend && npm start`
- Frontend: `cd frontend && npm run dev`

## Troubleshooting

- **Database connection error**: Make sure PostgreSQL is running and DATABASE_URL is correct
- **Port already in use**: Change the port in `backend/src/server.js` or `frontend/vite.config.js`
- **CORS errors**: Check that backend CORS is enabled (already configured)
- **Module not found**: Run `npm install` in both directories

