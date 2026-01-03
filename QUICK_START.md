# Quick Start Guide

## 🚀 Running the Application

### 1. Start Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
Backend runs on: http://localhost:3001

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

### 3. Access the App
Open browser: http://localhost:5173

---

## ⚙️ First Time Setup

### Backend Setup:
1. Create `.env` file in `backend/` folder:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/dayflow_db"
   JWT_SECRET="your-secret-key-change-this"
   ```

2. Setup database:
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

### Frontend Setup:
- No additional setup needed! Just install and run.

---

## 📝 Default Login Credentials

Check your database seed file (`backend/prisma/seed.js`) for default users.

---

## 🐛 Troubleshooting

- **Backend won't start**: Check DATABASE_URL in `.env` file
- **Frontend can't connect**: Make sure backend is running on port 3001
- **Port conflicts**: Change ports in `backend/src/server.js` or `frontend/vite.config.js`

