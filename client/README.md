# WEX Automotive Data Explorer (Client)

This is a responsive and interactive single-page application (SPA) built with **React** and **Vite**. It provides a user-friendly interface to explore a dataset of automotive information from 1970-1982. The application allows users to visualize, filter, and interact with the data in a meaningful way.

## Key Features

- **Interactive Dashboard:** A scatter plot visualization (using **Chart.js**) that shows the relationship between vehicle weight and MPG, color-coded by the vehicle's origin.
- **Dynamic Gallery:** A gallery of all vehicles with a powerful and intuitive filtering panel. Users can filter by:
  - Car Name (search)
  - Origin (USA, Europe, Japan)
  - Number of Cylinders
  - MPG, Weight, Horsepower, and more (with range sliders)
- **Data Sorting:** The gallery can be sorted by various attributes like MPG, weight, and model year.
- **Vehicle Detail Page:** A dedicated page for each vehicle, featuring a unique data-driven parallax effect (using **Framer Motion**) where the animation is influenced by the car's acceleration.
- **Favorites:** Users can mark vehicles as "favorites," and this information is persisted in the browser's local storage.
- **Responsive Design:** The application is fully responsive and works beautifully on all screen sizes, thanks to **Tailwind CSS**.

## Technology Stack

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A modern, blazing-fast build tool for web development.
- **Zustand:** A small, fast, and scalable state management solution for React.
- **React Router:** For declarative routing within the application.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Chart.js:** For creating beautiful and interactive charts.
- **Framer Motion:** For creating fluid animations and interactive UI elements.

## Getting Started

To get the client application running on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/)

### Installation & Running

1.  **Navigate to the client directory:**

    ```bash
    cd wex-automotive/client
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start the Vite development server, and you can view the application by opening `http://localhost:5173` in your browser. The application will automatically proxy API requests to the server running on port `5175`.

    **Note:** Ensure the server application is running before starting the client.

4.  **To build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory with the optimized and bundled assets.
