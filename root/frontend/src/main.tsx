import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/scss/index.scss'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
