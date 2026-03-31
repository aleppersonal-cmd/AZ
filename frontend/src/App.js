import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { Toaster } from './components/ui/sonner';

// Layout
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';

// Public Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ServicePage from './pages/ServicePage';
import OnlineServicePage from './pages/OnlineServicePage';
import ClientsPage from './pages/ClientsPage';
import ContactPage from './pages/ContactPage';
import PolicyPage from './pages/PolicyPage';

// Admin Pages
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

const PublicLayout = ({ children }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
    <CookieBanner />
  </>
);

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <SiteProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/profilo/:slug" element={<PublicLayout><ProfilePage /></PublicLayout>} />
              <Route path="/servizi/:slug" element={<PublicLayout><ServicePage /></PublicLayout>} />
              <Route path="/servizi-online/:slug" element={<PublicLayout><OnlineServicePage /></PublicLayout>} />
              <Route path="/clienti" element={<PublicLayout><ClientsPage /></PublicLayout>} />
              <Route path="/contatti" element={<PublicLayout><ContactPage /></PublicLayout>} />
              <Route path="/privacy-policy" element={<PublicLayout><PolicyPage /></PublicLayout>} />
              <Route path="/cookie-policy" element={<PublicLayout><PolicyPage /></PublicLayout>} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </SiteProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
