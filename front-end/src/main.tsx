
// REMOVED StrictMode to fix infinite reload issue
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { SalesCurrencyProvider } from './contexts/SalesCurrencyContext.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <ThemeProvider>
      <LanguageProvider>
        <SalesCurrencyProvider>
          <App />
        </SalesCurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);
