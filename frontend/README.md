# Napoli Lounge — app radio nativa (React Native + Expo, TypeScript)

App pubblica (nessun login) che riproduce la diretta di Napoli Lounge, mostra il programma in onda, il meteo, le notizie e i social.
**Nessun backend proprio**: tutti i dati arrivano dal backend Base44 già esistente e da servizi pubblici. La cartella `backend/` del template non è usata.

## Fonti dati (nessuna è un backend nostro)
| Fonte | Uso |
|---|---|
| SDK `@base44/sdk@^0.8.53` (`base44.app`) | Palinsesto `Program.list('start_time', 500)` e notizie `functions.invoke('getNews', {})` |
| `stream.zeno.fm` | Stream audio in diretta |
| `api.open-meteo.com`, `geocoding-api.open-meteo.com` | Meteo e ricerca città |
| `api.bigdatacloud.net` | Reverse geocoding |
| `media.base44.com` | Logo, immagine stagionale, sfondi dei temi |
| `cdn.simpleicons.org` | Loghi social (SVG, mostrati con `expo-image`) |

### Elenco finale dei domini chiamati dall'app
`base44.app`, `media.base44.com`, `stream.zeno.fm`, `api.open-meteo.com`, `geocoding-api.open-meteo.com`, `api.bigdatacloud.net`, `cdn.simpleicons.org`.

Aperti solo esternamente (browser/app di sistema, con `Linking.openURL`): `napolilounge.it`, `www.napolilounge.it`, `facebook.com`, `instagram.com`, `tiktok.com`, `youtube.com`, `mailto:info@napolilounge.it`, e i link degli articoli restituiti da Base44 (`napoli.repubblica.it`).

Verifica di collegamento (fatta): `Program.list('start_time', 500)` restituisce un **array di 137 programmi** senza login (dom 14, lun 21, mar 21, mer 23, gio 22, ven 22, sab 14). Nessun 401/403. Se in futuro la chiamata rispondesse 401/403, l'app lo scrive nel log (`[Base44] Program.list ha risposto 401/403`) e non usa fonti alternative.

### Polyfill
Lo SDK genera un `uuid v4` per ogni richiesta (`crypto.getRandomValues`), che Hermes non ha. Per questo c'è il polyfill standard `react-native-get-random-values`, importato in `src/base44.ts`. Non servono altri polyfill: le parti dello SDK che usano `window.location`/`localStorage` sono già protette e riguardano solo il login (non usato). `analytics.enabled: false`. `Program.subscribe()` non è usato: l'aggiornamento avviene in polling ogni 60 s e ogni volta che l'app torna in primo piano.

## Struttura
```
app/_layout.tsx            Provider globali, servizio di playback, metadati per la schermata di blocco
app/(tabs)/_layout.tsx     Sfondo del tema, barra "In onda ora", 3 schede sempre montate
app/(tabs)/index.tsx       "In onda" (play/pausa)
app/(tabs)/meteo.tsx       "Meteo/News" (unica schermata che scorre, pull-to-refresh)
app/(tabs)/social.tsx      "Social"
src/base44.ts              Client SDK Base44
src/schedule.tsx           Algoritmo del programma in onda (sequenza di 3 giorni) + polling
src/player/                track-player (build nativa) / expo-audio (solo anteprima in Expo Go e web)
src/theme.ts               10 temi, chiave `radio_theme_id`
src/config.ts              Costanti (stream, social, URL privacy e asset)
eas.config.example.json    Profili EAS da rinominare in eas.json
```

## 1. Installazione
Requisiti: Node 20+, Yarn 1, account Expo. Xcode e Android Studio servono solo per compilare in locale.
```bash
cd frontend
yarn install
npm i -g eas-cli
eas login                              # oppure: export EXPO_TOKEN=...
cp eas.config.example.json eas.json    # profili development / preview / production
eas init                               # collega il progetto al tuo account/organizzazione (aggiunge projectId in app.json)
```

