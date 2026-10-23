# Tempête Boelo — vidéo TikTok (Remotion)

Motion design codé, 1080×1920, 30 i/s, avec la voix off de Monsieur.meteo (`public/vo.m4a`).

## Fichiers

- `SCRIPT.md`, `STORYBOARD.md`, `SOURCES.md` : phase 1 (script v2, découpage, sources datées).
- `src/data/transcription.json` : transcription faster-whisper (large-v3, `word_timestamps=True`) corrigée d'après le script, au format `{mot, début, fin}`. Elle pilote tout le minutage. La version brute est dans `transcription-brute-large-v3.json`.
- `src/Video.tsx` : liste des scènes, chacune démarre sur le mot qui l'annonce (`at('mot', après_s)`).
- `src/scenes.tsx` : les 14 scènes. `src/components/` : composants réutilisables (cartes Europe et départements, cyclone, jauge, barres de rafales, double calendrier, carte de presse + tampon, compteur géant, checklist, sous-titres karaoké, bandeau).
- `scripts/build-geo.mjs` : prépare les fonds de carte (départements gregoiredavid/france-geojson, pays Natural Earth via world-atlas).
- `DESCRIPTION.md` : texte de description TikTok + hashtags.

## Les blancs de la voix off

| Blanc | Carte affichée |
|---|---|
| 0 – 3,8 s | Europe, Boelo arrive de l'Atlantique |
| 35,1 – 39,7 s (« Et chez nous, en France ? ») | Zoom de l'Europe vers la France, isobares de Boelo au nord, vent sur la Manche |
| 59,9 – 63,1 s (« Dimanche, le ciel devra se dégager… ») | Carte de dimanche : éclaircies à l'ouest, bande de pluie qui part vers l'est |
| 71,5 – 73,7 s (« …comme pour la tempête Austen ») | Rappel Austen : Bretagne, rafale de 161 km/h à la pointe du Raz |

## Rendu

```bash
npm install
npx remotion render Boelo renders/tempete-boelo.mp4
# dans un conteneur sans Chrome téléchargeable :
#   --browser-executable=/chemin/vers/chrome-headless-shell
node scripts/stills.mjs <dossier> 60 520 1440   # images de contrôle
```

Pour mettre à jour un chiffre : modifier la scène dans `src/scenes.tsx`. Pour une nouvelle prise de voix : remplacer `public/vo.m4a`, relancer la transcription, mettre à jour `src/data/transcription.json` et `AUDIO_SECONDS` dans `src/timing.ts`.
