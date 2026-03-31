import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSite } from '../context/SiteContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, ExternalLink, Landmark, Users, CreditCard, Briefcase, 
  FileText, Download, Search, Filter, X
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const iconMap = {
  Landmark, Users, CreditCard, Briefcase
};

const getIcon = (iconName) => {
  return iconMap[iconName] || Landmark;
};

const getFileIcon = (fileType) => {
  const type = (fileType || '').toLowerCase();
  if (type === 'pdf') return 'text-red-500';
  if (['doc', 'docx'].includes(type)) return 'text-blue-500';
  if (['xls', 'xlsx'].includes(type)) return 'text-green-500';
  return 'text-slate-400';
};

const OnlineServicePage = () => {
  const { slug } = useParams();
  const { onlineServices } = useSite();
  const [loading, setLoading] = useState(true);

  const service = onlineServices.find(s => s.slug === slug);
  const IconComponent = service ? getIcon(service.icon) : Landmark;

  useEffect(() => {
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-[108px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen pt-[108px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['Outfit'] text-2xl font-semibold text-slate-900 mb-4">Servizio non trovato</h1>
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

  // Show modulistica section for Portale Contribuenti
  if (slug === 'portale-contribuenti') {
    return <ModulisticaPage service={service} IconComponent={IconComponent} />;
  }

  return (
    <div className="min-h-screen pt-[108px]" data-testid="online-service-page">
      {/* Hero */}
      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1E88E5]">Home</Link>
            <span>/</span>
            <span>Servizi Online</span>
            <span>/</span>
            <span className="text-slate-900">{service.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1E88E5] rounded-2xl flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-slate-900">
              {service.name}
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
                <h3 className="font-['Outfit'] font-semibold text-slate-900 mb-4">Servizi Online</h3>
                <nav className="space-y-1">
                  {onlineServices.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/servizi-online/${s.slug}`}
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
              <div className="prose prose-slate max-w-none mb-12">
                <p className="text-lg text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {service.url && (
                <Button 
                  asChild
                  size="lg"
                  className="bg-[#1E88E5] hover:bg-[#1565C0] text-white mb-12"
                >
                  <a href={service.url} target="_blank" rel="noopener noreferrer">
                    Accedi al portale
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

// Modulistica Page Component
const ModulisticaPage = ({ service, IconComponent }) => {
  const { onlineServices } = useSite();
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [sortBy, setSortBy] = useState('order');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, catsRes] = await Promise.all([
          axios.get(`${API_URL}/api/public/modulistica`),
          axios.get(`${API_URL}/api/public/modulistica-categories`)
        ]);
        setDocuments(docsRes.data);
        setCategories(catsRes.data);
      } catch (error) {
        console.error('Error fetching modulistica:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (selectedCategory && doc.category?.slug !== selectedCategory) return false;
    if (selectedFileType && doc.media?.file_type?.toUpperCase() !== selectedFileType) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        doc.title?.toLowerCase().includes(search) ||
        doc.description?.toLowerCase().includes(search) ||
        doc.category?.name?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'date') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'category') {
      return (a.category?.order || 0) - (b.category?.order || 0);
    }
    return (a.category?.order || 0) - (b.category?.order || 0) || (a.order || 0) - (b.order || 0);
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedFileType('');
    setSortBy('order');
  };

  const hasFilters = searchTerm || selectedCategory || selectedFileType;

  return (
    <div className="min-h-screen pt-[108px]" data-testid="modulistica-page">
      {/* Hero */}
      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link to="/" className="hover:text-[#1E88E5]">Home</Link>
            <span>/</span>
            <span>Servizi Online</span>
            <span>/</span>
            <span className="text-slate-900">{service.name}</span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#1E88E5] rounded-2xl flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-semibold text-slate-900">
                {service.name}
              </h1>
              <p className="text-slate-600 mt-2">{service.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modulistica Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                <div>
                  <h3 className="font-['Outfit'] font-semibold text-slate-900 mb-4">Servizi Online</h3>
                  <nav className="space-y-1">
                    {onlineServices.map((s) => (
                      <Link
                        key={s.slug}
                        to={`/servizi-online/${s.slug}`}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                          s.slug === 'portale-contribuenti'
                            ? 'bg-[#EFF6FF] text-[#1E88E5] font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {s.name}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Categories Filter */}
                <div>
                  <h3 className="font-['Outfit'] font-semibold text-slate-900 mb-4">Categorie</h3>
                  <nav className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? 'bg-[#EFF6FF] text-[#1E88E5] font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      Tutte ({documents.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.slug
                            ? 'bg-[#EFF6FF] text-[#1E88E5] font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {cat.name} ({cat.document_count || 0})
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900 mb-6">
                  Modulistica Scaricabile
                </h2>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Cerca moduli..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="modulistica-search"
                    />
                  </div>
                  <Select value={selectedFileType || "all"} onValueChange={(v) => setSelectedFileType(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tipo file" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="DOC">DOC</SelectItem>
                      <SelectItem value="DOCX">DOCX</SelectItem>
                      <SelectItem value="XLS">XLS</SelectItem>
                      <SelectItem value="XLSX">XLSX</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Ordina per" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Predefinito</SelectItem>
                      <SelectItem value="name">Nome</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="category">Categoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters */}
                {hasFilters && (
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-sm text-slate-500">Filtri attivi:</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="gap-1">
                        "{searchTerm}"
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                      </Badge>
                    )}
                    {selectedCategory && (
                      <Badge variant="secondary" className="gap-1">
                        {categories.find(c => c.slug === selectedCategory)?.name}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
                      </Badge>
                    )}
                    {selectedFileType && (
                      <Badge variant="secondary" className="gap-1">
                        {selectedFileType}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFileType('')} />
                      </Badge>
                    )}
                    <button onClick={clearFilters} className="text-sm text-[#1E88E5] hover:underline">
                      Cancella tutti
                    </button>
                  </div>
                )}
              </div>

              {/* Documents List */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
                </div>
              ) : sortedDocuments.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-['Outfit'] font-semibold text-slate-900 mb-2">
                    {hasFilters ? 'Nessun risultato' : 'Nessun modulo disponibile'}
                  </h3>
                  <p className="text-slate-500">
                    {hasFilters 
                      ? 'Prova a modificare i filtri di ricerca' 
                      : 'La modulistica sarà disponibile a breve'}
                  </p>
                  {hasFilters && (
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                      Cancella filtri
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4" data-testid="modulistica-list">
                  {sortedDocuments.map((doc) => (
                    <Card key={doc.id} className="hover:border-[#1E88E5] transition-colors">
                      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-14 h-14 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className={`w-7 h-7 ${getFileIcon(doc.media?.file_type)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-900">{doc.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {doc.category?.name}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {doc.media?.file_type}
                            </Badge>
                          </div>
                          {doc.description && (
                            <p className="text-sm text-slate-500 line-clamp-2">{doc.description}</p>
                          )}
                        </div>
                        <a 
                          href={`${API_URL}${doc.media?.download_url || doc.media?.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                          data-testid={`download-${doc.id}`}
                        >
                          <Button className="bg-[#1E88E5] hover:bg-[#1565C0] text-white gap-2">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Scarica</span>
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Results count */}
              {!loading && sortedDocuments.length > 0 && (
                <p className="text-sm text-slate-500 mt-6">
                  {sortedDocuments.length} {sortedDocuments.length === 1 ? 'modulo trovato' : 'moduli trovati'}
                </p>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OnlineServicePage;
