# TechConnect

**Find nearby trusted technicians** — an Urban Company–inspired college major project.

## Phase 1: Basic App (Current)

What's built so far:

- Landing page with service search
- **Radius filter** (1–50 km) to find technicians near you
- **Trusted technician** filter (verified badge)
- Service category filter (AC, Laptop, Plumbing, etc.)
- Technician cards with rating, distance, price, availability
- "Use my location" via browser geolocation
- REST API with Haversine distance calculation

## Tech Stack

| Layer    | Technology        |
|----------|-------------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend  | Node.js + Express |
| Search   | Haversine formula (geo radius) |

## Project Structure

```
techconnect/
├── backend/          # Express API
│   ├── data/         # Mock technician data
│   ├── utils/        # Distance calculation
│   └── server.js
├── frontend/         # React UI
│   └── src/
│       ├── api/
│       └── components/
└── package.json      # Root scripts
```

## Getting Started

### 1. Install dependencies

```bash
cd techconnect
npm run install:all
```

### 2. Run the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/services` | List service categories |
| GET | `/api/technicians?lat=&lng=&radius=&service=&trusted=` | Find technicians within radius |

## Upcoming Phases (Roadmap)

- **Phase 2:** User authentication (login/signup)
- **Phase 3:** Real booking flow with date/time slots
- **Phase 4:** Technician dashboard & admin panel
- **Phase 5:** Database (MongoDB/PostgreSQL) + maps integration
- **Phase 6:** Reviews, payments, notifications

## Default Location

If geolocation is denied, the app defaults to **New Delhi** (28.6139, 77.209) with mock technicians in the NCR region.
