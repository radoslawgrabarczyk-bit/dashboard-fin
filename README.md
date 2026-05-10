# Market Terminal — Instrukcja Deploymentu

## Struktura projektu

```
market-terminal/
├── backend/
│   ├── server.js       ← proxy do Finnhub API
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── vercel.json
    ├── package.json
    └── src/
        ├── main.jsx
        └── Dashboard.jsx
```

---

## KROK 1 — Backend na Railway

1. Wejdź na https://railway.app i zaloguj się przez GitHub
2. Kliknij **New Project → Deploy from GitHub repo**
3. Wrzuć folder `backend/` na GitHub (lub użyj drag & drop)
4. Po deploymencie wejdź w **Variables** i dodaj:
   ```
   FINNHUB_KEY = d7tf7s9r01qugn0adfqgd7tf7s9r01qugn0adfr0
   ```
5. W **Settings → Networking** kliknij **Generate Domain**
6. Skopiuj URL — będzie wyglądał tak:
   ```
   https://finnhub-proxy-production-xxxx.up.railway.app
   ```

Sprawdź czy działa: otwórz `https://TWOJ-URL.railway.app/` — powinno pokazać `{"status":"ok"}`.

---

## KROK 2 — Frontend na Vercel

1. W pliku `frontend/src/Dashboard.jsx` znajdź linię:
   ```js
   const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
   ```
   Zostaw tak jak jest — URL ustawisz przez zmienną środowiskową w Vercel.

2. Wrzuć folder `frontend/` na GitHub

3. Wejdź na https://vercel.com → **Add New Project** → importuj repo

4. W **Environment Variables** dodaj:
   ```
   VITE_API_URL = https://TWOJ-URL.up.railway.app
   ```

5. Kliknij **Deploy** — Vercel automatycznie odpali `npm run build`

6. Gotowe! Dostaniesz URL w stylu:
   ```
   https://market-terminal-xyz.vercel.app
   ```

---

## Lokalne uruchomienie (testowanie)

### Backend:
```bash
cd backend
npm install
FINNHUB_KEY=twoj_klucz node server.js
# Serwer działa na http://localhost:3001
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
# Aplikacja działa na http://localhost:5173
```

---

## Odświeżanie danych

Dashboard automatycznie odświeża dane co 60 sekund.
Finnhub free tier: 60 req/min — backend wysyła ~8 req/s z rate-limitingiem.

---

## Koszt hostingu

| Serwis   | Plan   | Koszt     |
|----------|--------|-----------|
| Railway  | Hobby  | $5/mies. (500h free na starter) |
| Vercel   | Hobby  | $0        |
| Finnhub  | Basic  | $0        |
