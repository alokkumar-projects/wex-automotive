---
# WEX Automotive Data Explorer

This is a full-stack web application that allows users to explore a rich dataset of automotive information from 1970–1982. The application is architected with a modern stack, featuring a React frontend and a Fastify backend server, both containerized with Docker for easy setup and deployment.

**Live Production URLs**

- **Frontend (Vercel):** [https://wex-automotive.vercel.app](https://wex-automotive.vercel.app)
- **Backend (Render):** [https://wex-automotive-server.onrender.com](https://wex-automotive-server.onrender.com)
---

## Architecture & Design

This application is designed with two distinct environments in mind: a cloud-native setup for production and a containerized setup for local development.

### Production Architecture (Vercel & Render)

```mermaid
graph TD
    subgraph "User"
        A[User's Browser]
    end

    subgraph "Production Environment"
        subgraph "Vercel Platform"
            B[React SPA Frontend\nwex-automotive.vercel.app]
        end

        subgraph "Render Platform"
            C[Fastify API Server\nwex-automotive-server.onrender.com]
            D[Production Database\nRender PostgreSQL]
            C <--> D
        end
    end

    subgraph "One-Time Data Seeding"
        E[auto-mpg.csv] --> F((db/seed.js))
        F -- "Populates" --> D
    end

    A -- "Views Site" --> B
    B -- "API Calls" --> C
```

---

### Local Development Architecture (Docker Compose)

```mermaid
graph TD
    subgraph "Developer's Machine"
        A[Browser @ localhost:5173]

        subgraph "Docker Environment (Docker Compose)"
            subgraph "Client Service (Port 5173)"
                B[Nginx Server]
            end

            subgraph "Server Service (Port 5175)"
                C[Fastify Server]
                D[SQLite Database]
                C <--> D
            end
        end

        subgraph "Local Filesystem"
             E[db.sqlite file]
        end
    end

    A -- "Views App" --> B
    B -- "Proxies API calls" --> C
    E -- "Mounted as Volume" --> D
```

---

### Low-Level Design (LLD)

#### Component Diagrams

**Client (Frontend)**

```mermaid
graph TD
    subgraph Client Application
        A[App.jsx] --> B{React Router}
        B --> C[Dashboard Page]
        B --> D[Gallery Page]
        B --> E[Vehicle Detail Page]
        B --> L[Login Page]
        B --> M[Signup Page]
        B --> N[Favorites Page]

        F["useVehicles.js Store\n(Zustand)"] --> G(Global State)
        C --> G
        D --> G
        E --> G
        N --> G

        H[vehicleApi.js] --> I(API Requests via Axios)
        F --> H

        J[AuthContext.jsx] --> K(User State)
        A --> K
        L --> K
        M --> K
    end
```

**Server (Backend)**

```mermaid
graph TD
    subgraph Server Application
        A[server.js] --> B{API Routes}
        B --> C[vehicleService.js]
        C --> D{db.sqlite}
        E[db/seed.js] -- "populates" --> D
    end
```

---

#### Web Sequence Diagrams

**User Login Sequence**

```mermaid
sequenceDiagram
    participant User
    participant Login Page (React)
    participant AuthContext
    participant vehicleApi.js
    participant Server (Fastify)
    participant Database (SQLite)

    User->>Login Page (React): Enters credentials
    Login Page (React)->>AuthContext: login(username, password)
    AuthContext->>vehicleApi.js: login(username, password)
    vehicleApi.js->>Server (Fastify): POST /api/v1/auth/login
    Server (Fastify)->>Database (SQLite): SELECT user
    Database (SQLite)-->>Server (Fastify): User record
    Server (Fastify)-->>vehicleApi.js: User object
    vehicleApi.js->>AuthContext: User data
    AuthContext->>Login Page (React): Update state, redirect
```

**Filtering Vehicles Sequence**

```mermaid
sequenceDiagram
    participant User
    participant FilterPanel (React)
    participant Gallery (React)
    participant Zustand Store
    participant vehicleApi.js
    participant Server (Fastify)
    participant Database (SQLite)

    User->>FilterPanel: Selects filter
    FilterPanel->>Gallery (React): Update query params
    Gallery (React)->>Zustand Store: fetchFilteredVehicles(filters)
    Zustand Store->>vehicleApi.js: getVehicles(filters)
    vehicleApi.js->>Server (Fastify): GET /api/v1/vehicles?origins=Japan
    Server (Fastify)->>Database (SQLite): Query with filters
    Database (SQLite)-->>Server (Fastify): Results
    Server (Fastify)-->>vehicleApi.js: JSON response
    vehicleApi.js->>Zustand Store: Data
    Zustand Store->>Gallery (React): Update state
    Gallery (React)-->>User: Show filtered vehicles
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) & Docker Compose

### Installation & Running

1. **Clone the repository**

   ```bash
   git clone https://github.com/alokkumar-projects/wex-automotive.git
   cd wex-automotive
   git fetch origin
   git checkout feature/wex-automative-explorer
   ```

2. **Seed the database**

   ```bash
   cd server
   npm install
   npm run db:seed
   cd ..
   ```

3. **Run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

   App runs at **[http://localhost:5173](http://localhost:5173)**.

---

## Key Features

### Frontend (Client)

- User authentication (login/signup)
- Interactive dashboard (scatter plot by MPG vs. weight, color-coded by origin)
- Gallery with advanced filtering & sorting
- Vehicle detail pages with parallax animation
- Favorites management (persisted in DB)
- Responsive, themeable UI (Tailwind, light/dark modes)

### Backend (Server)

- RESTful API (Fastify)
- Authentication endpoints
- Favorites management
- Data ingestion from `auto-mpg.csv`
- Normalized database schema

---

## Technology Stack

| Area         | Technology                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Frontend** | React, Vite, Zustand, React Router, Tailwind CSS, Chart.js, Framer Motion, Axios, PrimeReact |
| **Backend**  | Node.js, Fastify, SQLite3                                                                    |
| **DevOps**   | Docker, Docker Compose                                                                       |
| **Testing**  | Vitest, React Testing Library                                                                |

---

## API Endpoints

- `POST /api/v1/auth/register` – Register user
- `POST /api/v1/auth/login` – Login user
- `GET /api/v1/vehicles` – List vehicles (with filters/sorting)
- `GET /api/v1/vehicles/:id` – Single vehicle by ID
- `GET /api/v1/stats` – Statistics & metadata
- `GET /api/v1/vehicles/scatter-plot` – Data for dashboard scatter plot
- `GET /api/v1/vehicles/names` – Vehicle names (autocomplete)
- `GET /api/v1/vehicles/by-ids` – Vehicles by ID list (favorites)
- `GET /api/v1/favorites/:userId` – User favorites
- `POST /api/v1/favorites` – Add favorite
- `DELETE /api/v1/favorites` – Remove favorite

---
