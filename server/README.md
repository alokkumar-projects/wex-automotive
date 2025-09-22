# WEX Automotive API Server

This is a simple and efficient backend server built with **Fastify** to serve automotive data for the WEX Automotive Data Explorer application. It reads vehicle data from a local `auto-mpg.csv` file, cleans it, and exposes it through a set of RESTful API endpoints.

## Getting Started

To get the server up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation & Running

1.  **Navigate to the server directory:**

    ```bash
    cd wex-automotive/server
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Run the server in development mode:**

    ```bash
    npm run dev
    ```

    This will start the server with logging enabled, and it will automatically restart when you make changes. The server will be running at `http://localhost:5175`.

4.  **To run in production mode:**
    ```bash
    npm start
    ```

---

## API Endpoints

The server exposes the following endpoints to provide vehicle data and statistics to the client application:

- **`GET /api/vehicles`**

  - Returns a JSON array of all vehicle objects.

- **`GET /api/vehicles/:id`**

  - Returns a single vehicle object that matches the provided `id`.
  - If no vehicle is found, it returns a `404 Not Found` error.

- **`GET /api/stats`**

  - Returns a JSON object containing calculated statistics from the dataset, including:
    - Ranges for MPG, weight, horsepower, etc.
    - A list of unique origins and cylinder counts.
    - Average MPG grouped by model year.

- **`GET /api/debug/keys`** (For debugging)

  - Returns the keys of the first vehicle object to confirm the data is being parsed correctly.

- **`GET /api/debug/first`** (For debugging)
  - Returns the first vehicle object from the dataset.
