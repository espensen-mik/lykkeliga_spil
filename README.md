# LykkeSpil

Små spil fra LykkeLiga, samlet på én forside.

| Adresse | Indhold | Mappe |
| --- | --- | --- |
| `/` | Forsiden LykkeSpil med en plakat for hvert spil | `public/index.html` |
| `/maalrekord/` | Målrekord – måltæller | `public/maalrekord/` |
| `/julelykke/` | Jul i LykkeBy – julehygge med ét tryk | `public/julelykke/` |

Et nyt spil lægges i sin egen undermappe i `public/` og får et kort på forsiden (`.card` i `public/index.html`) med et billede i `public/covers/`.

## Målrekord

En enkel lokal måltæller til holdet. Klik på målknappen eller tryk mellemrum. En tast, der holdes nede, tæller kun ét mål.

Scoren gemmes i browserens localStorage og bliver stående efter genindlæsning og genstart af browseren. Ingen database, serverfunktioner eller konti er nødvendige. Hvis lokal lagring er blokeret, fungerer tælleren stadig, men viser en advarsel om, at scoren ikke gemmes.

Scoren følger den konkrete browserprofil og webadresse, ikke hele computeren. Privat browsing, rydning af browserdata og skift fra Vercel-adressen til eget domæne kan derfor give en ny tæller. Flere enheder har hver sin score. Flere åbne faner opdaterer hinanden, men brug én fane til optælling for at undgå samtidige ændringer.

Skærmen viser MÅLREKORD, det gemte målantal og LykkeLiga-logoet. "Ret antal mål" åbner et felt til at gendanne eller korrigere den samlede score. Gem bekræfter ændringen; Annuller eller Escape lukker uden ændringer.

## Jul i LykkeBy

Fuldskærmsspil i 16:9 til buzzerknap (mellemrum, Enter eller klik). Byen står i en rolig standby, og hvert tryk udløser én tilfældig hændelse, hvorefter byen vender tilbage til standby.

Tegningerne ligger som kildefiler i `Julelykke/` (huse, julemand, biler og scooter; de er ikke med i repoet) og flettes ind i `public/julelykke/index.html` af `python3 Julelykke/build-art.py`. Kør scriptet igen, hvis en af SVG-filerne ændres. Kildefilerne udgives ikke.

`/julelykke/?vindue` starter uden fuldskærm, og `/julelykke/?plakat` viser den faste aftenscene, som forsidebilledet `public/covers/julelykke.jpg` er taget fra.

## Udvikling

Node 22 eller nyere: `npm run dev`. Åbn http://localhost:3000. Serveren viser hele `public/`. `npm run build` kontrollerer JavaScript-syntaks. En tidligere lokal demoscore videreføres automatisk første gang.

## Deployment

GitHub-repoet er forbundet med Vercel. Push til main udløser en deployment. `vercel.json` vælger framework "Other" og public som statisk outputmappe. Ingen miljøvariabler er nødvendige.

Siden bruger foreløbig https://lykkeliga-spil.vercel.app/. Senere kan spil.lykkeliga.dk tilføjes under Vercel → Settings → Domains med den DNS-record, Vercel angiver. Lokal score flyttes ikke automatisk mellem de to adresser.
