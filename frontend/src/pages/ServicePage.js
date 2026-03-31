import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSite } from '../context/SiteContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  ArrowLeft, ArrowRight, Building2, Recycle, MapPin, ClipboardList, Home, 
  Lightbulb, Megaphone, Gavel, Construction, Car
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const iconMap = {
  Building2, Recycle, MapPin, ClipboardList, Home, Lightbulb, 
  Megaphone, Gavel, Construction, Car
};

const getIcon = (iconName) => {
  return iconMap[iconName] || Building2;
};

const ServicePage = () => {
  const { slug } = useParams();
  const { services } = useSite();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/public/services/${slug}`);
        setService(response.data);
        setError(null);
      } catch (err) {
        setError('Servizio non trovato');
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  const currentIndex = services.findIndex(s => s.slug === slug);
  const prevService = currentIndex > 0 ? services[currentIndex - 1] : null;
  const nextService = currentIndex < services.length - 1 ? services[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen pt-[108px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-[108px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['Outfit'] text-2xl font-semibold text-slate-900 mb-4">{error}</h1>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Torna alla home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = getIcon(service?.icon);

  return (
    <div className="min-h-screen pt-[108px]" data-testid="service-page">
      {/* Hero */}
      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1E88E5]">Home</Link>
            <span>/</span>
            <span>Servizi</span>
            <span>/</span>
            <span className="text-slate-900">{service?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1E88E5] rounded-2xl flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-slate-900">
              {service?.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-32">
                <h3 className="font-['Outfit'] font-semibold text-slate-900 mb-4">Tutti i Servizi</h3>
                <nav className="space-y-1">
                  {services.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/servizi/${s.slug}`}
                      className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                        slug === s.slug
                          ? 'bg-[#EFF6FF] text-[#1E88E5] font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {s.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  {service?.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-12 pt-8 border-t border-slate-200">
                {prevService ? (
                  <Link to={`/servizi/${prevService.slug}`} className="flex items-center gap-3 text-slate-600 hover:text-[#1E88E5] transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm">{prevService.name}</span>
                  </Link>
                ) : <div />}
                {nextService && (
                  <Link to={`/servizi/${nextService.slug}`} className="flex items-center gap-3 text-slate-600 hover:text-[#1E88E5] transition-colors">
                    <span className="text-sm">{nextService.name}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-semibold text-slate-900 mb-4">
            Hai bisogno di assistenza?
          </h2>
          <p className="text-slate-600 mb-8">
            Contattaci per maggiori informazioni su questo servizio
          </p>
          <Button 
            asChild
            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 h-12"
          >
            <Link to="/contatti">
              Contattaci
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ServicePage;
