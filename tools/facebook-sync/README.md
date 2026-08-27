# Sync Facebook → updates.json (optionnel, VPS)

L'app lit le fichier `updates.json` (même origine que l'app) toutes les ~5 minutes
et affiche les nouveautés : bannière 🔔, badge, et marquage **Retardé/Annulé** sur
les représentations concernées.

## Option A — 100 % GitHub Pages (zéro serveur, recommandé)

Pendant le festival, quand la page Facebook du FARSe annonce un retard/une
annulation :

1. Ouvrez `admin.html` de l'app (ex. `https://<user>.github.io/farse/admin.html`),
   composez l'actu (elle vous propose la liste des spectacles et de leurs
   représentations) et copiez le JSON généré.
2. Sur GitHub (site ou app mobile), éditez `updates.json` → collez l'objet dans le
   tableau `updates` → commit sur la branche déployée.
3. GitHub Pages redéploie automatiquement ; les téléphones des festivaliers voient
   l'actu à leur prochaine vérification (≤ 5 min, app ouverte).

C'est manuel mais fiable, et il n'y a de toute façon pas d'API Facebook publique :
une lecture automatique demande un scraping fragile.

## Option B — VPS + RSS-Bridge (automatique)

1. Hébergez [RSS-Bridge](https://github.com/RSS-Bridge/rss-bridge) sur votre VPS
   (image Docker officielle `rssbridge/rss-bridge`), activez `FacebookBridge`.
2. Vérifiez que le flux fonctionne :
   `https://rss.mon-vps.fr/?action=display&bridge=FacebookBridge&context=User&u=Festivalfarse&format=Atom`
   (le bridge Facebook est fragile : testez avant le festival ; sinon retour à l'option A).
3. Cron toutes les 10 min sur le VPS :

   ```cron
   */10 * * * * cd /srv/farse && RSS_URL="https://rss.mon-vps.fr/?action=...&format=Atom" OUT=updates.json node tools/facebook-sync/fb-sync.mjs && git diff --quiet updates.json || (git commit -am "maj actus" && git push)
   ```

   Variante sans Git : servez l'app directement depuis le VPS (nginx) et écrivez
   `updates.json` dans le dossier servi — la mise à jour est alors instantanée.

Le script `fb-sync.mjs` classe les posts (retard/annulation/info) par mots-clés et
essaie de relier chaque post à un spectacle par son titre. Relisez ce qu'il publie :
il vaut mieux compléter `perfIds` à la main (via `admin.html`) pour que l'app marque
précisément les bonnes représentations.

## Vraies notifications push ?

L'app affiche des notifications système quand elle est **ouverte** (permission
demandée dans Infos). Des push « app fermée » demanderaient un serveur Web Push
(VAPID) + abonnements ; faisable sur le VPS mais volontairement hors périmètre v1.
