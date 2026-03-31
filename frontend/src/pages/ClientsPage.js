import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { Landmark } from 'lucide-react';

const ClientsPage = () => {
  const { municipalities, loading } = useSite();

  if (loading) {
    return (
      <div className="min-h-screen pt-[108px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[108px]" data-testid="clients-page">
      {/* Hero */}
      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1E88E5]">Home</Link>
            <span>/</span>
            <span className="text-slate-900">Clienti AZ</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-slate-900 mb-4">
            Comuni gestiti da AZ Riscossione
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Collaboriamo con numerosi enti locali per la gestione efficiente delle entrate tributarie
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {municipalities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {municipalities.map((municipality, index) => (
                <div 
                  key={municipality.id} 
                  className={`bg-white rounded-xl p-6 border border-slate-200 hover:border-[#1E88E5] hover:shadow-lg transition-all text-center az-fade-in-up az-stagger-${Math.min(index % 6 + 1, 6)}`}
                  data-testid={`client-${municipality.id}`}
                >
                  {municipality.logo_url ? (
                    <img 
                      src={municipality.logo_url} 
                      alt={municipality.name}
                      className="w-24 h-24 object-contain mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Landmark className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <h3 className="font-['Outfit'] font-medium text-slate-900 mb-2">
                    {municipality.name}
                  </h3>
                  {municipality.description && (
                    <p className="text-sm text-slate-500">{municipality.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Landmark className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900 mb-4">
                Nessun comune presente
              </h2>
              <p className="text-slate-600 max-w-md mx-auto">
                I comuni convenzionati verranno aggiunti a breve. Torna a visitarci!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ClientsPage;
