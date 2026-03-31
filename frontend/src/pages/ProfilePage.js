import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProfilePage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const profilePages = [
    { slug: 'chi-siamo', title: 'Chi Siamo' },
    { slug: 'az-ricerca-sviluppo', title: 'AZ Ricerca e Sviluppo' },
    { slug: 'az-per-il-sociale', title: 'AZ per il Sociale' },
    { slug: 'az-per-la-qualita', title: 'AZ per la Qualità' },
    { slug: 'az-formazione', title: 'AZ Formazione' },
    { slug: 'lavora-con-noi', title: 'Lavora con Noi' },
  ];

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
    <div className="min-h-screen pt-[108px]" data-testid="profile-page">
      {/* Hero */}
      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1E88E5]">Home</Link>
            <span>/</span>
            <span>Profilo</span>
            <span>/</span>
            <span className="text-slate-900">{page?.title}</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-slate-900">
            {page?.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-32">
                <h3 className="font-['Outfit'] font-semibold text-slate-900 mb-4">Profilo</h3>
                <nav className="space-y-1">
                  {profilePages.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/profilo/${p.slug}`}
                      className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                        slug === p.slug
                          ? 'bg-[#EFF6FF] text-[#1E88E5] font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {p.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {slug === 'lavora-con-noi' ? (
                <JobApplicationForm pageContent={page?.content} />
              ) : (
                <div 
                  className="rich-content prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: page?.content }}
                />
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

const JobApplicationForm = ({ pageContent }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    message: '',
    privacy_accepted: false
  });
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setCv(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('surname', formData.surname);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('message', formData.message);
      data.append('privacy_accepted', formData.privacy_accepted);
      data.append('cv', cv);

      await axios.post(`${API_URL}/api/public/job-application`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setFormData({
        name: '',
        surname: '',
        email: '',
        phone: '',
        message: '',
        privacy_accepted: false
      });
      setCv(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore nell\'invio della candidatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="job-application-form">
      {pageContent && (
        <div 
          className="rich-content prose prose-slate max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: pageContent }}
        />
      )}

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-['Outfit'] font-semibold text-xl text-green-900 mb-2">
            Candidatura inviata con successo!
          </h3>
          <p className="text-green-700">
            Grazie per il tuo interesse. Ti contatteremo al più presto.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] transition-colors"
                data-testid="job-name-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cognome *
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] transition-colors"
                data-testid="job-surname-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] transition-colors"
                data-testid="job-email-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Telefono *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] transition-colors"
                data-testid="job-phone-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Messaggio
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] transition-colors resize-none"
              data-testid="job-message-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Curriculum Vitae (PDF/DOC) *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#EFF6FF] file:text-[#1E88E5] hover:file:bg-[#1E88E5] hover:file:text-white"
              data-testid="job-cv-input"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="privacy_accepted"
              checked={formData.privacy_accepted}
              onChange={handleChange}
              required
              className="mt-1 w-4 h-4 text-[#1E88E5] border-slate-300 rounded focus:ring-[#1E88E5]"
              data-testid="job-privacy-checkbox"
            />
            <label className="text-sm text-slate-600">
              Ho letto e accetto la{' '}
              <Link to="/privacy-policy" className="text-[#1E88E5] hover:underline">
                Privacy Policy
              </Link>
              {' '}e autorizzo il trattamento dei miei dati personali. *
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 h-12"
            data-testid="job-submit-btn"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full az-spinner"></div>
                Invio in corso...
              </span>
            ) : (
              <>
                Invia candidatura
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
