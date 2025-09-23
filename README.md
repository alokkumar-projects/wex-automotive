# WEX Automotive Data Explorer

This is a full-stack web application that allows users to explore a rich dataset of automotive information from 1970-1982. The application is architected with a modern stack, featuring a React frontend and a Fastify backend server, both containerized with Docker for easy setup and deployment.

## Architecture & Design

### High-Level Architecture

This diagram provides a comprehensive overview of the application's components, data flow, and infrastructure. The system is entirely containerized using Docker Compose, creating a clear separation between the client-side and server-side services.

**Data Flow & Lifecycle:**

1.  **Build/Seed Time**: The process begins with the raw `auto-mpg.csv` data file. A Node.js script (`db/seed.js`) is executed manually (`npm run db:seed`) to parse this file, clean the data, and populate a persistent **SQLite database file (`db.sqlite`)**.
2.  **Runtime**: When a user accesses the application at `http://localhost:5173`, their browser receives a production-built React single-page application, served statically by an **Nginx** web server running in the `client` container.
3.  **Interaction**: The React application, running in the user's browser, makes API calls to the backend. These requests are sent to `http://localhost:5175`, which is mapped to the `server` container.
4.  **API & Database**: The **Fastify** server receives these API requests, queries the pre-populated SQLite database for the relevant vehicle data, and returns it to the client as a JSON payload. The SQLite database file is mounted into the server container via a Docker volume, ensuring data persistence.

### High-Level Architecture

### Detailed Component Architecture

```mermaid
graph TD
    subgraph "Local Filesystem / Data Source"
        E[fa:fa-file-csv auto-mpg.csv] -- "1. Parsed by" --> F((db/seed.js))
        F -- "2. Populates" --> D_Vol[fa:fa-database db.sqlite Volume]
    end

    subgraph "User's Browser"
        A[fa:fa-react React SPA]
    end

    subgraph "Docker Environment (Orchestrated by Docker Compose)"
        subgraph "Client Service (Port 5173)"
            B[fa:fa-server Nginx Web Server]
        end

        subgraph "Server Service (Port 5175)"
            C[fa:fa-node-js Fastify API Server]
            D_DB[fa:fa-database SQLite Database]
            C <--> D_DB
        end
    end

    B -- "3. Serves Static HTML/CSS/JS" --> A
    A -- "4. API Request (e.g., GET /api/v1/vehicles)" --> C
    C -- "5. Returns Vehicle Data (JSON)" --> A
    D_Vol -- "Mounted Into Container" --> D_DB

    style E fill:#2d8,stroke:#333,stroke-width:2px
    style D_Vol fill:#f9f,stroke:#333,stroke-width:2px
```

---

### Component Diagram

This provides a more detailed look at the internal components of the client and server applications.

**Client (Frontend)**

```mermaid
graph TD;
    subgraph Client Application
        A[App.jsx] --> B{React Router};
        B --> C[Dashboard Page];
        B --> D[Gallery Page];
        B --> E[Vehicle Detail Page];
        F["useVehicles.js Store <br/>(Zustand)"] --> G(Global State);
        C --> G;
        D --> G;
        E --> G;
        H[vehicleApi.js] --> I("API Requests <br/> Axios");
        F --> H;
        J[ThemeContext.jsx] --> K(Theme Management);
        A --> K;
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

### Web Sequence Diagram (Filtering Vehicles)

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
    FilterPanel->>Gallery: Updates URL query parameters
    Gallery->>Zustand Store: Calls fetchFilteredVehicles(filters)
    Zustand Store->>vehicleApi.js: getVehicles(filters)
    vehicleApi.js->>Server: GET /api/v1/vehicles?origins=Japan
    Server->>Database: Queries with filter conditions
    Database-->>Server: Returns filtered vehicle data
    Server-->>vehicleApi.js: Returns JSON response
    vehicleApi.js->>Zustand Store: Returns data
    Zustand Store->>Gallery: Updates 'filteredVehicles' state
    Gallery-->>User: Re-renders to display filtered vehicles
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

- **Interactive Dashboard**: A scatter plot visualization showing the relationship between vehicle weight and MPG, color-coded by origin.
- **Dynamic Gallery & Filtering**: A gallery of all vehicles with a powerful filtering panel. Users can filter by name, origin, cylinders, and various numeric ranges (MPG, Weight, etc.).
- **Data Sorting**: The gallery can be sorted by multiple attributes like MPG, weight, and model year.
- **Vehicle Detail Page**: A dedicated page for each vehicle with a data-driven parallax effect where the animation is influenced by the car's acceleration value.
- **Favorites**: Users can mark vehicles as favorites, and this state is persisted in local storage.
- **Responsive Design**: The application is fully responsive, built with **Tailwind CSS**.
- **Light/Dark Theme**: The application supports both light and dark themes, with the theme being persisted in local storage.

### Backend (Server)

- **Efficient RESTful API**: Built with Fastify to serve cleaned and structured vehicle data and pre-calculated statistics.
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

- **`GET /api/v1/vehicles`**: Returns a JSON array of vehicle objects. Supports filtering and sorting via query parameters.
- **`GET /api/v1/vehicles/:id`**: Returns a single vehicle object matching the provided `id`.
- **`GET /api/v1/stats`**: Returns a JSON object containing calculated statistics from the dataset, such as numeric ranges and unique categorical values.
- **`GET /api/v1/vehicles/scatter-plot`**: Returns the data needed for the scatter plot on the dashboard.
- **`GET /api/v1/vehicles/names`**: Returns a list of all vehicle names for the search autocomplete.
- **`GET /api/v1/vehicles/by-ids`**: Returns a list of vehicles for a given list of ids, used for the favorites page.
