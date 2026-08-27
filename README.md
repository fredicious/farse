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
- 🔔 **Actualités** — retards / annulations / infos via `updates.json`, badge +
  marquage « Retardé/Annulé » sur les représentations concernées, notifications
  système (app ouverte). Voir [tools/facebook-sync](tools/facebook-sync/README.md)
  pour le lien avec la page Facebook du festival.

## Déploiement (GitHub Pages)

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) déploie
automatiquement à chaque push. Si le premier run échoue avec une erreur Pages :
*Settings → Pages → Source : GitHub Actions*, puis relancer le workflow.

Aucun build : c'est du HTML/CSS/JS statique (Leaflet vendorisé). En local :
`python3 -m http.server` puis <http://localhost:8000>.

## Publier une alerte pendant le festival

1. Ouvrir `admin.html` (déployé avec l'app) → composer l'actu → copier le JSON.
2. Éditer `updates.json` sur GitHub (ça se fait très bien depuis un téléphone) et
   coller l'objet dans le tableau `updates` → commit.
3. Les apps la récupèrent en ≤ 5 minutes. Automatisation possible via VPS
   (RSS-Bridge) : voir [tools/facebook-sync](tools/facebook-sync/README.md).

## Notes sur les données

- Sources : grilles horaires, fiches spectacles, pages lieux/parcours du programme
  officiel. En cas de divergence dans le PDF (ex. ANTI samedi, Comment faire… samedi),
  la grille horaire + les parcours font foi.
- Coordonnées GPS des lieux **approximatives** (~50 m) ; le bouton « Y aller » utilise
  l'adresse, pas les coordonnées.
- Photos : © crédits indiqués sur chaque fiche (programme officiel).

App non-officielle, réalisée pour un usage entre amis.
