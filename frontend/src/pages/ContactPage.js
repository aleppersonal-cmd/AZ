import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSite } from '../context/SiteContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Phone, Mail, MapPin, Clock, Send, ArrowRight } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ContactPage = () => {
  const { settings } = useSite();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacy_accepted: false
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/api/public/contact`, formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        privacy_accepted: false
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore nell\'invio del messaggio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-[108px]" data-testid="contact-page">
      {/* Hero */}
      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1E88E5]">Home</Link>
            <span>/</span>
            <span className="text-slate-900">Contatti</span>
          </div>
          <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-slate-900 mb-4">
            Contattaci
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Siamo a tua disposizione per qualsiasi informazione o chiarimento
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900 mb-6">
                Informazioni di contatto
              </h2>
              
              <div className="space-y-6">
                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-[#1E88E5]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 mb-1">Indirizzo</h3>
                        <p className="text-slate-600 text-sm">
                          {settings?.address || 'Via Imera 4B, Campofelice di Roccella (PA)'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-[#1E88E5]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 mb-1">Telefono</h3>
                        <a 
                          href={`tel:${settings?.phone || '0921 600348'}`}
                          className="text-[#1E88E5] hover:underline text-sm"
                        >
                          {settings?.phone || '0921 600348'}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-[#1E88E5]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 mb-1">Email</h3>
                        <a 
                          href={`mailto:${settings?.email || 'info@azriscossione.it'}`}
                          className="text-[#1E88E5] hover:underline text-sm block"
                        >
                          {settings?.email || 'info@azriscossione.it'}
                        </a>
                        {settings?.pec && (
                          <>
                            <span className="text-xs text-slate-500 mt-2 block">PEC:</span>
                            <a 
                              href={`mailto:${settings.pec}`}
                              className="text-[#1E88E5] hover:underline text-sm"
                            >
                              {settings.pec}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-[#1E88E5]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 mb-1">Orari</h3>
                        <p className="text-slate-600 text-sm">
                          {settings?.working_hours || 'Lunedì - Venerdì: 9:00 - 18:00'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map placeholder */}
              <div className="mt-8">
                <div className="bg-slate-100 rounded-xl h-48 flex items-center justify-center">
                  <iframe
                    title="Mappa"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.0!2d13.8833!3d37.9833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDU5JzAwLjAiTiAxM8KwNTMnMDAuMCJF!5e0!3m2!1sit!2sit!4v1234567890"
                    className="w-full h-full rounded-xl"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900 mb-6">
                Inviaci un messaggio
              </h2>

              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-['Outfit'] font-semibold text-xl text-green-900 mb-2">
                    Messaggio inviato con successo!
                  </h3>
                  <p className="text-green-700 mb-6">
                    Grazie per averci contattato. Ti risponderemo al più presto.
                  </p>
                  <Button
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Invia un altro messaggio
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
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
                        data-testid="contact-name-input"
                      />
                    </div>
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
                        data-testid="contact-email-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Oggetto *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] transition-colors"
                      data-testid="contact-subject-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Messaggio *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] transition-colors resize-none"
                      data-testid="contact-message-input"
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
                      data-testid="contact-privacy-checkbox"
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
                    data-testid="contact-submit-btn"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full az-spinner"></div>
                        Invio in corso...
                      </span>
                    ) : (
                      <>
                        Invia messaggio
                        <Send className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
