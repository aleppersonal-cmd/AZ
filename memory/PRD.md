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

## Backlog Prioritizzato
### P0 (Critico)
- ✅ Homepage funzionale
- ✅ CMS Admin
- ✅ Autenticazione JWT
- ✅ Media Manager
- ✅ Modulistica

### P1 (Importante)
- [ ] Integrazione Resend per notifiche email
- [ ] Google Maps nella pagina contatti
- [ ] Upload logo aziendale

### P2 (Nice to have)
- [ ] Multi-lingua
- [ ] Dashboard analytics CMS
- [ ] Notifiche push admin

## Next Tasks
1. Integrare Resend per notifiche email form contatto/candidature
2. Configurare Google Maps API per mappa sede
3. Caricare logo aziendale tramite Media Manager
4. Aggiungere comuni clienti nel CMS
5. Caricare documenti modulistica
