# LykkeLiga Spil

Første spil: en fælles måltæller. Dansk, responsivt og uden framework eller build-afhængigheder.

## Lokal afprøvning

Node 22 eller nyere: `npm run dev`, åbn http://localhost:3000.
På localhost er tælleren tydeligt markeret som **lokal demo** og gemmes i browserens localStorage. Den er ikke en fælles score.

## GitHub → Vercel → spil.lykkeliga.dk

1. Opret et GitHub-repository og push disse filer.
2. Importér repositoryet i Vercel som et projekt med framework "Other". `vercel.json` angiver build og public-mappen.
3. Tilslut Upstash Redis via Vercel Marketplace. Angiv `UPSTASH_REDIS_REST_URL` og `UPSTASH_REDIS_REST_TOKEN` som servermiljøvariabler. Se `.env.example`. Deploy igen efter ændringer i miljøvariabler.
4. Tilføj `spil.lykkeliga.dk` i Vercel → Settings → Domains. Opret den DNS-record, Vercel viser, hos domænets DNS-udbyder.
5. Kontrollér fra to enheder, at mål lægges til samme tæller. Andre enheder opdaterer hvert femte sekund.

Den fælles score kræver holdbar serverlagring. Redis er teknisk en lille database, men her bruges kun én tæller samt midlertidige id'er til at forhindre dobbelttælling ved netværksfejl. Ingen konti, spillerprofiler eller databaseskemaer. Hemmeligheder ligger kun på serveren.

API'et bruger atomisk INCR og deduplikerer samme mål-id i 24 timer. Ved fejl kan spilleren prøve samme mål igen. Browserens personlige tæller er kun et lokalt bidragstal, ikke et verificeret spillerregnskab.

Dette er en tillidsbaseret tæller: gentagne bevidste klik eller direkte API-kald kan øge tallet. Den har ingen login eller anti-snyd. Serveren afviser browserindsendelser fra andre origins. Ingen kunstig startscore eller opdigtet rekord er indsat. Milepæle kommer for hver 1.000 mål; en egentlig tidligere rekord kan sættes ind, når den kendes.

`npm test` tester serverens fejltilstande og atomiske indsendelse uden at kontakte eksterne tjenester. `npm run build` kontrollerer JavaScript-syntaks.
