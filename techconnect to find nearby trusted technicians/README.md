# TechConnect

**Find nearby trusted technicians** — An Urban Company–inspired full-stack platform for discovering and booking local service professionals.

## 📋 Table of Contents

- [Overview](#overview)
- [Current Features](#current-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Data Structure](#data-structure)
- [Authentication System](#authentication-system)
- [Routes & Pages](#routes--pages)
- [Development Scripts](#development-scripts)
- [Roadmap](#roadmap)
- [Mock Data](#mock-data)

---

## Overview

TechConnect is a two-sided marketplace platform that connects clients needing various services with vetted technicians in their locality. The application uses geolocation-based search with the Haversine formula to find technicians within a specified radius, providing ratings, experience, pricing, and availability information.

**Key Concept:** Users can search for services (AC Repair, Electrical work, Plumbing, etc.), filter by distance, trusted status, and view detailed technician profiles before booking.

---

## Current Features

### Phase 1: Discovery & Search (Current Implementation)

#### Frontend Features
- ✅ **Landing page** with hero section and service browsing
- ✅ **Radius-based search** (1–50 km filter)
- ✅ **Trusted technician filter** (verified badge indicator)
- ✅ **Service category filtering** (AC Repair, Electrician, Plumber, Appliance Repair, Carpenter, etc.)
- ✅ **Technician cards** displaying:
  - Name, photo (avatar), rating, review count
  - Service type, years of experience
  - Hourly/service rate (₹)
  - Availability status
  - Distance from user location
  - Phone number
- ✅ **Browser geolocation** integration with fallback to default location
- ✅ **Bottom navigation** for easy mobile navigation
- ✅ **Responsive UI** with Tailwind CSS

#### Backend Features
- ✅ **RESTful API** with Express.js
- ✅ **Haversine distance calculation** for accurate radius search
- ✅ **Mock technician database** (10+ technicians with real data)
- ✅ **Authentication endpoints** (register, login)
- ✅ **Order management endpoints** (create, view, update)
- ✅ **Dashboard routes** (client & technician-specific)
- ✅ **CORS enabled** for frontend-backend communication
- ✅ **Session/token-based authentication** with middleware

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 19.0 | UI component library |
| **Frontend Build** | Vite 6.0 | Fast development & production builds |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework |
| **Routing** | React Router DOM 7.18 | Client-side navigation |
| **Backend Runtime** | Node.js | JavaScript runtime |
| **Backend Framework** | Express.js | Web server & API routing |
| **HTTP/Middleware** | CORS | Cross-origin request handling |
| **Utilities** | Haversine Formula | Geo-distance calculation |
| **Security** | Crypto (Node.js native) | Password hashing (scrypt) |
| **CSS Processing** | PostCSS 8.4 | CSS transformations |
| **Automation** | Concurrently | Run multiple npm scripts in parallel |

---

## Project Structure

```
techconnect/
├── backend/                          # Node.js + Express API
│   ├── server.js                    # Express app initialization & routes
│   ├── package.json                 # Backend dependencies
│   │
│   ├── data/
│   │   ├── technicians.js           # Mock technician database (10+ records)
│   │   └── store.js                 # In-memory user & order storage
│   │
│   ├── routes/
│   │   ├── auth.js                  # Authentication (register, login, logout)
│   │   ├── orders.js                # Order CRUD operations
│   │   └── dashboard.js             # Client & technician dashboards
│   │
│   ├── middleware/
│   │   └── auth.js                  # JWT/session verification, role-based access
│   │
│   └── utils/
│       └── distance.js              # Haversine distance calculation
│
├── frontend/                         # React + Vite frontend
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Frontend dependencies
│   ├── vite.config.js               # Vite build configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   │
│   ├── public/
│   │   └── manifest.json            # PWA manifest (mobile app support)
│   │
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Root component with routing
│       ├── index.css                # Global styles
│       │
│       ├── api/
│       │   └── client.js            # Axios/Fetch API wrapper for backend
│       │
│       ├── components/              # Reusable UI components
│       │   ├── Header.jsx           # Navigation header
│       │   ├── Hero.jsx             # Landing page hero section
│       │   ├── ServiceCategories.jsx # Service filter buttons
│       │   ├── LocationRadiusPanel.jsx # Distance filter slider
│       │   ├── TechnicianCard.jsx   # Individual technician card
│       │   ├── TechnicianList.jsx   # Grid of technician cards
│       │   ├── OrderStatusBadge.jsx # Order status indicator
│       │   ├── Toast.jsx            # Notification component
│       │   ├── BottomNavigation.jsx # Mobile nav bar
│       │   └── ProtectedRoute.jsx   # Role-based route protection
│       │
│       ├── context/
│       │   └── AuthContext.jsx      # Global authentication state (login, user data)
│       │
│       ├── pages/                   # Full-page components (routes)
│       │   ├── HomePage.jsx         # Landing page with search
│       │   ├── SignUpPage.jsx       # User registration form
│       │   ├── SignInPage.jsx       # User login form
│       │   ├── ProfilePage.jsx      # User profile & settings
│       │   ├── BookingPage.jsx      # Technician booking form
│       │   ├── BookingTrackingPage.jsx # Real-time order tracking
│       │   ├── ClientDashboard.jsx  # Client order history & dashboard
│       │   └── TechnicianDashboard.jsx # Technician order management
│       │
│       ├── constants/
│       │   └── services.jsx         # Service categories (AC, Electrician, etc.)
│       │
│       └── android/                 # Android app build files (React Native)
│
├── package.json                     # Root package scripts
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## Getting Started

### Prerequisites
- **Node.js** 16+ (LTS recommended)
- **npm** or **yarn**
- Modern web browser with geolocation support

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd "techconnect to find nearby trusted technicians"

# Install all dependencies (root, backend, and frontend)
npm run install:all
```

This command runs:
- `npm install` (root dependencies)
- `npm install --prefix backend`
- `npm install --prefix frontend`

### 2. Start the Application

```bash
# Start both frontend and backend concurrently
npm run dev
```

Or run individually:

```bash
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Frontend App
npm run dev:frontend
```

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

### Demo Admin Credentials

Use these credentials to sign in as the platform administrator:

- **Username:** `admin`
- **Password:** `admin124`

This admin account is used to review bookings, approve payment submissions, and manage the operations dashboard.

---

## API Endpoints

### Base URL: `http://localhost:5000`

### Public Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/health` | Health check | — |
| `GET` | `/api/services` | Get all service categories | — |
| `GET` | `/api/technicians` | Find technicians by location & filters | `lat`, `lng`, `radius`, `service`, `trusted` |
| `POST` | `/api/auth/register` | Create new user account | — |
| `POST` | `/api/auth/login` | Authenticate user | — |

#### Technicians Search Query Params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `lat` | float | **Required** | User latitude |
| `lng` | float | **Required** | User longitude |
| `radius` | float | 5 | Search radius in kilometers (1–50) |
| `service` | string | — | Filter by service type (e.g., "AC Repair") |
| `trusted` | boolean | false | Show only verified technicians |

#### Example Requests

```bash
# Find all technicians within 10 km
curl "http://localhost:5000/api/technicians?lat=16.235&lng=80.551&radius=10"

# Find only trusted electricians within 5 km
curl "http://localhost:5000/api/technicians?lat=16.235&lng=80.551&radius=5&service=Electrician&trusted=true"
```

### Protected Endpoints (Require Authentication)

| Method | Endpoint | Role(s) | Description |
|--------|----------|---------|-------------|
| `POST` | `/api/auth/logout` | Any | Logout user |
| `GET` | `/api/orders` | client, technician | Get user's orders |
| `GET` | `/api/orders/:id` | client, technician | Get order details |
| `POST` | `/api/orders` | client | Create new booking |
| `PATCH` | `/api/orders/:id` | client, technician | Update order status |
| `GET` | `/api/dashboard/client` | client | Client dashboard data |
| `GET` | `/api/dashboard/technician` | technician | Technician dashboard data |

---

## Data Structure

### Technician Object

```javascript
{
  id: 1,
  name: "Venkata Sai",
  service: "AC Repair",                    // Service category
  rating: 4.8,                              // 0–5 stars
  reviews: 214,                             // Number of reviews
  trusted: true,                            // Verified badge
  experience: "6 years",                    // Years of experience
  price: 499,                               // Hourly/service rate (₹)
  lat: 16.235,                              // Latitude
  lng: 80.551,                              // Longitude
  city: "Guntur",
  phone: "+91 90101 11001",
  available: true,                          // Availability status
  image: "https://api.dicebear.com/9.x/..." // Avatar URL
}
```

### User Object (Stored)

```javascript
{
  id: "user-uuid",
  name: "John Doe",
  email: "john@example.com",
  password: "salt:hash",                    // Hashed with scrypt
  roles: ["client"],                        // Can be ["client"], ["technician"], or both
  phone: "+91 98765 43210",
  address: "123 Main St",
  city: "Guntur",
  service: "AC Repair",                     // Only for technicians
  experience: "5 years",                    // Only for technicians
  technicianId: "tech-uuid",                // Linked to service records
  createdAt: "2024-01-15T10:30:00Z",
  token: "random-hex-token-32-chars"
}
```

### Order Object

```javascript
{
  id: "order-uuid",
  clientId: "user-uuid",
  clientName: "John Doe",
  technicianId: "tech-uuid",
  technicianName: "Venkata Sai",
  service: "AC Repair",
  status: "pending",                        // pending, accepted, in-progress, completed, cancelled
  scheduledDate: "2024-01-20",
  scheduledTime: "14:00",
  price: 499,
  location: "123 Main St, Guntur",
  clientRating: 0,
  clientReview: "",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### Service Categories

```javascript
[
  "AC Repair",
  "Electrician",
  "Plumber",
  "Appliance Repair",
  "Carpenter",
  "Handyman",
  "Locksmith",
  "Pest Control"
]
```

---

## Authentication System

### How It Works

1. **Registration:** User creates account with email, password, name, and role
2. **Password Hashing:** Passwords are hashed using Node.js `scrypt` algorithm with random salt
3. **Login:** User provides credentials; system verifies and creates a session token
4. **Token Storage:** Token stored in browser's localStorage
5. **Protected Routes:** API checks token validity before allowing access
6. **Role-Based Access:** Routes check user's `role` array for authorization

### Authentication Flow

```
User Registration
    ↓
Store User (hashed password) in store.js
    ↓
User Login
    ↓
Verify Credentials
    ↓
Generate Session Token
    ↓
Return Token to Frontend
    ↓
Frontend Stores in localStorage
    ↓
API Middleware Validates Token on Protected Routes
```

### Protected Routes

- All `/api/orders/*` endpoints require authentication
- All `/api/dashboard/*` endpoints require authentication
- Booking pages require `ProtectedRoute` wrapper with role check

---

## Routes & Pages

### Frontend Routes (React Router)

| Path | Component | Auth Required | Description |
|------|-----------|----------------|-------------|
| `/` | HomePage | No | Landing page with technician search |
| `/signin` | SignInPage | No | User login form |
| `/signup` | SignUpPage | No | User registration form |
| `/profile` | ProfilePage | Yes | User profile & settings |
| `/booking/technician/:technicianId` | BookingPage | Yes (client) | Booking form for selected technician |
| `/booking/order/:orderId` | BookingTrackingPage | Yes (client) | Real-time order tracking |
| `/dashboard/client` | ClientDashboard | Yes (client) | Client order history |
| `/dashboard/technician` | TechnicianDashboard | Yes (technician) | Technician order queue |
| `*` | Redirect | — | Any other route → `/` |

### Component Hierarchy

```
App
├── Routes
│   ├── HomePage
│   │   ├── Header
│   │   ├── Hero
│   │   ├── ServiceCategories
│   │   ├── LocationRadiusPanel
│   │   └── TechnicianList
│   │       └── TechnicianCard (x multiple)
│   ├── SignUpPage
│   ├── SignInPage
│   ├── ProfilePage
│   ├── ProtectedRoute
│   │   ├── BookingPage
│   │   ├── BookingTrackingPage
│   │   ├── ClientDashboard
│   │   │   └── OrderStatusBadge (x multiple)
│   │   └── TechnicianDashboard
│   │       └── OrderStatusBadge (x multiple)
│   └── 404 Redirect
│
└── BottomNavigation (global)
    └── Toast (notifications)
```

---

## Development Scripts

### Root Level (`package.json`)

```bash
# Install dependencies for all packages
npm run install:all

# Start both frontend and backend concurrently
npm run dev

# Start only backend (Port 5000)
npm run dev:backend

# Start only frontend (Port 5173)
npm run dev:frontend
```

### Backend (`backend/package.json`)

```bash
npm run dev      # Start with nodemon (auto-restart on file changes)
npm run build    # Bundle for production (if configured)
npm run start    # Run production build
```

### Frontend (`frontend/package.json`)

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Build optimized production bundle
npm run preview  # Preview production build locally
```

---

## Roadmap

### ✅ Phase 1: Basic App (Current - Completed)
- Landing page with service search
- Technician discovery with filters (radius, service, trusted)
- Geolocation-based search
- Authentication endpoints

### 🔄 Phase 2: Authentication & Profiles (In Progress)
- User registration & login UI
- Profile creation (client & technician)
- Session management
- Email verification

### 📅 Phase 3: Booking System
- Real booking flow with date/time picker
- Service duration selection
- Price quotation
- Order confirmation

### 👤 Phase 4: Dashboards & Management
- Client order history & tracking
- Technician job queue & status updates
- Real-time notifications
- Order history & analytics

### 🗺️ Phase 5: Maps & Advanced Features
- Real map integration (Google Maps / Mapbox)
- Live location tracking
- Dynamic pricing
- MongoDB/PostgreSQL database migration

### ⭐ Phase 6: Reviews, Payments & Notifications
- 5-star rating system
- Text/image reviews
- Payment gateway integration (Razorpay, Stripe)
- Push notifications
- Email notifications

### 🚀 Phase 7: Scale & Optimization
- Admin panel
- Analytics dashboard
- Referral system
- Premium technician tiers
- SMS notifications

---

## Mock Data

### Sample Technician Locations

The mock database includes 10+ technicians primarily in **Guntur, Andhra Pradesh**:
- Latitude range: 16.218 – 16.241
- Longitude range: 80.545 – 80.562

### Default User Location

If browser geolocation is denied or unavailable:
- **City:** New Delhi
- **Coordinates:** 28.6139°N, 77.2090°E

This allows testing with different radius values to find mock technicians in Guntur.

### Test Credentials

*(To be added after Phase 2)*

---

## Project Notes

### Why Haversine Formula?

The Haversine formula calculates the great-circle distance between two points on a sphere given their latitude and longitude. It's more accurate than simple Euclidean distance for real-world locations.

**Formula Used:**
```
a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
c = 2 * atan2(√a, √(1−a))
d = R * c
```

Where φ is latitude, λ is longitude, R is Earth's radius (~6371 km).

### Security Considerations

- Passwords hashed with **scrypt** (memory-hard, timing-safe)
- Session tokens are 32-character random hex strings
- Role-based access control (RBAC) on protected endpoints
- CORS enabled for frontend domain only (production config needed)

### Future Improvements

- Migrate from in-memory storage to database
- Implement real email verification
- Add photo upload functionality
- Add map visualization
- Implement caching (Redis)
- Add rate limiting & request validation
