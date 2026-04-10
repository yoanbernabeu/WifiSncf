# WifiSncf

Application macOS menu bar qui affiche les informations de votre train SNCF en temps reel, directement depuis le WiFi embarque.

## Fonctionnalites

- **Vitesse en temps reel** du train (GPS)
- **Retards** et raison du retard
- **Liste des arrets** avec horaires theoriques et reels
- **Carte interactive** avec le trace complet du trajet et la position du train
- **Statut WiFi** avec consommation data
- **Apparait au survol** de la zone sous le notch

## APIs utilisees

L'application interroge les APIs du portail `wifi.sncf` (accessibles uniquement depuis le WiFi du train) :

| Endpoint | Description |
|---|---|
| `/router/api/train/details` | Numero du train, arrets, horaires, retards |
| `/router/api/train/gps` | Position GPS, vitesse, cap, altitude |
| `/router/api/train/graph` | Trace GeoJSON complet du trajet |
| `/router/api/connection/status` | Statut WiFi, bande passante, data |

## Stack technique

- **Electron** + **Electron Forge**
- **TypeScript**
- **React**
- **Vite**
- **Leaflet** (carte OpenStreetMap / CartoDB)
- **Axios** (requetes HTTP)

## Installation

```bash
npm install
```

## Developpement

```bash
npm start
```

Lance l'application en mode developpement avec hot reload.

## Build

```bash
npm run package
```

Genere l'application packagée dans le dossier `out/`.

```bash
npm run make
```

Genere les installateurs (DMG, ZIP) dans `out/make/`.

## Licence

MIT - Yoan Bernabeu 2026
