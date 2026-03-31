import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import RichTextEditor from './RichTextEditor';
import { 
  Edit, Save, RefreshCw, FileText, Eye, EyeOff, ChevronRight,
  Info, Settings, Search, Plus, Trash2, ExternalLink
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PagesEditor = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });

  // Group pages by category
  const pageGroups = {
    'Profilo': ['chi-siamo', 'az-ricerca-sviluppo', 'az-per-il-sociale', 'az-per-la-qualita', 'az-formazione', 'lavora-con-noi'],
    'Legal': ['privacy-policy', 'cookie-policy'],
    'Altre': []
  };

  const getPageGroup = (slug) => {
    for (const [group, slugs] of Object.entries(pageGroups)) {
      if (slugs.includes(slug)) return group;
    }
    return 'Altre';
  };

  const groupedPages = pages.reduce((acc, page) => {
    const group = getPageGroup(page.slug);
    if (!acc[group]) acc[group] = [];
    acc[group].push(page);
    return acc;
  }, {});

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/pages`, { withCredentials: true });
      setPages(response.data);
      if (!selectedPage && response.data.length > 0) {
        // Select first profile page by default
        const profilePage = response.data.find(p => p.slug === 'chi-siamo') || response.data[0];
        setSelectedPage(profilePage);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      setEditData({
        title: selectedPage.title || '',
        content: selectedPage.content || '',
        published: selectedPage.published !== false,
        meta_title: selectedPage.meta_title || '',
        meta_description: selectedPage.meta_description || ''
      });
    }
  }, [selectedPage]);

  const handleSave = async () => {
    if (!selectedPage || !editData) return;
    
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/cms/pages/${selectedPage.slug}`, editData, { 
        withCredentials: true 
      });
      
      // Update local state
      setPages(pages.map(p => 
        p.slug === selectedPage.slug 
          ? { ...p, ...editData }
          : p
      ));
      setSelectedPage({ ...selectedPage, ...editData });
      setEditMode(false);
      alert('Pagina salvata con successo!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePage = async () => {
    if (!newPage.title.trim() || !newPage.slug.trim()) {
      alert('Compila titolo e slug');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/cms/pages`, {
        title: newPage.title,
        slug: newPage.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        content: '',
        published: false,
        meta_title: newPage.title,
        meta_description: ''
      }, { withCredentials: true });
      
      setShowNewPageDialog(false);
      setNewPage({ title: '', slug: '' });
      fetchPages();
      
      // Select the new page
      setTimeout(() => {
        const createdPage = { ...response.data };
        setSelectedPage(createdPage);
        setEditMode(true);
      }, 500);
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nella creazione');
    }
  };

  const handleDeletePage = async (slug) => {
    // Don't allow deletion of system pages
    const systemPages = ['chi-siamo', 'az-ricerca-sviluppo', 'az-per-il-sociale', 'az-per-la-qualita', 'az-formazione', 'lavora-con-noi', 'privacy-policy', 'cookie-policy'];
    if (systemPages.includes(slug)) {
      alert('Non è possibile eliminare le pagine di sistema');
      return;
    }
    
    if (!window.confirm('Eliminare questa pagina?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/cms/pages/${slug}`, { withCredentials: true });
      if (selectedPage?.slug === slug) {
        setSelectedPage(null);
      }
      fetchPages();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nell\'eliminazione');
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
    <div className="space-y-6" data-testid="pages-editor">
      <div className="flex justify-between items-center">
        <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">
          Editor Pagine Istituzionali
        </h2>
        <div className="flex items-center gap-2">
          <Dialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuova Pagina
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuova Pagina</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Titolo Pagina</Label>
                  <Input
                    value={newPage.title}
                    onChange={(e) => setNewPage({...newPage, title: e.target.value})}
                    placeholder="Es. Certificazioni"
                  />
                </div>
                <div>
                  <Label>Slug URL</Label>
                  <Input
                    value={newPage.slug}
                    onChange={(e) => setNewPage({...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                    placeholder="es-certificazioni"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    URL: /profilo/{newPage.slug || 'slug-pagina'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annulla</Button>
                </DialogClose>
                <Button onClick={handleCreatePage} className="bg-[#1E88E5] hover:bg-[#1565C0]">
                  Crea Pagina
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={fetchPages}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pages Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 uppercase tracking-wider">
              Pagine ({pages.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {Object.entries(groupedPages).map(([group, groupPages]) => (
                  groupPages.length > 0 && (
                    <div key={group}>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                        {group}
                      </h4>
                      <div className="space-y-1">
                        {groupPages.map((page) => (
                          <button
                            key={page.slug}
                            onClick={() => {
                              setSelectedPage(page);
                              setEditMode(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                              selectedPage?.slug === page.slug
                                ? 'bg-[#1E88E5] text-white'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="truncate">{page.title}</span>
                            <div className="flex items-center gap-1">
                              {!page.published && (
                                <EyeOff className={`w-3 h-3 ${selectedPage?.slug === page.slug ? 'text-white/70' : 'text-slate-400'}`} />
                              )}
                              <ChevronRight className={`w-4 h-4 ${selectedPage?.slug === page.slug ? 'text-white' : 'text-slate-400'}`} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Editor Panel */}
        <div className="lg:col-span-3">
          {selectedPage && editData ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">{selectedPage.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-slate-500">/{selectedPage.slug}</p>
                    <a 
                      href={`/profilo/${selectedPage.slug}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#1E88E5] hover:underline text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visualizza
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editMode ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditMode(false);
                          setEditData({
                            title: selectedPage.title || '',
                            content: selectedPage.content || '',
                            published: selectedPage.published !== false,
                            meta_title: selectedPage.meta_title || '',
                            meta_description: selectedPage.meta_description || ''
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
                      <Label>Titolo Pagina</Label>
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        disabled={!editMode}
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
                          placeholder="Scrivi il contenuto della pagina..."
                        />
                      ) : (
                        <div 
                          className="border border-slate-200 rounded-lg p-4 min-h-[300px] service-content bg-slate-50"
                          dangerouslySetInnerHTML={{ __html: editData.content || '<p class="text-slate-400">Nessun contenuto. Clicca "Modifica" per aggiungere contenuto.</p>' }}
                        />
                      )}
                    </div>

                    {/* Quick formatting tips */}
                    {editMode && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Suggerimenti Editor
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Usa <strong>H2</strong> e <strong>H3</strong> per creare sezioni ordinate</li>
                          <li>• Inserisci <strong>immagini</strong> cliccando l'icona immagine nella toolbar</li>
                          <li>• Aggiungi <strong>spaziature</strong> tra le sezioni usando il pulsante griglia</li>
                          <li>• Usa <strong>citazioni</strong> per evidenziare informazioni importanti</li>
                          <li>• Crea <strong>elenchi</strong> per organizzare i contenuti</li>
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Switch
                        checked={editData.published}
                        onCheckedChange={(checked) => setEditData({...editData, published: checked})}
                        disabled={!editMode}
                      />
                      <div>
                        <Label>Stato pubblicazione</Label>
                        <p className="text-xs text-slate-500">
                          {editData.published ? 'La pagina è visibile sul sito' : 'La pagina è nascosta (bozza)'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-900 mb-2">Informazioni Pagina</h4>
                      <div className="text-sm text-amber-800 space-y-1">
                        <p><strong>Slug:</strong> {selectedPage.slug}</p>
                        <p><strong>URL completo:</strong> /profilo/{selectedPage.slug}</p>
                        <p><strong>Creata il:</strong> {new Date(selectedPage.created_at).toLocaleDateString('it-IT')}</p>
                        {selectedPage.updated_at && (
                          <p><strong>Ultima modifica:</strong> {new Date(selectedPage.updated_at).toLocaleDateString('it-IT')}</p>
                        )}
                      </div>
                    </div>

                    {/* Delete button for non-system pages */}
                    {!['chi-siamo', 'az-ricerca-sviluppo', 'az-per-il-sociale', 'az-per-la-qualita', 'az-formazione', 'lavora-con-noi', 'privacy-policy', 'cookie-policy'].includes(selectedPage.slug) && (
                      <div className="border-t pt-4">
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDeletePage(selectedPage.slug)}
                          disabled={!editMode}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Elimina Pagina
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Ottimizzazione SEO
                      </h4>
                      <p className="text-sm text-amber-800">
                        Compila questi campi per migliorare la visibilità della pagina sui motori di ricerca.
                      </p>
                    </div>

                    <div>
                      <Label>Meta Title</Label>
                      <p className="text-xs text-slate-500 mb-1">Titolo che appare nei risultati di Google (max 60 caratteri)</p>
                      <Input
                        value={editData.meta_title}
                        onChange={(e) => setEditData({...editData, meta_title: e.target.value})}
                        disabled={!editMode}
                        placeholder={`${selectedPage.title} | AZ Riscossione`}
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
                        placeholder="Descrivi brevemente questa pagina..."
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
                          {editData.meta_title || `${selectedPage.title} | AZ Riscossione`}
                        </p>
                        <p className="text-green-700 text-sm">
                          azriscossione.it › profilo › {selectedPage.slug}
                        </p>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                          {editData.meta_description || 'Nessuna descrizione disponibile. Aggiungi una meta description per migliorare il posizionamento SEO.'}
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
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">Seleziona una pagina</h3>
                <p className="text-slate-500">Scegli una pagina dalla lista per modificarla</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagesEditor;
