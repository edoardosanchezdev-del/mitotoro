# Nosotros ✦ (Mitotoro)

PWA romántica para dos: frases diarias (365), álbum de recuerdos con fotos, videos y canciones, sincronizado en Supabase y desplegado en Vercel.

## Stack

- **Frontend:** Vite + JavaScript vanilla (ES modules), sin frameworks.
- **PWA:** `vite-plugin-pwa` (instalable, offline-first para el shell y caché de media).
- **Backend:** Supabase (Postgres + Auth + Storage).
- **Hosting:** Vercel.

## Estructura

```
├── index.html              # Shell de la app (login + 3 páginas + modales)
├── vite.config.js          # Build, manifest PWA y estrategias de caché
├── vercel.json             # Rewrites SPA y security headers
├── scripts/
│   └── generate-quotes.mjs # Genera las 365 frases (corre en cada build)
├── supabase/
│   └── schema.sql          # Tablas, RLS y políticas de storage
├── public/
│   ├── icons/              # Íconos PWA (192/512)
│   └── media/              # Imágenes locales (Totoro)
└── src/
    ├── main.js             # Punto de entrada y arranque
    ├── config.js           # Variables de entorno y límites
    ├── data/quotes.json    # 365 frases generadas
    ├── lib/supabase.js     # Cliente singleton
    ├── services/           # auth, memories, storage, quotes, share
    ├── ui/                 # auth gate, memories, navigation, carousel, toast, reveal
    └── styles/             # styles.css (base) + theme.css (paleta)
```

## Configuración inicial (una sola vez)

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta todo `supabase/schema.sql`.
3. En **Storage**, crea el bucket `memories` (marcado como **public**).
4. Descomenta y ejecuta las políticas de storage al final de `schema.sql`.
5. En **Authentication > Users**, crea la cuenta compartida (email + contraseña) que usarán los dos. Desactiva el registro público en **Authentication > Providers > Email** (desmarca "Allow new users to sign up").

### 2. Variables de entorno

```bash
cp .env.example .env
```

Rellena con los valores de **Project Settings > API**:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=https://tu-app.vercel.app
```

### 3. Desarrollo local

```bash
npm install
npm run dev
```

### 4. Deploy en Vercel

1. Sube el repo a GitHub y conéctalo en [vercel.com](https://vercel.com) (o usa `npx vercel`).
2. En **Settings > Environment Variables** agrega las tres variables `VITE_*`.
3. Deploy. Vercel detecta Vite automáticamente.

### 5. Instalar como app

- **Android/Chrome:** abrir la URL → menú → "Agregar a pantalla de inicio".
- **iOS/Safari:** compartir → "Agregar a pantalla de inicio".

## Funcionalidades

- **365 frases:** una por día del año (`src/services/quotes.js` indexa por día del año). Regenera con `npm run generate:quotes` o edita `scripts/generate-quotes.mjs` para personalizarlas.
- **Recuerdos:** título, fecha, descripción, portada, galería de fotos/videos y canción opcional (mp3/m4a/ogg, máx. 25 MB por archivo). Todo va al bucket `memories`.
- **Compartir:** botón nativo (Web Share API con imagen), WhatsApp y Facebook con enlaces directos, y descarga de una tarjeta 1080×1920 lista para historias de Instagram/TikTok (esas apps no aceptan enlaces externos de publicación, así que se comparte la imagen).
- **Enlaces profundos:** `https://tu-app.vercel.app/?m=<id>` abre un recuerdo directamente.

## Notas de seguridad

- El acceso requiere sesión (Supabase Auth); las tablas tienen RLS y solo usuarios autenticados leen/escriben.
- El bucket es de lectura pública para que los enlaces compartidos y las tarjetas funcionen; la escritura requiere sesión.
- La `anon key` de Supabase es pública por diseño; la protección real es RLS.
