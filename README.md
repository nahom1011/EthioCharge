# EthioCharge ⚡

> Ethiopia's EV & Mobility Station Locator — find EV chargers, fuel stations, garages & car services on an interactive map.

## 🚀 Quick Start

### Backend (Django)
```bash
cd backend
.\venv\Scripts\python manage.py runserver
```
API runs at: http://localhost:8000/api/

### Frontend (React)
```bash
cd frontend
npm run dev
```
App runs at: http://localhost:5173

## 🛠 First-Time Setup

```bash
# Create admin superuser
cd backend
.\venv\Scripts\python manage.py createsuperuser
```
Admin panel: http://localhost:8000/admin/

## 📡 API Endpoints

| Method | URL | Auth |
|--------|-----|------|
| POST | /api/auth/register/ | No |
| POST | /api/auth/login/ | No |
| GET  | /api/stations/ | No |
| POST | /api/stations/ | Yes |
| GET  | /api/stations/{id}/ | No |
| GET  | /api/stations/{id}/reviews/ | No |
| POST | /api/reviews/ | Yes |

## 🗺️ Filter & Search

```
GET /api/stations/?station_type=ev&status=available
GET /api/stations/?search=bole
GET /api/stations/?charger_type=fast
```

## 🏗 Tech Stack

- **Backend**: Django 6 + DRF + SimpleJWT
- **Frontend**: React 18 + Vite + Leaflet.js
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **Map**: CartoDB Dark tiles + custom markers

## 🇪🇹 Seed Data
12 pre-loaded stations across Addis Ababa, Debre Birhan, and Adama.