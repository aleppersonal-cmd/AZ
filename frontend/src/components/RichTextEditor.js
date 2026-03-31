import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { Button } from './ui/button';
import { Toggle } from './ui/toggle';
import { Separator } from './ui/separator';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Minus, Undo, Redo,
  Heading1, Heading2, Heading3, Heading4, Image as ImageIcon,
  Link as LinkIcon, Highlighter, Type, Pilcrow, LayoutGrid
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Custom spacing extension
const SpacingExtension = {
  name: 'spacing',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          marginTop: {
            default: null,
            parseHTML: element => element.style.marginTop || null,
            renderHTML: attributes => {
              if (!attributes.marginTop) return {};
              return { style: `margin-top: ${attributes.marginTop}` };
            },
          },
          marginBottom: {
            default: null,
            parseHTML: element => element.style.marginBottom || null,
            renderHTML: attributes => {
              if (!attributes.marginBottom) return {};
              return { style: `margin-bottom: ${attributes.marginBottom}` };
            },
          },
        },
      },
    ];
  },
};

const MenuBar = ({ editor, onInsertImage }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  const addSpacing = (type) => {
    if (type === 'small') {
      editor.chain().focus().insertContent('<p style="margin-top: 16px; margin-bottom: 16px;">&nbsp;</p>').run();
    } else if (type === 'medium') {
      editor.chain().focus().insertContent('<p style="margin-top: 32px; margin-bottom: 32px;">&nbsp;</p>').run();
    } else if (type === 'large') {
      editor.chain().focus().insertContent('<p style="margin-top: 48px; margin-bottom: 48px;">&nbsp;</p>').run();
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-2 mb-2 bg-white sticky top-0 z-10">
      {/* Row 1: Text formatting */}
      <div className="flex flex-wrap items-center gap-1 mb-2">
        <div className="flex items-center gap-1 mr-2">
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Titolo H1"
          >
            <Heading1 className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Titolo H2"
          >
            <Heading2 className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Titolo H3"
          >
            <Heading3 className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 4 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            title="Titolo H4"
          >
            <Heading4 className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('paragraph')}
            onPressedChange={() => editor.chain().focus().setParagraph().run()}
            title="Paragrafo"
          >
            <Pilcrow className="w-4 h-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 mx-2">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            title="Grassetto"
          >
            <Bold className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            title="Corsivo"
          >
            <Italic className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            title="Sottolineato"
          >
            <UnderlineIcon className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            title="Barrato"
          >
            <Strikethrough className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('highlight')}
            onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
            title="Evidenziato"
          >
            <Highlighter className="w-4 h-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 mx-2">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
            title="Allinea a sinistra"
          >
            <AlignLeft className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
            title="Centra"
          >
            <AlignCenter className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
            title="Allinea a destra"
          >
            <AlignRight className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'justify' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Giustifica"
          >
            <AlignJustify className="w-4 h-4" />
          </Toggle>
        </div>
      </div>

      {/* Row 2: Lists, blocks, media */}
      <div className="flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-1 mr-2">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            title="Elenco puntato"
          >
            <List className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            title="Elenco numerato"
          >
            <ListOrdered className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            title="Citazione"
          >
            <Quote className="w-4 h-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('codeBlock')}
            onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Blocco codice"
          >
            <Code className="w-4 h-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 mx-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Separatore"
          >
            <Minus className="w-4 h-4" />
          </Button>

          {/* Spacing buttons */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Aggiungi spaziatura">
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aggiungi Spaziatura</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <Button
                  variant="outline"
                  onClick={() => { addSpacing('small'); }}
                  className="flex flex-col h-auto py-4"
                >
                  <div className="h-4 bg-slate-200 w-full mb-2"></div>
                  <span className="text-xs">Piccola (16px)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { addSpacing('medium'); }}
                  className="flex flex-col h-auto py-4"
                >
                  <div className="h-8 bg-slate-200 w-full mb-2"></div>
                  <span className="text-xs">Media (32px)</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { addSpacing('large'); }}
                  className="flex flex-col h-auto py-4"
                >
                  <div className="h-12 bg-slate-200 w-full mb-2"></div>
                  <span className="text-xs">Grande (48px)</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 mx-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onInsertImage}
            title="Inserisci immagine"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={editor.isActive('link') ? 'bg-slate-100' : ''}
                title="Inserisci link"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inserisci Link</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label>URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Annulla</Button>
                </DialogClose>
                <Button onClick={setLink} className="bg-[#1E88E5] hover:bg-[#1565C0]">
                  Inserisci
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-1 mx-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Annulla"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Ripristina"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Image Picker Dialog
const ImagePickerDialog = ({ open, onOpenChange, onSelect }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSize, setImageSize] = useState('medium');
  const [imageAlign, setImageAlign] = useState('center');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');

  React.useEffect(() => {
    if (open) {
      fetchMedia();
    }
  }, [open]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/cms/media`, { 
        withCredentials: true,
        params: { file_type: '' }  // Get all files
      });
      // Filter only image files
      const images = response.data.filter(f => 
        ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(f.file_type?.toLowerCase())
      );
      setMediaFiles(images);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (selectedImage) {
      const url = `${API_URL}/api/media/file/${selectedImage.url_slug}`;
      let width = '100%';
      if (imageSize === 'small') width = '200px';
      else if (imageSize === 'medium') width = '400px';
      else if (imageSize === 'large') width = '600px';

      onSelect({
        src: url,
        alt: altText || selectedImage.filename,
        title: caption,
        width,
        align: imageAlign
      });
      onOpenChange(false);
      setSelectedImage(null);
      setAltText('');
      setCaption('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Seleziona Immagine</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#1E88E5] border-t-transparent rounded-full az-spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Image Gallery */}
            <div className="lg:col-span-2">
              <ScrollArea className="h-[400px] border rounded-lg p-2">
                {mediaFiles.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    Nessuna immagine disponibile. Carica immagini dal Media Manager.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {mediaFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedImage(file)}
                        className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedImage?.id === file.id
                            ? 'border-[#1E88E5] ring-2 ring-[#1E88E5] ring-opacity-50'
                            : 'border-transparent hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={`${API_URL}/api/media/file/${file.url_slug}`}
                          alt={file.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {selectedImage && (
                <>
                  <div>
                    <Label>File selezionato</Label>
                    <p className="text-sm text-slate-600 truncate">{selectedImage.filename}</p>
                  </div>
                  
                  <div>
                    <Label>Testo alternativo (SEO)</Label>
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Descrizione immagine"
                    />
                  </div>

                  <div>
                    <Label>Didascalia</Label>
                    <Input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Testo sotto l'immagine"
                    />
                  </div>

                  <div>
                    <Label>Dimensione</Label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {['small', 'medium', 'large', 'full'].map((size) => (
                        <Button
                          key={size}
                          variant={imageSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setImageSize(size)}
                          className={imageSize === size ? 'bg-[#1E88E5]' : ''}
                        >
                          {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'Full'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Allineamento</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {['left', 'center', 'right'].map((align) => (
                        <Button
                          key={align}
                          variant={imageAlign === align ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setImageAlign(align)}
                          className={imageAlign === align ? 'bg-[#1E88E5]' : ''}
                        >
                          {align === 'left' ? 'Sinistra' : align === 'center' ? 'Centro' : 'Destra'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annulla</Button>
          </DialogClose>
          <Button 
            onClick={handleInsert} 
            disabled={!selectedImage}
            className="bg-[#1E88E5] hover:bg-[#1565C0]"
          >
            Inserisci Immagine
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main RichTextEditor Component
const RichTextEditor = ({ content, onChange, placeholder = "Inizia a scrivere..." }) => {
  const [showImagePicker, setShowImagePicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rich-editor-image',
        },
        inline: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#1E88E5] underline',
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleInsertImage = useCallback((imageData) => {
    if (editor && imageData) {
      const alignClass = `text-${imageData.align}`;
      const figureHtml = `
        <figure class="${alignClass}" style="text-align: ${imageData.align}; margin: 24px 0;">
          <img 
            src="${imageData.src}" 
            alt="${imageData.alt}" 
            style="max-width: ${imageData.width}; display: ${imageData.align === 'center' ? 'block' : 'inline-block'}; margin: ${imageData.align === 'center' ? '0 auto' : '0'};"
          />
          ${imageData.title ? `<figcaption style="font-size: 14px; color: #64748b; margin-top: 8px;">${imageData.title}</figcaption>` : ''}
        </figure>
      `;
      editor.chain().focus().insertContent(figureHtml).run();
    }
  }, [editor]);

  return (
    <div className="rich-text-editor" data-testid="rich-text-editor">
      <MenuBar 
        editor={editor} 
        onInsertImage={() => setShowImagePicker(true)}
      />
      <EditorContent 
        editor={editor} 
        className="border border-slate-200 rounded-lg p-4 min-h-[300px] prose prose-slate max-w-none focus-within:border-[#1E88E5] focus-within:ring-1 focus-within:ring-[#1E88E5]"
      />
      <ImagePickerDialog
        open={showImagePicker}
        onOpenChange={setShowImagePicker}
        onSelect={handleInsertImage}
      />
    </div>
  );
};

export default RichTextEditor;
