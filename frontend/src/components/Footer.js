import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Phone, Mail, MapPin, Clock, ChevronRight } from 'lucide-react';

const Footer = () => {
  const { settings, services } = useSite();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="az-footer text-slate-400" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#1E88E5] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl font-['Outfit']">AZ</span>
              </div>
              <div>
                <span className="font-['Outfit'] font-semibold text-white text-lg block">AZ Riscossione</span>
                <span className="text-xs text-slate-500">Tributi Locali S.r.l.</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Società autorizzata dal Ministero dell'Economia e delle Finanze, iscritta al n°171 dell'albo Nazionale dei Concessionari.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
                <span className="text-sm">{settings?.address || 'Via Imera 4B, Campofelice di Roccella (PA)'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#1E88E5] flex-shrink-0" />
                <a href={`tel:${settings?.phone || '0921 600348'}`} className="text-sm hover:text-white transition-colors">
                  {settings?.phone || '0921 600348'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1E88E5] flex-shrink-0" />
                <a href={`mailto:${settings?.email || 'info@azriscossione.it'}`} className="text-sm hover:text-white transition-colors">
                  {settings?.email || 'info@azriscossione.it'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#1E88E5] flex-shrink-0" />
                <span className="text-sm">{settings?.working_hours || 'Lun - Ven: 9:00 - 18:00'}</span>
              </div>
            </div>
          </div>

          {/* Servizi */}
          <div>
            <h3 className="font-['Outfit'] font-semibold text-white text-lg mb-6">Servizi</h3>
            <ul className="space-y-3">
              {services.slice(0, 6).map((service) => (
                <li key={service.slug}>
                  <Link to={`/servizi/${service.slug}`} className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                    <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link Utili */}
          <div>
            <h3 className="font-['Outfit'] font-semibold text-white text-lg mb-6">Link Utili</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/profilo/chi-siamo" className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                  <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                  Chi Siamo
                </Link>
              </li>
              <li>
                <Link to="/servizi-online/portale-contribuenti" className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                  <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                  Portale Contribuenti
                </Link>
              </li>
              <li>
                <Link to="/servizi-online/portale-pagamenti" className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                  <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                  Pagamento Imposte
                </Link>
              </li>
              <li>
                <Link to="/clienti" className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                  <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                  Comuni Convenzionati
                </Link>
              </li>
              <li>
                <Link to="/profilo/lavora-con-noi" className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                  <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                  Lavora con Noi
                </Link>
              </li>
              <li>
                <Link to="/contatti" className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                  <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                  Contatti
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-['Outfit'] font-semibold text-white text-lg mb-6">Informazioni Legali</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                  <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-sm flex items-center gap-2 hover:text-white transition-colors group">
                  <ChevronRight className="w-4 h-4 text-[#1E88E5] group-hover:translate-x-1 transition-transform" />
                  Cookie Policy
                </Link>
              </li>
            </ul>
            <div className="mt-8">
              <p className="text-sm">PEC:</p>
              <a href={`mailto:${settings?.pec || 'az@pec.azriscossione.it'}`} className="text-sm text-[#1E88E5] hover:text-white transition-colors">
                {settings?.pec || 'az@pec.azriscossione.it'}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} AZ Riscossione Tributi Locali S.r.l. - Tutti i diritti riservati
            </p>
            <p className="text-sm text-slate-500">
              Iscrizione Albo n°171 - Min. Economia e Finanze
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
