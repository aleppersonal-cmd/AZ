import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import axios from 'axios';
import { 
  LogOut, Settings, FileText, Users, Landmark, Briefcase, 
  MessageSquare, Upload, Plus, Trash2, Edit, Save, Eye, EyeOff,
  Building2, Globe, Mail, Phone, Clock, MapPin, Image as ImageIcon,
  Download, RefreshCw, FolderOpen, Tag
} from 'lucide-react';
import MediaManager from '../components/MediaManager';
import ModulisticaManager from '../components/ModulisticaManager';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPage = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-page">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1E88E5] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm font-['Outfit']">AZ</span>
              </div>
              <span className="font-['Outfit'] font-semibold text-slate-900">CMS Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">
                {user.name} ({user.role})
              </span>
              <Button variant="ghost" size="sm" onClick={logout} data-testid="logout-btn">
                <LogOut className="w-4 h-4 mr-2" />
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 flex-wrap h-auto gap-2 bg-white p-2 rounded-xl">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Impostazioni
            </TabsTrigger>
            <TabsTrigger value="pages" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Pagine
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              Servizi
            </TabsTrigger>
            <TabsTrigger value="municipalities" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <Landmark className="w-4 h-4 mr-2" />
              Comuni
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <FolderOpen className="w-4 h-4 mr-2" />
              Media Manager
            </TabsTrigger>
            <TabsTrigger value="modulistica" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <Tag className="w-4 h-4 mr-2" />
              Modulistica
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />
              Documenti
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messaggi
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
              <Briefcase className="w-4 h-4 mr-2" />
              Candidature
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="users" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Utenti
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="pages">
            <PagesTab />
          </TabsContent>
          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>
          <TabsContent value="municipalities">
            <MunicipalitiesTab />
          </TabsContent>
          <TabsContent value="media">
            <MediaManager />
          </TabsContent>
          <TabsContent value="modulistica">
            <ModulisticaManager />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTab />
          </TabsContent>
          <TabsContent value="messages">
            <MessagesTab />
          </TabsContent>
          <TabsContent value="applications">
            <ApplicationsTab />
          </TabsContent>
          {user.role === 'admin' && (
            <TabsContent value="users">
              <UsersTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

// Dashboard Tab
const DashboardTab = () => {
  const [stats, setStats] = useState({
    services: 0,
    municipalities: 0,
    messages: 0,
    applications: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [services, municipalities, messages, applications] = await Promise.all([
          axios.get(`${API_URL}/api/cms/services`, { withCredentials: true }),
          axios.get(`${API_URL}/api/cms/municipalities`, { withCredentials: true }),
          axios.get(`${API_URL}/api/cms/contact-messages`, { withCredentials: true }),
          axios.get(`${API_URL}/api/cms/job-applications`, { withCredentials: true })
        ]);
        setStats({
          services: services.data.length,
          municipalities: municipalities.data.length,
          messages: messages.data.length,
          applications: applications.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#1E88E5]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stats.services}</p>
                <p className="text-sm text-slate-500">Servizi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-[#1E88E5]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stats.municipalities}</p>
                <p className="text-sm text-slate-500">Comuni</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#1E88E5]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stats.messages}</p>
                <p className="text-sm text-slate-500">Messaggi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#1E88E5]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{stats.applications}</p>
                <p className="text-sm text-slate-500">Candidature</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Settings Tab
const SettingsTab = () => {
  const [settings, setSettings] = useState({
    company_name: '',
    logo_url: '',
    address: '',
    phone: '',
    email: '',
    pec: '',
    working_hours: '',
    hero_title: '',
    hero_subtitle: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/cms/settings`, { withCredentials: true });
        if (response.data) {
          setSettings(prev => ({ ...prev, ...response.data }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/cms/settings`, settings, { withCredentials: true });
      alert('Impostazioni salvate con successo!');
    } catch (error) {
      alert('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Impostazioni Sito</h2>
        <Button onClick={handleSave} disabled={saving} className="bg-[#1E88E5] hover:bg-[#1565C0]" data-testid="save-settings-btn">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Salva
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informazioni Aziendali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome Azienda</Label>
              <Input 
                value={settings.company_name} 
                onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                data-testid="company-name-input"
              />
            </div>
            <div>
              <Label>URL Logo</Label>
              <Input 
                value={settings.logo_url} 
                onChange={(e) => setSettings({...settings, logo_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Indirizzo</Label>
              <Input 
                value={settings.address} 
                onChange={(e) => setSettings({...settings, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefono</Label>
                <Input 
                  value={settings.phone} 
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  value={settings.email} 
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PEC</Label>
                <Input 
                  value={settings.pec} 
                  onChange={(e) => setSettings({...settings, pec: e.target.value})}
                />
              </div>
              <div>
                <Label>Orari</Label>
                <Input 
                  value={settings.working_hours} 
                  onChange={(e) => setSettings({...settings, working_hours: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titolo Hero</Label>
              <Input 
                value={settings.hero_title} 
                onChange={(e) => setSettings({...settings, hero_title: e.target.value})}
              />
            </div>
            <div>
              <Label>Sottotitolo Hero</Label>
              <Textarea 
                value={settings.hero_subtitle} 
                onChange={(e) => setSettings({...settings, hero_subtitle: e.target.value})}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Pages Tab
const PagesTab = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPage, setEditPage] = useState(null);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/pages`, { withCredentials: true });
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSavePage = async () => {
    try {
      await axios.put(`${API_URL}/api/cms/pages/${editPage.slug}`, {
        title: editPage.title,
        content: editPage.content,
        meta_title: editPage.meta_title,
        meta_description: editPage.meta_description,
        published: editPage.published
      }, { withCredentials: true });
      setEditPage(null);
      fetchPages();
    } catch (error) {
      alert('Errore nel salvataggio');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Gestione Pagine</h2>
      
      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.slug}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">{page.title}</h3>
                <p className="text-sm text-slate-500">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={page.published ? "default" : "secondary"}>
                  {page.published ? 'Pubblicata' : 'Bozza'}
                </Badge>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setEditPage(page)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Modifica Pagina: {editPage?.title}</DialogTitle>
                    </DialogHeader>
                    {editPage && (
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Titolo</Label>
                          <Input 
                            value={editPage.title} 
                            onChange={(e) => setEditPage({...editPage, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Contenuto (HTML)</Label>
                          <Textarea 
                            value={editPage.content} 
                            onChange={(e) => setEditPage({...editPage, content: e.target.value})}
                            rows={10}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label>Meta Title (SEO)</Label>
                          <Input 
                            value={editPage.meta_title || ''} 
                            onChange={(e) => setEditPage({...editPage, meta_title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Meta Description (SEO)</Label>
                          <Textarea 
                            value={editPage.meta_description || ''} 
                            onChange={(e) => setEditPage({...editPage, meta_description: e.target.value})}
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={editPage.published}
                            onCheckedChange={(checked) => setEditPage({...editPage, published: checked})}
                          />
                          <Label>Pubblicata</Label>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annulla</Button>
                      </DialogClose>
                      <Button onClick={handleSavePage} className="bg-[#1E88E5] hover:bg-[#1565C0]">
                        Salva
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Services Tab
const ServicesTab = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editService, setEditService] = useState(null);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/services`, { withCredentials: true });
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSaveService = async () => {
    try {
      await axios.put(`${API_URL}/api/cms/services/${editService.slug}`, {
        name: editService.name,
        description: editService.description,
        icon: editService.icon,
        order: editService.order,
        published: editService.published
      }, { withCredentials: true });
      setEditService(null);
      fetchServices();
    } catch (error) {
      alert('Errore nel salvataggio');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Gestione Servizi</h2>
      
      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.slug}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">{service.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-1">{service.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={service.published ? "default" : "secondary"}>
                  {service.published ? 'Attivo' : 'Nascosto'}
                </Badge>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setEditService(service)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Modifica Servizio: {editService?.name}</DialogTitle>
                    </DialogHeader>
                    {editService && (
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Nome</Label>
                          <Input 
                            value={editService.name} 
                            onChange={(e) => setEditService({...editService, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Descrizione</Label>
                          <Textarea 
                            value={editService.description} 
                            onChange={(e) => setEditService({...editService, description: e.target.value})}
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Icona (Lucide)</Label>
                            <Input 
                              value={editService.icon} 
                              onChange={(e) => setEditService({...editService, icon: e.target.value})}
                              placeholder="Building2, Car, etc."
                            />
                          </div>
                          <div>
                            <Label>Ordine</Label>
                            <Input 
                              type="number"
                              value={editService.order} 
                              onChange={(e) => setEditService({...editService, order: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={editService.published}
                            onCheckedChange={(checked) => setEditService({...editService, published: checked})}
                          />
                          <Label>Pubblicato</Label>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Annulla</Button>
                      </DialogClose>
                      <Button onClick={handleSaveService} className="bg-[#1E88E5] hover:bg-[#1565C0]">
                        Salva
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Municipalities Tab
const MunicipalitiesTab = () => {
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMunicipality, setNewMunicipality] = useState({ name: '', logo_url: '', description: '' });

  const fetchMunicipalities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/municipalities`, { withCredentials: true });
      setMunicipalities(response.data);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMunicipalities();
  }, []);

  const handleAdd = async () => {
    if (!newMunicipality.name) return;
    try {
      await axios.post(`${API_URL}/api/cms/municipalities`, newMunicipality, { withCredentials: true });
      setNewMunicipality({ name: '', logo_url: '', description: '' });
      fetchMunicipalities();
    } catch (error) {
      alert('Errore nell\'aggiunta');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questo comune?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/municipalities/${id}`, { withCredentials: true });
      fetchMunicipalities();
    } catch (error) {
      alert('Errore nell\'eliminazione');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Gestione Comuni</h2>
      
      {/* Add new */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aggiungi Comune</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input 
              placeholder="Nome Comune" 
              value={newMunicipality.name}
              onChange={(e) => setNewMunicipality({...newMunicipality, name: e.target.value})}
              data-testid="municipality-name-input"
            />
            <Input 
              placeholder="URL Logo" 
              value={newMunicipality.logo_url}
              onChange={(e) => setNewMunicipality({...newMunicipality, logo_url: e.target.value})}
            />
            <Input 
              placeholder="Descrizione (opz.)" 
              value={newMunicipality.description}
              onChange={(e) => setNewMunicipality({...newMunicipality, description: e.target.value})}
            />
            <Button onClick={handleAdd} className="bg-[#1E88E5] hover:bg-[#1565C0]" data-testid="add-municipality-btn">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid gap-4">
        {municipalities.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {m.logo_url ? (
                  <img src={m.logo_url} alt={m.name} className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-slate-900">{m.name}</h3>
                  {m.description && <p className="text-sm text-slate-500">{m.description}</p>}
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Documents Tab
const DocumentsTab = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDoc, setNewDoc] = useState({ name: '', category: 'modulistica', file_url: '', file_type: 'PDF', description: '' });

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/documents`, { withCredentials: true });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAdd = async () => {
    if (!newDoc.name || !newDoc.file_url) return;
    try {
      await axios.post(`${API_URL}/api/cms/documents`, newDoc, { withCredentials: true });
      setNewDoc({ name: '', category: 'modulistica', file_url: '', file_type: 'PDF', description: '' });
      fetchDocuments();
    } catch (error) {
      alert('Errore nell\'aggiunta');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questo documento?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/documents/${id}`, { withCredentials: true });
      fetchDocuments();
    } catch (error) {
      alert('Errore nell\'eliminazione');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Gestione Documenti</h2>
      
      {/* Add new */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aggiungi Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input 
              placeholder="Nome Documento" 
              value={newDoc.name}
              onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
            />
            <Input 
              placeholder="Categoria" 
              value={newDoc.category}
              onChange={(e) => setNewDoc({...newDoc, category: e.target.value})}
            />
            <Input 
              placeholder="URL File" 
              value={newDoc.file_url}
              onChange={(e) => setNewDoc({...newDoc, file_url: e.target.value})}
            />
            <Input 
              placeholder="Tipo (PDF, DOC...)" 
              value={newDoc.file_type}
              onChange={(e) => setNewDoc({...newDoc, file_type: e.target.value})}
            />
            <Button onClick={handleAdd} className="bg-[#1E88E5] hover:bg-[#1565C0]">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EFF6FF] rounded flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#1E88E5]" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{doc.name}</h3>
                  <p className="text-sm text-slate-500">{doc.category} • {doc.file_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Messages Tab
const MessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/contact-messages`, { withCredentials: true });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questo messaggio?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/contact-messages/${id}`, { withCredentials: true });
      fetchMessages();
    } catch (error) {
      alert('Errore nell\'eliminazione');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Messaggi Ricevuti</h2>
      
      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nessun messaggio ricevuto</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-slate-900">{msg.subject}</h3>
                    <p className="text-sm text-slate-500">
                      Da: {msg.name} ({msg.email}) • {new Date(msg.created_at).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(msg.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-slate-600 whitespace-pre-wrap">{msg.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Applications Tab
const ApplicationsTab = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/job-applications`, { withCredentials: true });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questa candidatura?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/job-applications/${id}`, { withCredentials: true });
      fetchApplications();
    } catch (error) {
      alert('Errore nell\'eliminazione');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Candidature Ricevute</h2>
      
      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nessuna candidatura ricevuta</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-slate-900">{app.name} {app.surname}</h3>
                    <p className="text-sm text-slate-500">
                      {app.email} • {app.phone} • {new Date(app.created_at).toLocaleString('it-IT')}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(app.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {app.message && <p className="text-slate-600 mb-4">{app.message}</p>}
                <div className="flex items-center gap-2 text-sm text-[#1E88E5]">
                  <FileText className="w-4 h-4" />
                  <span>CV: {app.cv_filename}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Users Tab
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'editor' });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/users`, { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) return;
    try {
      await axios.post(`${API_URL}/api/cms/users`, newUser, { withCredentials: true });
      setNewUser({ name: '', email: '', password: '', role: 'editor' });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nell\'aggiunta');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminare questo utente?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/users/${id}`, { withCredentials: true });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nell\'eliminazione');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Gestione Utenti CMS</h2>
      
      {/* Add new */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aggiungi Utente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input 
              placeholder="Nome" 
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
            <Input 
              type="email"
              placeholder="Email" 
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
            <Input 
              type="password"
              placeholder="Password" 
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            />
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <Button onClick={handleAdd} className="bg-[#1E88E5] hover:bg-[#1565C0]">
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid gap-4">
        {users.map((u) => (
          <Card key={u._id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#1E88E5]" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{u.name}</h3>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                  {u.role}
                </Badge>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(u._id)} disabled={u.role === 'admin'}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
