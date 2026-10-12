# PRD — Napoli Lounge (app radio nativa)

## Problema originale
App radio nativa React Native + Expo (TS) per iOS/Android che replica la web app Napoli Lounge. Nessun backend, auth o deploy propri: dati da SDK Base44 (`appId 6aad35cb7e9e89bd6ab72479`), stream Zeno, Open-Meteo, BigDataCloud, media Base44, Simple Icons. Audio con react-native-track-player (background e schermata di blocco). 3 schede: In onda, Meteo/News, Social. 10 temi a gradiente con sfondo al 25%. Interfaccia in italiano, bundle `it.napolilounge.app`, progetto pronto per EAS.

## Scelte dell'utente
- I profili EAS sono in `eas.config.example.json` (eas.json è gestito dalla piattaforma).
- In Expo Go e sul web c'è un fallback expo-audio; nella build nativa si usa track-player.
- Icone Feather da `@react-native-vector-icons/feather`.

## Implementato (2026-06)
- Algoritmo del palinsesto su 3 giorni, verificato sui 3 casi di accettazione con i dati reali. Polling ogni 60 s + AppState.
- Barra "In onda ora" con orologio, avanzamento e programma successivo.
- Player globale: track-player con servizio di playback, metadati, comandi remoti, interruzioni e riconnessione con backoff.
- Meteo (posizione, ricerca, etichette WMO) e notizie (getNews) con pull-to-refresh.
- Social con loghi SVG ed Expo Image; gradiente Instagram.
- 10 temi, chiave `radio_theme_id`, tema di default in base all'aspetto del telefono.
- app.json con permessi, UIBackgroundModes audio, icone e splash locali su #0a6e7a.
- README in italiano.

## Backlog
- P0: verificare l'audio in background e a schermo bloccato con una development build su un telefono reale.
- P1: completare i segnaposto delle credenziali in eas.json.
- P2: Program.subscribe() come aggiornamento extra.
