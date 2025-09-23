import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import App from './App.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <App />
    </QueryParamProvider>
  </BrowserRouter>
);