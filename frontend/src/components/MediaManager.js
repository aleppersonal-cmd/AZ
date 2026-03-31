import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Upload, Folder, FolderPlus, File, FileText, Image, FileSpreadsheet, 
  Archive, Trash2, Edit, Copy, Download, Search, Grid, List, 
  ArrowUp, ArrowDown, RefreshCw, Check, X, ChevronRight, MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getFileIcon = (fileType) => {
  const type = (fileType || '').toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(type)) {
    return <Image className="w-6 h-6 text-green-500" />;
  } else if (['pdf'].includes(type)) {
    return <FileText className="w-6 h-6 text-red-500" />;
  } else if (['doc', 'docx'].includes(type)) {
    return <FileText className="w-6 h-6 text-blue-500" />;
  } else if (['xls', 'xlsx'].includes(type)) {
    return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
  } else if (['zip'].includes(type)) {
    return <Archive className="w-6 h-6 text-yellow-600" />;
  }
  return <File className="w-6 h-6 text-slate-400" />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MediaManager = () => {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchFolders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cms/folders`, { withCredentials: true });
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (currentFolder) params.append('folder_id', currentFolder);
      if (searchTerm) params.append('search', searchTerm);
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      
      const response = await axios.get(`${API_URL}/api/cms/media?${params}`, { withCredentials: true });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [currentFolder, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [fetchFolders, fetchFiles]);

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }
    if (currentFolder) {
      formData.append('folder_id', currentFolder);
    }
    
    try {
      await axios.post(`${API_URL}/api/cms/media/upload-multiple`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      fetchFiles();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore durante il caricamento');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await axios.post(`${API_URL}/api/cms/folders`, {
        name: newFolderName,
        parent_id: currentFolder
      }, { withCredentials: true });
      setNewFolderName('');
      fetchFolders();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nella creazione della cartella');
    }
  };

  const deleteFolder = async (folderId) => {
    if (!window.confirm('Eliminare questa cartella?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/folders/${folderId}`, { withCredentials: true });
      if (currentFolder === folderId) setCurrentFolder(null);
      fetchFolders();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nell\'eliminazione');
    }
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm('Eliminare questo file?')) return;
    try {
      await axios.delete(`${API_URL}/api/cms/media/${fileId}`, { withCredentials: true });
      fetchFiles();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nell\'eliminazione');
    }
  };

  const renameFile = async () => {
    if (!editingFile || !editingFile.newName) return;
    try {
      await axios.put(`${API_URL}/api/cms/media/${editingFile.id}`, {
        filename: editingFile.newName
      }, { withCredentials: true });
      setEditingFile(null);
      fetchFiles();
    } catch (error) {
      alert(error.response?.data?.detail || 'Errore nella rinomina');
    }
  };

  const copyUrl = (file) => {
    const url = `${API_URL}${file.url || `/api/media/file/${file.url_slug}`}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(file.id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const currentFolderData = folders.find(f => f.id === currentFolder);
  const subFolders = folders.filter(f => f.parent_id === currentFolder);
  const rootFolders = folders.filter(f => !f.parent_id);
  const displayFolders = currentFolder ? subFolders : rootFolders;

  return (
    <div className="space-y-6" data-testid="media-manager">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-semibold text-slate-900">Media Manager</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <button onClick={() => setCurrentFolder(null)} className="hover:text-[#1E88E5]">
              Root
            </button>
            {currentFolderData && (
              <>
                <ChevronRight className="w-4 h-4" />
                <span>{currentFolderData.name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setViewMode(viewMode === 'grid' ? 'list' : 'grid'); }}>
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchFiles()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Cerca file..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="media-search"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ordina per" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Data</SelectItem>
            <SelectItem value="filename">Nome</SelectItem>
            <SelectItem value="size">Dimensione</SelectItem>
            <SelectItem value="file_type">Tipo</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Upload Zone */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-[#1E88E5] bg-[#EFF6FF]' : 'border-slate-300 hover:border-[#1E88E5]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.svg,.zip,.gif,.webp"
        />
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 mb-2">
          Trascina i file qui oppure{' '}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[#1E88E5] hover:underline font-medium"
          >
            seleziona dal computer
          </button>
        </p>
        <p className="text-sm text-slate-400">
          PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, SVG, ZIP (max 50MB)
        </p>
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-[#1E88E5] h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">Caricamento in corso... {uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Folders */}
      <div className="flex flex-wrap gap-4">
        {currentFolder && (
          <button
            onClick={() => {
              const parent = currentFolderData?.parent_id || null;
              setCurrentFolder(parent);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Folder className="w-5 h-5 text-slate-500" />
            <span className="text-sm text-slate-600">...</span>
          </button>
        )}
        {displayFolders.map((folder) => (
          <div key={folder.id} className="group relative">
            <button
              onClick={() => setCurrentFolder(folder.id)}
              className="flex items-center gap-2 px-4 py-2 bg-[#EFF6FF] rounded-lg hover:bg-[#DBEAFE] transition-colors"
            >
              <Folder className="w-5 h-5 text-[#1E88E5]" />
              <span className="text-sm font-medium text-slate-700">{folder.name}</span>
            </button>
            <button
              onClick={() => deleteFolder(folder.id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* New Folder */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Nuova cartella
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuova Cartella</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label>Nome cartella</Label>
              <Input 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Es. Modulistica IMU"
                data-testid="folder-name-input"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annulla</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={createFolder} className="bg-[#1E88E5] hover:bg-[#1565C0]">
                  Crea
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Files */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12">
          <File className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nessun file presente</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="group relative hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center mb-3">
                  {['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(file.file_type?.toLowerCase()) ? (
                    <img 
                      src={`${API_URL}/api/media/file/${file.url_slug}`}
                      alt={file.filename}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    getFileIcon(file.file_type)
                  )}
                </div>
                <p className="text-sm font-medium text-slate-900 truncate" title={file.filename}>
                  {file.filename}
                </p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => copyUrl(file)} title="Copia link">
                    {copiedUrl === file.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <a href={`${API_URL}/api/media/download/${file.url_slug}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="secondary" title="Scarica">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button size="sm" variant="destructive" onClick={() => deleteFile(file.id)} title="Elimina">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:border-[#1E88E5] transition-colors">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {getFileIcon(file.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{file.filename}</p>
                <p className="text-sm text-slate-500">{formatFileSize(file.size)} • {file.file_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => copyUrl(file)}>
                  {copiedUrl === file.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <a href={`${API_URL}/api/media/download/${file.url_slug}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditingFile({ ...file, newName: file.filename })}>
                      <Edit className="w-4 h-4 mr-2" />
                      Rinomina
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteFile(file.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rinomina File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Nuovo nome</Label>
            <Input 
              value={editingFile?.newName || ''}
              onChange={(e) => setEditingFile({...editingFile, newName: e.target.value})}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFile(null)}>Annulla</Button>
            <Button onClick={renameFile} className="bg-[#1E88E5] hover:bg-[#1565C0]">Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaManager;
