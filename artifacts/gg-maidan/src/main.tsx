import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// When deployed separately (e.g. Netlify), point the API client at the remote API server.
// In dev (Replit), VITE_API_URL is unset and calls stay root-relative (/api/...).
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL);
}

createRoot(document.getElementById('root')!).render(<App />);