## 2. Development build (obbligatoria per l'audio)
`react-native-track-player` **non funziona in Expo Go**. In Expo Go e sul web l'app usa un fallback `expo-audio`, solo per provare l'interfaccia: niente background, niente schermata di blocco. La verifica vera si fa così:
```bash
eas device:create                                    # solo iOS: registra il tuo iPhone
eas build --profile development --platform android   # APK da installare sul telefono
eas build --profile development --platform ios
yarn expo start --dev-client
```
Prova su un telefono reale:
1. Premi play, poi blocca lo schermo: l'audio continua. Compaiono titolo del programma, "Napoli Lounge", "In diretta", il logo e i comandi play/pausa (funzionano anche dalle cuffie).
2. Fai o ricevi una chiamata: l'audio va in pausa e poi riprende.
3. Disattiva e riattiva la rete: il player si riconnette da solo, con tentativi ripetuti (2 s, 4 s, 8 s… fino a 30 s).

Build interna di prova senza dev client: `eas build --profile preview --platform all`.

## 3. Generare IPA e AAB firmati
```bash
eas build --profile production --platform ios       # IPA
eas build --profile production --platform android   # AAB
```
Alla prima build EAS chiede le credenziali. Può generare e conservare per te il certificato di distribuzione, il provisioning profile e il keystore Android (per gestirli: `eas credentials`).

### Credenziali necessarie
- **Expo**: account/organizzazione EAS (`eas login` oppure variabile `EXPO_TOKEN`).
- **Apple / App Store Connect**:
  - Team ID dell'Apple Developer Program;
  - chiave API di App Store Connect: file `.p8`, **Key ID** e **Issuer ID** (servono per generare certificato e provisioning profile e per `eas submit`);
  - ID numerico dell'app (`ascAppId`) del record con bundle id `it.napolilounge.app`, che crei tu.
- **Google Play Console**:
  - chiave di upload: la genera EAS, oppure fornisci il tuo keystore (file, alias, password del keystore e della chiave);
  - JSON del service account Google Cloud con permessi sulla Play Console (per `eas submit`);
  - record app con package `it.napolilounge.app`, creato da te.

Metti i file in `frontend/credentials/` (da **non** committare) e completa i segnaposto in `eas.json`, sezione `submit.production`.

## 4. Invio agli store
```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```
- **Android**: il **primo AAB va caricato a mano** in Play Console, perché Google non permette il primo upload via API. Dalla versione successiva usa `eas submit`.
- **iOS, scheda App Privacy**: dichiara "Posizione" *non collegata all'identità* e *non usata per il tracciamento*, con scopo "Funzionalità dell'app". Nessun altro dato raccolto.
- **Listing**: categoria **Musica**; privacy policy `https://www.napolilounge.it/privacy-policy-napoli-lounge-app/`.

## Configurazione nativa (`app.json`)
- Nome "Napoli Lounge", bundle id / package `it.napolilounge.app`.
- iOS: `UIBackgroundModes: ["audio"]` e `NSLocationWhenInUseUsageDescription` in italiano.
- Android: `INTERNET`, `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION` (solo quando in uso), `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `WAKE_LOCK`. Posizione in background e microfono bloccati.
- Icona iOS: logo su fondo pieno `#0a6e7a`. Icona adattiva Android: logo nella safe zone su `#0a6e7a`. Splash: fondo `#0a6e7a` con logo centrato. Sono file locali in `assets/images/`.

## Note
- Il palinsesto non viene mai salvato in locale: si rilegge ogni 60 s e quando l'app torna in primo piano. Se una ricarica fallisce restano gli ultimi dati, senza errori a schermo.
- Tema: si usa il valore salvato con la chiave `radio_theme_id`; se manca, l'aspetto del telefono (scuro → `inverno`, chiaro → `estate`). Nell'interfaccia non c'è un selettore di tema.
- Icone Feather da `@react-native-vector-icons/feather`: stesse icone di `@expo/vector-icons`, che qui è deprecato.
- `react-native-track-player` 4.1.2 gira tramite il layer di interoperabilità della New Architecture. Va verificato con la development build.
