# ReceiptHub — Frontend

Interfaccia web di **ReceiptHub**, la piattaforma su cui i clienti archiviano le ricevute dei
propri acquisti e ne ricavano statistiche. Applicazione React con rendering lato server, che parla
con l'API Spring Boot del repository backend e delega l'autenticazione a Firebase.

Progetto per il corso di **Sistemi Distribuiti e Cloud Computing**.

- **Online**: <https://receipthub.duckdns.org>
- **Backend**: repository separato (Spring Boot 3.5 + PostgreSQL), con il `DEPLOY.md` completo

> L'istanza EC2 viene spenta quando non serve, per contenere i costi: se il dominio non risponde,
> è probabilmente spenta.

---

## Indice

- [Cosa si può fare](#cosa-si-può-fare)
- [Stack](#stack)
- [Struttura del progetto](#struttura-del-progetto)
- [Avvio in locale](#avvio-in-locale)
- [Variabili d'ambiente](#variabili-dambiente)
- [Rotte](#rotte)
- [Convenzioni](#convenzioni)
- [Build e deploy](#build-e-deploy)

---

## Cosa si può fare

**Da cliente**

- Registrarsi e accedere (email e password, con recupero password e cambio password da profilo)
- Compilare una ricevuta riga per riga e scaricarne il PDF
- Caricare il PDF di una ricevuta già esistente e lasciare che il backend ne estragga i dati
- Consultare le proprie ricevute, ordinarle per data o importo, filtrarle per codice, importo o
  ultime quattro cifre della carta
- Esportare le ricevute in CSV, tutte o una alla volta
- Vedere il proprio prodotto del mese e quello di un periodo scelto
- Chiedere a *RiceVito*, il chatbot, invece di cercare a mano

**Da amministratore**

- Cruscotto statistiche con grafici: fatturato nel tempo, prodotti più venduti, distribuzione dei
  metodi di pagamento, clienti principali
- Elenco e ricerca dei clienti, con modifica del profilo
- Gestione del catalogo prodotti

L'interfaccia è in italiano e ha tema chiaro e scuro.

## Stack

| | |
|---|---|
| Framework | React 19 + React Router 7 in modalità framework (SSR attivo) |
| Linguaggio | TypeScript |
| Build | Vite 6 |
| Stile | Tailwind CSS 4 |
| Stato server | TanStack Query 5 |
| Grafici | Recharts 3 |
| Autenticazione | Firebase Authentication (SDK client) |
| Runtime | Node 20, `react-router-serve` |

## Struttura del progetto

```
app/
├── root.tsx           documento HTML, provider di tema e QueryClient
├── routes.ts          mappa delle rotte (annidamento e layout protetti)
├── routes/            una pagina per file: home, login, register, dashboard,
│                      receipts, receipts/new, products, chat, admin/*
└── src/
    ├── api/           client HTTP, tipi condivisi col backend, QueryClient
    ├── auth/          Firebase, sessione, layout protetti, form di accesso
    ├── components/    mattoncini riusabili (Button, Card, Field, ...)
    ├── features/      logica per dominio: receipts, products, stats, user, chat
    │                  (hook di React Query + componenti specifici)
    ├── lib/           utilità pure: validazioni, CSV, date, messaggi di errore
    └── theme/         tema chiaro/scuro
```

La divisione che conta è fra **`components/`** — pezzi di interfaccia senza conoscenza del dominio —
e **`features/`**, dove ogni cartella tiene insieme gli hook di React Query e i componenti di una
singola area funzionale. Le chiamate all'API stanno tutte in `src/api/`: nessun componente fa
`fetch` per conto proprio.

## Avvio in locale

Serve **Node 20+**. Il backend deve girare in parallelo (vedi il suo README): senza, l'app si apre
ma ogni chiamata fallisce.

```bash
npm install
```

Crea un file `.env` partendo da [`.env.example`](.env.example) e riempilo con i valori del tuo
progetto Firebase, poi:

```bash
npm run dev
```

L'applicazione risponde su <http://localhost:5173> con hot reload. Il controllo dei tipi è a parte:

```bash
npm run typecheck
```

## Variabili d'ambiente

Vite incorpora le `VITE_*` **nel bundle durante la build**: sono visibili nel JavaScript servito al
browser e vanno trattate come pubbliche, non come segreti. Per questo in produzione arrivano come
build-arg del Docker e stanno fra le *variables* del repository GitHub, non fra i *secrets*.

| Variabile | Esempio | A cosa serve |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Radice dell'API; in produzione `https://dominio/api` |
| `VITE_FIREBASE_API_KEY` | `AIza...` | Chiave web del progetto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `progetto.firebaseapp.com` | Dominio di autenticazione |
| `VITE_FIREBASE_PROJECT_ID` | `sdcc-a2df9` | Project id, deve combaciare con quello del backend |
| `VITE_FIREBASE_APP_ID` | `1:123...:web:abc` | Identificativo dell'app web |

La chiave web di Firebase è pubblica per progetto: a proteggere l'account sono gli *authorized
domains* e le regole, non l'oscurità della chiave. Ricordarsi di aggiungere il dominio di
produzione agli authorized domains, altrimenti il login non parte.

## Rotte

| Percorso | Accesso | Pagina |
|---|---|---|
| `/` | pubblico | Presentazione |
| `/login`, `/register` | pubblico | Accesso e registrazione |
| `/dashboard` | autenticato | Profilo, prodotto del mese, cambio password |
| `/receipts` | autenticato | Elenco ricevute, ricerca, filtri, export CSV |
| `/receipts/new` | autenticato | Nuova ricevuta o caricamento di un PDF |
| `/products` | autenticato | Catalogo (in sola lettura per i clienti) |
| `/chat` | autenticato | Chatbot RiceVito |
| `/admin/stats` | amministratore | Cruscotto con i grafici |
| `/admin/users`, `/admin/users/:email` | amministratore | Clienti e modifica profilo |

L'accesso è imposto da tre layout annidati, dichiarati in `app/routes.ts`:
`ProtectedLayout` (richiede una sessione), `RequireProfile` (richiede un profilo completo sul
backend) e `AdminOnlyLayout` (richiede `ROLE_ADMIN`). Le protezioni lato client servono a non
mostrare pagine inutili: l'autorizzazione vera resta quella del backend, che valida il token a ogni
chiamata.

## Convenzioni

Alcune scelte non ovvie, tutte con una ragione dietro:

- **Nessun dato utente sopravvive al cambio di identità.** `queryClient.clear()` viene invocato al
  logout e ogni volta che `RequireAuth` vede cambiare l'uid — per esempio dopo un login in un'altra
  scheda. Senza, chi entra dopo vede in cache i dati di chi c'era prima finché il refetch non
  risponde, e se il refetch fallisce li vede per sempre.
- **I 4xx non si ritentano.** Un `400` o un `404` descrivono la richiesta, non un guasto passeggero:
  ritentarli non cambia l'esito e aggiunge solo attesa. Fanno eccezione `408` e `429`, dove è il
  server stesso a dire di riprovare. Errori di rete e `5xx` mantengono il retry di default.
- **Il testo d'errore del backend non arriva mai all'utente.** `lib/errorMessage.ts` traduce lo
  stato HTTP in un messaggio in italiano; chi chiama fornisce un `fallback` che descrive
  l'operazione fallita. Lo stesso vale per gli errori di Firebase (`lib/firebaseError.ts`).
- **Una collezione vuota è un elenco vuoto, non un errore.** Il backend risponde `200` con `[]`, e
  l'interfaccia mostra lo stato vuoto invece di una schermata di errore.
- **La voce “Chat” compare solo dove il chatbot è configurato.** Il frontend interroga
  `/chat/status` all'avvio: dove manca la chiave OpenAI, la pagina non viene nemmeno proposta.

## Build e deploy

```bash
npm run build
```

```bash
npm run start
```

La build produce `build/client` (statici) e `build/server` (SSR), serviti da `react-router-serve`
sulla porta 3000.

Con Docker, ricordando che le `VITE_*` vanno passate come **build-arg** e non come variabili del
container in esecuzione:

```bash
docker build --build-arg VITE_API_BASE_URL=http://localhost/api --build-arg VITE_FIREBASE_API_KEY=... -t receipthub-frontend:local .
```

In produzione il container sta dietro Caddy insieme al backend, sulla stessa origine: `/api/*` va a
Spring, tutto il resto qui. A ogni push su `master`, GitHub Actions assume un ruolo AWS via OIDC,
costruisce l'immagine, la pubblica su ECR e aggiorna l'istanza EC2 via SSM. La procedura completa è
nel `DEPLOY.md` del repository backend.
