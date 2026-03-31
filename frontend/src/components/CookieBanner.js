import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 cookie-banner-enter" data-testid="cookie-banner">
      <div className="az-cookie-banner mx-4 mb-4 rounded-xl shadow-2xl md:mx-auto md:max-w-4xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-['Outfit'] font-semibold text-white text-lg mb-2">
                Informativa sui Cookie
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Questo sito utilizza cookie tecnici necessari per il corretto funzionamento. 
                Continuando a navigare accetti l'uso dei cookie. Per maggiori informazioni consulta la nostra{' '}
                <Link to="/cookie-policy" className="text-[#1E88E5] hover:underline">
                  Cookie Policy
                </Link>
                {' '}e la{' '}
                <Link to="/privacy-policy" className="text-[#1E88E5] hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </div>
            <button 
              onClick={() => setVisible(false)} 
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              onClick={acceptCookies}
              className="bg-[#1E88E5] hover:bg-[#1565C0] text-white"
              data-testid="accept-cookies-btn"
            >
              Accetta tutti
            </Button>
            <Button 
              onClick={declineCookies}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              data-testid="decline-cookies-btn"
            >
              Solo necessari
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
