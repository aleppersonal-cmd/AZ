import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  ArrowRight, Building2, Recycle, MapPin, ClipboardList, Home, 
  Lightbulb, Megaphone, Gavel, Construction, Car, Landmark, 
  Users, CreditCard, Briefcase, ChevronRight, ExternalLink
} from 'lucide-react';

const iconMap = {
  Building2, Recycle, MapPin, ClipboardList, Home, Lightbulb, 
  Megaphone, Gavel, Construction, Car, Landmark, Users, CreditCard, Briefcase
};

const getIcon = (iconName) => {
  return iconMap[iconName] || Building2;
};

const HomePage = () => {
  const { settings, services, onlineServices, municipalities, loading } = useSite();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
      </div>
    );
  }

  return (
    <div className="pt-[108px]" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center" data-testid="hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://static.prod-images.emergentagent.com/jobs/fbfbcf1c-427c-42d6-8a77-0f42b89c9ef7/images/3af01a3cb5062057badf7c4d957b64fa147ee45c05cc6a08e169b7747b995167.png')` }}
        />
        <div className="absolute inset-0 az-hero-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-6">
              Albo Nazionale Concessionari n°171
            </span>
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              {settings?.hero_title || 'La nostra professionalità al vostro servizio'}
            </h1>
            <p className="text-lg sm:text-xl text-slate-200 leading-relaxed mb-8 max-w-2xl">
              {settings?.hero_subtitle || 'Società autorizzata dal Ministero dell\'Economia e delle Finanze all\'accertamento e alla riscossione dei Tributi Locali.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild
                size="lg"
                className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 h-12"
                data-testid="discover-services-btn"
              >
                <Link to="/servizi/ici-imu">
                  Scopri i servizi
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-slate-900 px-8 h-12"
                data-testid="online-services-btn"
              >
                <Link to="/servizi-online/portale-contribuenti">
                  Accedi ai servizi online
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-28 bg-[#F8FAFC]" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1E88E5] mb-4 block">
              I Nostri Servizi
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
              Gestione completa dei tributi locali
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Offriamo una gamma completa di servizi per la gestione e riscossione dei tributi comunali
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.map((service, index) => {
              const IconComponent = getIcon(service.icon);
              return (
                <Link 
                  key={service.slug} 
                  to={`/servizi/${service.slug}`}
                  className={`az-fade-in-up az-stagger-${Math.min(index + 1, 6)}`}
                  data-testid={`service-card-${service.slug}`}
                >
                  <Card className="az-card h-full bg-white border-slate-200 hover:border-[#1E88E5]">
                    <CardContent className="p-6 text-center">
                      <div className="az-icon-container w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-7 h-7 text-[#1E88E5]" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-['Outfit'] font-medium text-slate-900 mb-2">
                        {service.name}
                      </h3>
                      <span className="text-sm text-[#1E88E5] flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                        Scopri di più
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Online Services Section */}
      <section className="py-20 lg:py-28" data-testid="online-services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1E88E5] mb-4 block">
              Servizi Online
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
              Accedi ai nostri portali
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Consulta la tua posizione, effettua pagamenti e scarica la modulistica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {onlineServices.map((service) => {
              const IconComponent = getIcon(service.icon);
              return (
                <Link 
                  key={service.slug} 
                  to={`/servizi-online/${service.slug}`}
                  data-testid={`online-service-card-${service.slug}`}
                >
                  <Card className="az-card h-full bg-white border-slate-200 hover:border-[#1E88E5] group">
                    <CardContent className="p-8">
                      <div className="az-icon-container w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                        <IconComponent className="w-8 h-8 text-[#1E88E5]" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-['Outfit'] font-semibold text-xl text-slate-900 mb-3">
                        {service.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>
                      <span className="text-[#1E88E5] text-sm font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                        Accedi al portale
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Municipalities Section */}
      <section className="py-20 lg:py-28 bg-[#F8FAFC]" data-testid="municipalities-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1E88E5] mb-4 block">
              I Nostri Clienti
            </span>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold text-slate-900 mb-4">
              Comuni gestiti da AZ Riscossione
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Collaboriamo con numerosi enti locali per la gestione efficiente delle entrate tributarie
            </p>
          </div>

          {municipalities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {municipalities.map((municipality) => (
                <div 
                  key={municipality.id} 
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#1E88E5] hover:shadow-lg transition-all text-center"
                  data-testid={`municipality-${municipality.id}`}
                >
                  {municipality.logo_url ? (
                    <img 
                      src={municipality.logo_url} 
                      alt={municipality.name}
                      className="az-municipality-logo w-20 h-20 object-contain mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Landmark className="w-10 h-10 text-slate-400" />
                    </div>
                  )}
                  <p className="font-medium text-slate-900 text-sm">{municipality.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Landmark className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600">I comuni verranno aggiunti a breve.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              asChild
              variant="outline"
              className="border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white"
              data-testid="view-all-clients-btn"
            >
              <Link to="/clienti">
                Visualizza tutti i clienti
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-slate-900" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-semibold text-white mb-6">
            Hai bisogno di informazioni?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Il nostro team è a disposizione per rispondere a tutte le tue domande sui tributi locali
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 h-12"
              data-testid="contact-cta-btn"
            >
              <Link to="/contatti">
                Contattaci
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 h-12"
            >
              <a href={`tel:${settings?.phone || '0921 600348'}`}>
                Chiama ora
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
