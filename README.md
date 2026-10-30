# LykkeLiga Spil

En enkel lokal måltæller til holdet. Klik på målknappen eller tryk mellemrum. En tast, der holdes nede, tæller kun ét mål.

Scoren gemmes i browserens localStorage og bliver stående efter genindlæsning og genstart af browseren. Ingen database, serverfunktioner eller konti er nødvendige. Hvis lokal lagring er blokeret, fungerer tælleren stadig, men viser en advarsel om, at scoren ikke gemmes.

Scoren følger den konkrete browserprofil og webadresse, ikke hele computeren. Privat browsing, rydning af browserdata og skift fra Vercel-adressen til eget domæne kan derfor give en ny tæller. Flere enheder har hver sin score. Flere åbne faner opdaterer hinanden, men brug én fane til optælling for at undgå samtidige ændringer.

Skærmen viser KVIE SØ REKORD 2026, det gemte målantal og LykkeLiga-logoet. "Ret antal mål" åbner et felt til at gendanne eller korrigere den samlede score. Gem bekræfter ændringen; Annuller eller Escape lukker uden ændringer.

## Udvikling

Node 22 eller nyere: `npm run dev`. Åbn http://localhost:3000. `npm run build` kontrollerer JavaScript-syntaks. En tidligere lokal demoscore videreføres automatisk første gang.

## Deployment

GitHub-repoet er forbundet med Vercel. Push til main udløser en deployment. `vercel.json` vælger framework "Other" og public som statisk outputmappe. Ingen miljøvariabler er nødvendige.

Siden bruger foreløbig https://lykkeliga-spil.vercel.app/. Senere kan spil.lykkeliga.dk tilføjes under Vercel → Settings → Domains med den DNS-record, Vercel angiver. Lokal score flyttes ikke automatisk mellem de to adresser.
