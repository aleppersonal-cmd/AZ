# PRD - AZ Riscossione Tributi Locali S.r.l.

## Problema Originale
Sviluppare un sito web professionale, moderno, dinamico e scalabile per una società di riscossione tributi locali. Il sito deve trasmettere affidabilità istituzionale, competenza e innovazione tecnologica.

## Architettura
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Auth**: JWT con bcrypt
- **Database**: MongoDB (collections: users, pages, services, online_services, municipalities, media_files, media_folders, modulistica, modulistica_categories, contact_messages, job_applications, site_settings)

## User Personas
1. **Cittadino/Contribuente**: Accede al sito per scaricare modulistica, consultare servizi, contattare l'azienda
2. **Comune/Ente**: Consulta servizi offerti, accede al portale enti
3. **Operatore CMS**: Gestisce contenuti, documenti, modulistica dal pannello admin
4. **Admin**: Gestisce utenti CMS, impostazioni sito

## Core Requirements (Statici)
- Design professionale bianco/azzurro (#1E88E5)
- Layout responsive (desktop, tablet, mobile)
- CMS completo per gestione contenuti
- Cookie consent GDPR compliant
- SEO-friendly

## Implementato
### 2026-03-30: MVP Iniziale
- Homepage con hero section, 10 servizi tributari, servizi online, comuni gestiti
- Menu navigazione con sottomenu (Profilo, Servizi AZ, Servizi Online)
- 6 pagine profilo (Chi siamo, AZ R&S, Sociale, Qualità, Formazione, Lavora con noi)
- 10 pagine servizi tributari (IMU, TARI, TOSAP, ecc.)
- 4 pagine servizi online (Portale Enti, Contribuenti, Pagamenti, Operatori)
- Pagina Clienti AZ per comuni gestiti
- Pagina Contatti con form
- Form candidatura lavoro con upload CV
- Privacy Policy e Cookie Policy
- Cookie banner GDPR
- CMS Admin completo con autenticazione JWT

### 2026-03-31: Media Manager e Modulistica
- **Media Manager**: Upload drag&drop, cartelle organizzative, ricerca/ordinamento, link stabili
- **Modulistica CMS**: Gestione documenti con categorie, descrizioni, ordinamento
- **5 cartelle predefinite**: Modulistica, Loghi Comuni, Doc. Tecnica, Privacy, Immagini
- **7 categorie modulistica**: IMU, TARI, TOSAP, Pubblicità, Riscossione Coattiva, Codice Strada, Generale
- **Pagina pubblica modulistica**: /servizi-online/portale-contribuenti con ricerca, filtri, download

### 2026-03-31: Editor Visivo Avanzato WYSIWYG per Servizi
- **Editor TipTap**: Editor WYSIWYG completo integrato nel CMS
- **Formattazione testo**: H1-H4, grassetto, corsivo, sottolineato, barrato, evidenziato
- **Allineamento**: Sinistra, centro, destra, giustificato
- **Elenchi**: Puntati e numerati
- **Blocchi**: Citazioni, separatori, blocchi codice
- **Inserimento immagini**: Integrato con Media Manager, selezione dimensione/allineamento, alt text, didascalie
- **Link**: Inserimento link con URL
- **Spaziature**: Piccola (16px), Media (32px), Grande (48px)
- **Gestione SEO**: Meta Title, Meta Description, anteprima Google
- **ServicesEditor**: Editor dedicato per i 10 servizi con tabs Contenuto/Impostazioni/SEO

### 2026-03-31: Editor WYSIWYG per Pagine Istituzionali
- **PagesEditor**: Editor WYSIWYG avanzato per tutte le pagine istituzionali
- **Sidebar raggruppata**: Pagine organizzate per Profilo (6 pagine) e Legal (2 pagine)
- **Editor TipTap completo**: Stesse funzionalità dell'editor servizi (formattazione, immagini, link, ecc.)
- **Tab Contenuto/Impostazioni/SEO**: Gestione contenuto, pubblicazione, e ottimizzazione SEO
- **Crea/Elimina pagine**: Supporto creazione nuove pagine e eliminazione pagine custom
- **CSS rich-content**: Stili completi per rendering HTML nelle pagine pubbliche
- **Test completi**: 100% backend (15/15) e frontend passati

## Backlog Prioritizzato
### P0 (Critico)
- [x] Homepage funzionale
- [x] CMS Admin
- [x] Autenticazione JWT
- [x] Media Manager
- [x] Modulistica
- [x] Editor WYSIWYG Servizi
- [x] Editor WYSIWYG Pagine Istituzionali

### P1 (Importante)
- [ ] Integrazione Resend per notifiche email (necessita API Key utente)
- [ ] Google Maps nella pagina contatti (necessita API Key utente)
- [ ] Upload logo aziendale da CMS

### P2 (Nice to have)
- [ ] Multi-lingua
- [ ] Dashboard analytics CMS
- [ ] Notifiche push admin

## Next Tasks
1. Integrare Resend per notifiche email form contatto/candidature
2. Configurare Google Maps API per mappa sede (Via Imera, 4B - 90010 Campofelice di Roccello PA)
3. Upload logo aziendale tramite Media Manager
