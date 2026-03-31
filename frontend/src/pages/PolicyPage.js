import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PolicyPage = () => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get slug from current path
  const path = window.location.pathname;
  const slug = path.includes('cookie') ? 'cookie-policy' : 'privacy-policy';
  const title = slug === 'privacy-policy' ? 'Privacy Policy' : 'Cookie Policy';

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/public/pages/${slug}`);
        setPage(response.data);
        setError(null);
      } catch (err) {
        setError('Pagina non trovata');
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

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

  return (
    <div className="min-h-screen pt-[108px]" data-testid="policy-page">
      {/* Hero */}
      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1E88E5]">Home</Link>
            <span>/</span>
            <span className="text-slate-900">{title}</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-slate-900">
            {page?.title || title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="rich-content prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: page?.content }}
          />
        </div>
      </section>
    </div>
  );
};

export default PolicyPage;
