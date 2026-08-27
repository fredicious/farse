# FARSe 2026 — Programme interactif 🎪

Web-app mobile (PWA, offline-first) du **Festival des Arts de la Rue de Strasbourg**,
du 28 au 30 août 2026. Toutes les données sont extraites du programme officiel (PDF) :
21 spectacles, ~90 représentations, 20 lieux, animations du Village du FARSe,
rencontres publiques et les 2 parcours recommandés (Famille / Intensif).

**Aucune donnée personnelle ne quitte le téléphone** : favoris et parcours sont en
`localStorage`. L'app fonctionne hors-ligne une fois chargée (service worker).

## Fonctionnalités

- 🎪 **Spectacles** — tous les spectacles avec leurs horaires façon « séances cinéma »,
  recherche (titre, compagnie, lieu, sans accents) et filtres (jour, genre, Village)
- 🕒 **Programme** — timeline chronologique par jour, avec repère « MAINTENANT »
  pendant le festival
- 🗺️ **Carte** — les 20 lieux numérotés (+ avant-première à Ostwald) ; un pin ouvre
  la liste des spectacles du lieu, puis leur fiche
- 📄 **Fiche spectacle** — photo, description complète, durée, âge, horaires
  (ajout au parcours en 1 tap), rencontre artistes, mini-carte, bouton **Y aller**
  (itinéraire à pied Google Maps)
- ❤️ **Favoris** et 🗓️ **Mon parcours** — programme personnel par timeline, détection
  des chevauchements, export calendrier (.ics), partage
- ⚡ **Parcours FARSe** — les parcours officiels Famille & Intensif (samedi et
  dimanche), copiables dans « Mon parcours » en un bouton
- 🔔 **Actualités** — le fil de la page Facebook officielle du festival, intégré
  dans l'app (plugin « Page » officiel, iframe sans SDK). C'est là que le festival
  annonce retards et annulations. Nota : Facebook peut exiger d'être connecté pour
  afficher le fil intégré (surtout en Europe) ; l'app propose alors un bouton
  d'ouverture directe de la page.

## Déploiement (GitHub Pages)

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publie le
site sur la branche `gh-pages` à chaque push (elle existe déjà). **Une seule action
manuelle, une seule fois** — GitHub ne permet pas de l'automatiser sans token admin :

> **Settings → Pages → Build and deployment → Source : « Deploy from a branch » →
> Branch : `gh-pages` / `/ (root)` → Save**

L'app est ensuite en ligne sur **https://fredicious.github.io/farse/** et chaque
push la met à jour automatiquement.

Aucun build : c'est du HTML/CSS/JS statique (Leaflet vendorisé). En local :
`python3 -m http.server` puis <http://localhost:8000>.

## Alertes ciblées (optionnel, dormant)

En plus du fil Facebook intégré, l'app sonde `updates.json` (même origine) toutes
les ~5 min. Le fichier est vide et rien ne s'affiche tant qu'il le reste — mais si
un jour on veut marquer une représentation précise « Annulé / Retardé → 21h30 »
partout dans l'app (timeline, fiches, parcours des amis), il suffit d'ajouter une
entrée dans son tableau `updates` (format documenté dans le fichier) et de
commiter : badge 🔔 + marquage automatique côté festivaliers.

## Notes sur les données

- Sources : grilles horaires, fiches spectacles, pages lieux/parcours du programme
  officiel. En cas de divergence dans le PDF (ex. ANTI samedi, Comment faire… samedi),
  la grille horaire + les parcours font foi.
- Coordonnées GPS des lieux **approximatives** (~50 m) ; le bouton « Y aller » utilise
  l'adresse, pas les coordonnées.
- Photos : © crédits indiqués sur chaque fiche (programme officiel).

App non-officielle, réalisée pour un usage entre amis.
