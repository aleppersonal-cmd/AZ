import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from './ui/dialog';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import RichTextEditor from './RichTextEditor';
import { 
  Edit, Save, RefreshCw, Building2, Eye, EyeOff, ChevronRight,
  FileText, Info, Settings, Search
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ServicesEditor = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/services`, { withCredentials: true });
      setServices(response.data);
      if (!selectedService && response.data.length > 0) {
        setSelectedService(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      setEditData({
        name: selectedService.name,
        description: selectedService.description || '',
        content: selectedService.content || '',
        icon: selectedService.icon || 'Building2',
        order: selectedService.order || 0,
        published: selectedService.published !== false,
        meta_title: selectedService.meta_title || '',
        meta_description: selectedService.meta_description || ''
      });
    }
  }, [selectedService]);

  const handleSave = async () => {
    if (!selectedService || !editData) return;
    
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/cms/services/${selectedService.slug}`, editData, { 
        withCredentials: true 
      });
      
      // Update local state
      setServices(services.map(s => 
        s.slug === selectedService.slug 
          ? { ...s, ...editData }
          : s
      ));
      setSelectedService({ ...selectedService, ...editData });
      setEditMode(false);
      alert('Servizio salvato con successo!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="services-editor">
      <div className="flex justify-between items-center">
        <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">
          Editor Servizi Avanzato
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchServices}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Services Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 uppercase tracking-wider">
              Servizi ({services.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[600px]">
              <div className="space-y-1">
                {services.map((service) => (
                  <button
                    key={service.slug}
                    onClick={() => {
                      setSelectedService(service);
                      setEditMode(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                      selectedService?.slug === service.slug
                        ? 'bg-[#1E88E5] text-white'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{service.name}</span>
                    <div className="flex items-center gap-1">
                      {!service.published && (
                        <EyeOff className={`w-3 h-3 ${selectedService?.slug === service.slug ? 'text-white/70' : 'text-slate-400'}`} />
                      )}
                      <ChevronRight className={`w-4 h-4 ${selectedService?.slug === service.slug ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor Panel */}
        <div className="lg:col-span-3">
          {selectedService && editData ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">{selectedService.name}</CardTitle>
                  <p className="text-sm text-slate-500">/{selectedService.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  {editMode ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditMode(false);
                          setEditData({
                            name: selectedService.name,
                            description: selectedService.description || '',
                            content: selectedService.content || '',
                            icon: selectedService.icon || 'Building2',
                            order: selectedService.order || 0,
                            published: selectedService.published !== false,
                            meta_title: selectedService.meta_title || '',
                            meta_description: selectedService.meta_description || ''
                          });
                        }}
                      >
                        Annulla
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#1E88E5] hover:bg-[#1565C0]"
                      >
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full az-spinner"></div>
                            Salvataggio...
                          </span>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Salva
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditMode(true)} className="bg-[#1E88E5] hover:bg-[#1565C0]">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifica
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="content" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
                      <FileText className="w-4 h-4 mr-2" />
                      Contenuto
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      Impostazioni
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
                      <Search className="w-4 h-4 mr-2" />
                      SEO
                    </TabsTrigger>
                  </TabsList>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6">
                    <div>
                      <Label>Titolo Servizio</Label>
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        disabled={!editMode}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Descrizione Breve</Label>
                      <p className="text-xs text-slate-500 mb-1">Visualizzata nelle card e anteprime</p>
                      <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                        disabled={!editMode}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Contenuto Pagina</Label>
                      <p className="text-xs text-slate-500 mb-2">
                        Usa l'editor per formattare testo, aggiungere immagini, elenchi, citazioni e molto altro
                      </p>
                      {editMode ? (
                        <RichTextEditor
                          content={editData.content}
                          onChange={(html) => setEditData({...editData, content: html})}
                          placeholder="Scrivi il contenuto del servizio..."
                        />
                      ) : (
                        <div 
                          className="border border-slate-200 rounded-lg p-4 min-h-[300px] service-content bg-slate-50"
                          dangerouslySetInnerHTML={{ __html: editData.content || '<p class="text-slate-400">Nessun contenuto. Clicca "Modifica" per aggiungere contenuto.</p>' }}
                        />
                      )}
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Icona (Lucide)</Label>
                        <Input
                          value={editData.icon}
                          onChange={(e) => setEditData({...editData, icon: e.target.value})}
                          disabled={!editMode}
                          placeholder="Building2, Car, Recycle..."
                          className="mt-1"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Nomi icone: Building2, Recycle, MapPin, ClipboardList, Home, Lightbulb, Megaphone, Gavel, Construction, Car
                        </p>
                      </div>
                      <div>
                        <Label>Ordine</Label>
                        <Input
                          type="number"
                          value={editData.order}
                          onChange={(e) => setEditData({...editData, order: parseInt(e.target.value) || 0})}
                          disabled={!editMode}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Switch
                        checked={editData.published}
                        onCheckedChange={(checked) => setEditData({...editData, published: checked})}
                        disabled={!editMode}
                      />
                      <div>
                        <Label>Stato pubblicazione</Label>
                        <p className="text-xs text-slate-500">
                          {editData.published ? 'Il servizio è visibile sul sito' : 'Il servizio è nascosto'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Ottimizzazione SEO
                      </h4>
                      <p className="text-sm text-amber-800">
                        Compila questi campi per migliorare la visibilità del servizio sui motori di ricerca.
                      </p>
                    </div>

                    <div>
                      <Label>Meta Title</Label>
                      <p className="text-xs text-slate-500 mb-1">Titolo che appare nei risultati di Google (max 60 caratteri)</p>
                      <Input
                        value={editData.meta_title}
                        onChange={(e) => setEditData({...editData, meta_title: e.target.value})}
                        disabled={!editMode}
                        placeholder={`${selectedService.name} | AZ Riscossione`}
                        className="mt-1"
                        maxLength={70}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        {(editData.meta_title || '').length}/60 caratteri
                      </p>
                    </div>

                    <div>
                      <Label>Meta Description</Label>
                      <p className="text-xs text-slate-500 mb-1">Descrizione nei risultati di Google (max 160 caratteri)</p>
                      <Textarea
                        value={editData.meta_description}
                        onChange={(e) => setEditData({...editData, meta_description: e.target.value})}
                        disabled={!editMode}
                        placeholder="Descrivi brevemente questo servizio..."
                        rows={3}
                        className="mt-1"
                        maxLength={170}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        {(editData.meta_description || '').length}/160 caratteri
                      </p>
                    </div>

                    {/* Preview */}
                    <div>
                      <Label>Anteprima Google</Label>
                      <div className="mt-2 p-4 bg-white border rounded-lg">
                        <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">
                          {editData.meta_title || `${selectedService.name} | AZ Riscossione`}
                        </p>
                        <p className="text-green-700 text-sm">
                          azriscossione.it › servizi › {selectedService.slug}
                        </p>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                          {editData.meta_description || editData.description || 'Nessuna descrizione disponibile.'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">Seleziona un servizio</h3>
                <p className="text-slate-500">Scegli un servizio dalla lista per modificarlo</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesEditor;
