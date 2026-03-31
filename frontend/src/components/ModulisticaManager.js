import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  FileText, Plus, Trash2, Edit, Save, FolderOpen, Tag, 
  Eye, EyeOff, GripVertical, RefreshCw, File, Download
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ModulisticaManager = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [categories, setCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New document form
  const [newDoc, setNewDoc] = useState({
    title: '',
    description: '',
    category_id: '',
    media_id: '',
    published: true,
    order: 0
  });
  
  // New category form
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    order: 0
  });
  
  // Edit states
  const [editingDoc, setEditingDoc] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/modulistica-categories`, { withCredentials: true });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/modulistica`, { withCredentials: true });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  }, []);

  const fetchMediaFiles = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/media?file_type=PDF`, { withCredentials: true });
      setMediaFiles(response.data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
    fetchMediaFiles();
  }, [fetchCategories, fetchDocuments, fetchMediaFiles]);

  // Category CRUD
  const createCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      await axios.post(`${API_URL}/api/cms/modulistica-categories`, newCategory, { withCredentials: true });
      setNewCategory({ name: '', description: '', order: 0 });
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nella creazione');
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;
    try {
      await axios.put(`${API_URL}/api/cms/modulistica-categories/${editingCategory.id}`, {
        name: editingCategory.name,
        description: editingCategory.description,
        order: editingCategory.order
      }, { withCredentials: true });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nell\'aggiornamento');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Eliminare questa categoria?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/modulistica-categories/${id}`, { withCredentials: true });
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nell\'eliminazione');
    }
  };

  // Document CRUD
  const createDocument = async () => {
    if (!newDoc.title.trim() || !newDoc.category_id || !newDoc.media_id) {
      alert('Compila tutti i campi obbligatori');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/cms/modulistica`, newDoc, { withCredentials: true });
      setNewDoc({ title: '', description: '', category_id: '', media_id: '', published: true, order: 0 });
      fetchDocuments();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nella creazione');
    }
  };

  const updateDocument = async () => {
    if (!editingDoc) return;
    try {
      await axios.put(`${API_URL}/api/cms/modulistica/${editingDoc.id}`, {
        title: editingDoc.title,
        description: editingDoc.description,
        category_id: editingDoc.category_id,
        media_id: editingDoc.media_id,
        published: editingDoc.published,
        order: editingDoc.order
      }, { withCredentials: true });
      setEditingDoc(null);
      fetchDocuments();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nell\'aggiornamento');
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm('Eliminare questo documento?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/modulistica/${id}`, { withCredentials: true });
      fetchDocuments();
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
    <div className="space-y-6" data-testid="modulistica-manager">
      <div className="flex justify-between items-center">
        <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Gestione Modulistica</h2>
        <Button variant="outline" size="sm" onClick={() => { fetchCategories(); fetchDocuments(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Documenti
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white">
            <Tag className="w-4 h-4 mr-2" />
            Categorie
          </TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          {/* Add Document Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nuovo Modulo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Label>Titolo *</Label>
                  <Input 
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                    placeholder="Es. Dichiarazione IMU 2024"
                    data-testid="modulistica-title-input"
                  />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Select value={newDoc.category_id} onValueChange={(v) => setNewDoc({...newDoc, category_id: v})}>
                    <SelectTrigger data-testid="modulistica-category-select">
                      <SelectValue placeholder="Seleziona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>File *</Label>
                  <Select value={newDoc.media_id} onValueChange={(v) => setNewDoc({...newDoc, media_id: v})}>
                    <SelectTrigger data-testid="modulistica-file-select">
                      <SelectValue placeholder="Seleziona file..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaFiles.map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          {file.filename} ({file.file_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-2">
                  <Label>Descrizione</Label>
                  <Input 
                    value={newDoc.description}
                    onChange={(e) => setNewDoc({...newDoc, description: e.target.value})}
                    placeholder="Breve descrizione del modulo"
                  />
                </div>
                <div>
                  <Label>Ordine</Label>
                  <Input 
                    type="number"
                    value={newDoc.order}
                    onChange={(e) => setNewDoc({...newDoc, order: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={createDocument} className="bg-[#1E88E5] hover:bg-[#1565C0] w-full" data-testid="add-modulistica-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <div className="space-y-4">
            {documents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nessun documento presente</p>
                </CardContent>
              </Card>
            ) : (
              documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-[#1E88E5]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 truncate">{doc.title}</h3>
                        <Badge variant={doc.published ? "default" : "secondary"}>
                          {doc.published ? 'Pubblicato' : 'Bozza'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 truncate">
                        {doc.category?.name} • {doc.media?.filename}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-slate-400 truncate mt-1">{doc.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.media && (
                        <a href={`${API_URL}${doc.media.url}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingDoc({...doc})}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifica Documento</DialogTitle>
                          </DialogHeader>
                          {editingDoc && (
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>Titolo</Label>
                                <Input 
                                  value={editingDoc.title}
                                  onChange={(e) => setEditingDoc({...editingDoc, title: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label>Descrizione</Label>
                                <Textarea 
                                  value={editingDoc.description || ''}
                                  onChange={(e) => setEditingDoc({...editingDoc, description: e.target.value})}
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label>Categoria</Label>
                                <Select value={editingDoc.category_id} onValueChange={(v) => setEditingDoc({...editingDoc, category_id: v})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((cat) => (
                                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>File</Label>
                                <Select value={editingDoc.media_id} onValueChange={(v) => setEditingDoc({...editingDoc, media_id: v})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mediaFiles.map((file) => (
                                      <SelectItem key={file.id} value={file.id}>
                                        {file.filename}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Ordine</Label>
                                  <Input 
                                    type="number"
                                    value={editingDoc.order}
                                    onChange={(e) => setEditingDoc({...editingDoc, order: parseInt(e.target.value) || 0})}
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                  <Switch 
                                    checked={editingDoc.published}
                                    onCheckedChange={(checked) => setEditingDoc({...editingDoc, published: checked})}
                                  />
                                  <Label>Pubblicato</Label>
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annulla</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={updateDocument} className="bg-[#1E88E5] hover:bg-[#1565C0]">
                                Salva
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => deleteDocument(doc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {/* Add Category Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nuova Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label>Nome *</Label>
                  <Input 
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="Es. IMU"
                    data-testid="category-name-input"
                  />
                </div>
                <div>
                  <Label>Ordine</Label>
                  <Input 
                    type="number"
                    value={newCategory.order}
                    onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={createCategory} className="bg-[#1E88E5] hover:bg-[#1565C0] w-full" data-testid="add-category-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories List */}
          <div className="space-y-4">
            {categories.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nessuna categoria presente</p>
                </CardContent>
              </Card>
            ) : (
              categories.map((cat) => (
                <Card key={cat.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#EFF6FF] rounded-lg flex items-center justify-center">
                        <Tag className="w-5 h-5 text-[#1E88E5]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{cat.name}</h3>
                        <p className="text-sm text-slate-500">Ordine: {cat.order}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingCategory({...cat})}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifica Categoria</DialogTitle>
                          </DialogHeader>
                          {editingCategory && (
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>Nome</Label>
                                <Input 
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                />
                              </div>
                              <div>
                                <Label>Descrizione</Label>
                                <Textarea 
                                  value={editingCategory.description || ''}
                                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                                  rows={2}
                                />
                              </div>
                              <div>
                                <Label>Ordine</Label>
                                <Input 
                                  type="number"
                                  value={editingCategory.order}
                                  onChange={(e) => setEditingCategory({...editingCategory, order: parseInt(e.target.value) || 0})}
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Annulla</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={updateCategory} className="bg-[#1E88E5] hover:bg-[#1565C0]">
                                Salva
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => deleteCategory(cat.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModulisticaManager;
