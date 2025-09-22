import React from 'react';

export default function About() {
  return (
    <div className="prose max-w-none">
      <h1>About</h1>
      <p>
        This application explores the 1970–1982 auto MPG dataset, highlighting core trade‑offs such as the inverse relationship between efficiency and engine/weight, and provides context for shifts across the oil‑crisis era.
      </p>
      <p>
        The stack uses a Fastify API to clean and serve data, a React SPA with Zustand for elegant state, Tailwind for styling velocity, Chart.js for the primary scatter plot, and Framer Motion for a data‑driven interaction on the vehicle detail page.
      </p>
    </div>
  );
}