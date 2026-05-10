# Metro Cafe Setup Guide

## Overview
This repository contains a backend Express + TypeScript API and a frontend React + Vite app. Use Docker for MongoDB if you want the fastest local setup.

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ or pnpm/yarn
- Docker Desktop for Windows (optional, recommended for MongoDB)

## Option A: Run with Docker MongoDB

1. Open PowerShell in the repository root
2. Start MongoDB with Docker:
```powershell
docker compose up -d
```
3. Confirm MongoDB is available on `localhost:27017`

> The included `docker-compose.yml` starts a MongoDB container with a single replica set node.

## Option B: Run with local MongoDB

1. Install MongoDB Community Server
2. Start the MongoDB service
3. Use this connection string:
```text
mongodb://localhost:27017/metro-cafe
```

## Backend Setup

### 1. Install dependencies
```powershell
cd backend
npm install
```

### 2. Create `backend/.env`
Create a `.env` file in the `backend` folder with:
```text
PORT=5000
MONGODB_URI=mongodb://localhost:27017/metro-cafe
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Start the backend
```powershell
npm run dev
```

Expected output:
```text
🚇 Server running on http://localhost:5000
✅ MongoDB connected: localhost
```

### 4. Verify the backend
```powershell
curl http://localhost:5000/api/v1/health
```
Expected response:
```json
{ "status": "✅ Metro Cafe API running!" }
```

## Frontend Setup

### 1. Install dependencies
```powershell
cd frontend
npm install
```

### 2. Start the frontend
```powershell
npm run dev
```

### 3. Open the app
Open the browser to the URL shown by Vite (typically `http://localhost:5173`).

### 4. Connect frontend to backend
- Start the backend first with `cd backend && npm run dev`
- The backend should be available at `http://localhost:5000`
- If you see API request failures, confirm `CLIENT_URL=http://localhost:5173` in `backend/.env`

### 5. Optional frontend environment
- The current repo does not require a frontend `.env` by default.
- If your frontend code later uses `VITE_API_URL`, set it in `frontend/.env` like:
  ```text
  VITE_API_URL=http://localhost:5000
  ```

Open the browser at the URL shown by Vite (typically `http://localhost:5173`).

## Common Commands

- Start Docker MongoDB: `docker compose up -d`
- Stop Docker: `docker compose down`
- Backend dev server: `cd backend && npm run dev`
- Frontend dev server: `cd frontend && npm run dev`

## API Endpoints

- `GET /api/v1/health` — health check
- `POST /api/v1/orders` — create order
- `GET /api/v1/orders/vendor/:vendorId` — vendor orders
- `GET /api/v1/orders/track/:orderNumber` — order tracking

## Example Order Request
```powershell
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "vendor123",
    "items": [
      {
        "productId": "product123",
        "quantity": 1,
        "selectedVariants": [],
        "selectedAddons": []
      }
    ],
    "customer": {
      "name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com"
    },
    "payment": {
      "method": "cash"
    }
  }'
```

## Troubleshooting

### MongoDB connection failed
- Confirm the MongoDB container is running with:
  ```powershell
docker compose ps
```
- If using local MongoDB, verify the service is started in Windows Services.
- Check `backend/.env` and ensure `MONGODB_URI` is correct.
- Check the backend logs for details; the app retries the connection if it fails.

### Backend returns `Environment variable ... is required`
- Open `backend/.env` and add any missing variables.
- Make sure the file is located in the `backend` directory, not the repo root.
- Example required variables:
  - `CLIENT_URL`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `JWT_REFRESH_SECRET`
  - `JWT_EXPIRES_IN`
  - `JWT_REFRESH_EXPIRES_IN`

### Backend fails to start after `npm install`
- Run `cd backend && npm install` again and inspect the output for errors.
- Ensure `ts-node`, `nodemon`, and `typescript` are installed as dev dependencies.
- If `npm install` fails, delete `node_modules` and `package-lock.json`, then reinstall.

### Port 5000 already in use
- Find the process using the port:
  ```powershell
Get-NetTCPConnection -LocalPort 5000 | Format-List
```
- Stop it if needed:
  ```powershell
Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force
```
- Or change `PORT` in `backend/.env` and restart the backend.

### Frontend not loading or CORS issues
- Make sure the frontend is running with `cd frontend && npm run dev`.
- Confirm `CLIENT_URL` in `backend/.env` matches the Vite URL (usually `http://localhost:5173`).
- If the browser blocks requests, clear the browser cache and reload.

### Order API returns vendor/product errors
- Ensure vendor and product documents exist in MongoDB for the IDs used.
- Check the request payload format and required fields.
- Use `/api/v1/health` first to verify the backend is healthy.

## Notes
- Backend reads configuration from `backend/.env`.
- Frontend is a Vite app and runs on port `5173` by default.
- Run `npm install` separately in `backend/` and `frontend/`.
- If using Docker, stop services with `docker compose down` when finished.
