# RDTII 2.1 Compliance Engine

RDTII 2.1 Compliance Engine · Team SUPERNOVA · UNESCAP Hackathon 2026

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 |
| **Language** | TypeScript 5.8 |
| **Bundler** | Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Motion 12 |
| **Icons** | Lucide React |
| **Server** | Express 4 (dev proxy) |

## Project Structure

```
├── public/assets/          # Static assets (images, video)
├── src/
│   ├── components/         # React components
│   │   ├── AllResultsPanel.tsx
│   │   ├── AuditModal.tsx
│   │   ├── AuditViewPanel.tsx
│   │   ├── CountriesPanel.tsx
│   │   ├── ExportsPanel.tsx
│   │   ├── IndicatorsPanel.tsx
│   │   ├── LiveLogsPanel.tsx
│   │   ├── LiveLogTerminal.tsx
│   │   ├── NewAnalysisForm.tsx
│   │   ├── ReviewQueuePanel.tsx
│   │   ├── StatsPanel.tsx
│   │   ├── TokenBurnPanel.tsx
│   │   └── WelcomeScreen.tsx
│   ├── api.ts              # API client & types
│   ├── App.tsx             # Root app component
│   ├── data.ts             # Static data / constants
│   ├── index.css           # Global styles
│   ├── main.tsx            # Entry point
│   └── types.ts            # Shared TypeScript types
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set `LLM_API_KEY` in `.env.local`
3. Run the app:
   `npm run dev`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check with `tsc --noEmit` |
