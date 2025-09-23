You are absolutely right to call that out. My apologies\! I misunderstood and removed the detailed component and sequence diagrams when I should have kept them. They provide valuable, in-depth information that the new high-level diagrams don't cover.

I've corrected this by adding them back into a dedicated "Low-Level Design" section. Here is the complete and corrected `README.md` with all the diagrams restored.

---

# WEX Automotive Data Explorer

This is a full-stack web application that allows users to explore a rich dataset of automotive information from 1970-1982. The application is architected with a modern stack, featuring a React frontend and a Fastify backend server, both containerized with Docker for easy setup and deployment.

**Live Production URLs**

- **Frontend (Vercel):** [https://wex-automotive.vercel.app](https://wex-automotive.vercel.app)
- **Backend (Render):** [https://wex-automotive-server.onrender.com](https://wex-automotive-server.onrender.com)

---

## Architecture & Design

This application is designed with two distinct environments in mind: a cloud-native setup for production and a containerized setup for local development.

### Production Architecture (Vercel & Render)

The live application is deployed across specialized cloud platforms for optimal performance and scalability. The frontend is hosted on **Vercel**, a platform optimized for static site hosting and serverless functions, while the backend API and its database are hosted on **Render**.

```mermaid
graph TD
    subgraph "User"
        A[<i class='fa fa-user'></i> User's Browser]
    end

    subgraph "Production Environment"
        subgraph "Vercel Platform"
            B[<i class='fa fa-react'></i> React SPA Frontend<br/>(wex-automotive.vercel.app)]
        end

        subgraph "Render Platform"
            C[<i class='fa fa-node-js'></i> Fastify API Server<br/>(wex-automotive-server.onrender.com)]
            D[<i class='fa fa-database'></i> Production Database<br/>(e.g., Render PostgreSQL)]
            C <--> D
        end
    end

    subgraph "One-Time Data Seeding"
        E[<i class='fa fa-file-csv'></i> auto-mpg.csv] --> F((db/seed.js))
        F -- "Populates" --> D
    end

    A -- "Views Site" --> B
    B -- "API Calls" --> C

    classDef vercel fill:#f2f2f2,stroke:#000,stroke-width:2px;
    classDef render fill:#e6f9f0,stroke:#46a36c,stroke-width:2px;
    class B vercel;
    class C,D render;
```

### Local Development Architecture (Docker Compose)

For local development, the entire application is orchestrated using **Docker Compose**. This creates a consistent and isolated environment that mirrors the separated services of production but is easy to manage on a local machine.

```mermaid
graph TD
    subgraph "Developer's Machine"
        A[<i class='fa fa-user'></i> Browser @ localhost:5173]

        subgraph "Docker Environment (Orchestrated by Docker Compose)"
            subgraph "Client Service (Port 5173)"
                B[<i class='fa fa-server'></i> Nginx Server]
            end

            subgraph "Server Service (Port 5175)"
                C[<i class='fa fa-node-js'></i> Fastify Server]
                D[<i class='fa fa-database'></i> SQLite Database]
                C <--> D
            end
        end

        subgraph "Local Filesystem"
             E[<i class='fa fa-file'></i> db.sqlite file]
        end
    end

    A -- "Views App" --> B
    B -- "Proxies API calls to" --> C
    E -- "Mounted as a Volume into" --> D
```

---

### Low-Level Design (LLD)

#### Component Diagrams

This provides a more detailed look at the internal components of the client and server applications.

**Client (Frontend)**

```mermaid
graph TD;
    subgraph Client Application
        A[App.jsx] --> B{React Router};
        B --> C[Dashboard Page];
        B --> D[Gallery Page];
        B --> E[Vehicle Detail Page];
        B --> L[Login Page];
        B --> M[Signup Page];
        B --> N[Favorites Page];

        F["useVehicles.js Store <br/>(Zustand)"] --> G(Global State);
        C --> G;
        D --> G;
        E --> G;
        N --> G;

        H[vehicleApi.js] --> I("API Requests <br/> Axios");
        F --> H;

        J[AuthContext.jsx] --> K(User State);
        A --> K;
        L --> K;
        M --> K;
    end
```

**Server (Backend)**

```mermaid
graph TD;
    subgraph Server Application
        A[server.js] --> B{API Routes};
        B --> C[vehicleService.js];
        C --> D{db.sqlite};
        E[db/seed.js] -- populates --> D;
    end
```

---

#### Web Sequence Diagrams

**User Login Sequence**
This diagram illustrates the flow of a user logging into the application.

```mermaid
sequenceDiagram
    participant User
    participant Login Page (React)
    participant AuthContext
    participant vehicleApi.js
    participant Server (Fastify)
    participant Database (SQLite)

    User->>Login Page (React): Enters credentials and clicks "Login"
    Login Page (React)->>AuthContext: calls login(username, password)
    AuthContext->>vehicleApi.js: login(username, password)
    vehicleApi.js->>Server (Fastify): POST /api/v1/auth/login
    Server (Fastify)->>Database (SQLite): SELECT * FROM users WHERE username = ?
    Database (SQLite)-->>Server (Fastify): Returns user record
    Server (Fastify)-->>vehicleApi.js: Returns user object
    vehicleApi.js->>AuthContext: Returns user data
    AuthContext->>Login Page (React): Updates user state, redirects to dashboard
```

**Filtering Vehicles Sequence**
This diagram illustrates the flow of a common user action: applying a filter in the vehicle gallery.

```mermaid
sequenceDiagram
    participant User
    participant FilterPanel (React)
    participant Gallery (React)
    participant Zustand Store
    participant vehicleApi.js
    participant Server (Fastify)
    participant Database (SQLite)

    User->>FilterPanel: Selects a filter (e.g., clicks 'Japan')
    FilterPanel->>Gallery (React): Updates URL query parameters
    Gallery (React)->>Zustand Store: Calls fetchFilteredVehicles(filters)
    Zustand Store->>vehicleApi.js: getVehicles(filters)
    vehicleApi.js->>Server (Fastify): GET /api/v1/vehicles?origins=Japan
    Server (Fastify)->>Database (SQLite): Queries with filter conditions
    Database (SQLite)-->>Server (Fastify): Returns filtered vehicle data
    Server (Fastify)-->>vehicleApi.js: Returns JSON response
    vehicleApi.js->>Zustand Store: Returns data
    Zustand Store->>Gallery (React): Updates 'filteredVehicles' state
    Gallery (React)-->>User: Re-renders to display filtered vehicles
```

---

## Getting Started

To get the application up and running on your local machine, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Docker](https://www.docker.com/) & Docker Compose

### Installation & Running

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/alokkumar-projects/wex-automotive.git
    cd wex-automotive
    git fetch origin
    git checkout feature/wex-automative-explorer
    ```

2.  **Seed the Database:**
    Before running the application, you need to populate the database from the source CSV file.

    ```bash
    cd server
    npm install
    npm run db:seed
    cd ..
    ```

3.  **Run with Docker Compose:**
    This is the recommended way to run the application as it orchestrates both the client and server containers.

    ```bash
    docker-compose up --build
    ```

    The `--build` flag ensures that the Docker images are built before starting. The application will be available at `http://localhost:5173`.

---

## Key Features

### Frontend (Client)

- **User Authentication**: Full login and signup functionality, enabling personalized experiences.
- **Interactive Dashboard**: A scatter plot visualization showing the relationship between vehicle weight and MPG, color-coded by origin.
- **Dynamic Gallery & Filtering**: A gallery of all vehicles with a powerful filtering panel. Users can filter by name, origin, cylinders, and various numeric ranges (MPG, Weight, etc.).
- **Data Sorting**: The gallery can be sorted by multiple attributes like MPG, weight, and model year.
- **Vehicle Detail Page**: A dedicated page for each vehicle with a data-driven parallax effect where the animation is influenced by the car's acceleration value.
- **Favorites**: Authenticated users can mark vehicles as favorites, and this state is persisted in the database.
- **Responsive Design**: The application is fully responsive, built with **Tailwind CSS**.
- **Light/Dark Theme**: The application supports both light and dark themes, with the theme being persisted in local storage.

### Backend (Server)

- **Efficient RESTful API**: Built with Fastify to serve cleaned and structured vehicle data and pre-calculated statistics.
- **User Authentication**: Endpoints for user registration and login.
- **Favorites Management**: API endpoints for users to manage their favorite vehicles.
- **Data Processing**: The server reads from a tab-separated `auto-mpg.csv`, handles missing values, and normalizes headers before populating the database.

---

## Technology Stack

| Area         | Technology                                                                                                          |
| :----------- | :------------------------------------------------------------------------------------------------------------------ |
| **Frontend** | React, Vite, Zustand (for state management), React Router, Tailwind CSS, Chart.js, Framer Motion, Axios, PrimeReact |
| **Backend**  | Node.js, Fastify, SQLite3                                                                                           |
| **DevOps**   | Docker, Docker Compose                                                                                              |
| **Testing**  | Vitest, React Testing Library                                                                                       |

---

## API Endpoints

The server exposes the following endpoints:

- **`POST /api/v1/auth/register`**: Register a new user.
- **`POST /api/v1/auth/login`**: Login a user.
- **`GET /api/v1/vehicles`**: Returns a JSON array of vehicle objects. Supports filtering and sorting via query parameters.
- **`GET /api/v1/vehicles/:id`**: Returns a single vehicle object matching the provided `id`.
- **`GET /api/v1/stats`**: Returns a JSON object containing calculated statistics from the dataset, such as numeric ranges and unique categorical values.
- **`GET /api/v1/vehicles/scatter-plot`**: Returns the data needed for the scatter plot on the dashboard.
- **`GET /api/v1/vehicles/names`**: Returns a list of all vehicle names for the search autocomplete.
- **`GET /api/v1/vehicles/by-ids`**: Returns a list of vehicles for a given list of ids, used for the favorites page.
- **`GET /api/v1/favorites/:userId`**: Get all favorite vehicles for a user.
- **`POST /api/v1/favorites`**: Add a vehicle to a user's favorites.
- **`DELETE /api/v1/favorites`**: Remove a vehicle from a user's favorites.
