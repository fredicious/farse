/* FARSe 2026 — application (vanilla JS, offline-first) */
(() => {
  const { DAYS, VENUES, SHOWS, PERFS, PARCOURS, INFOS, showById, venueById, perfById, dayById } = window.FARSE;

  /* ---------- Utils ---------- */
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = s => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const fmtTime = t => t.replace(":", "h");
  const fmtDur = m => m == null ? "" : (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}` : `${m} min`);
  const toast = msg => {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    $("#toast-root").appendChild(t);
    setTimeout(() => t.remove(), 2300);
  };

  /* ---------- Local storage (offline-first, tout reste sur l'appareil) ---------- */
  const store = {
    get(k, dflt) { try { const v = localStorage.getItem("farse:" + k); return v == null ? dflt : JSON.parse(v); } catch { return dflt; } },
    set(k, v) { try { localStorage.setItem("farse:" + k, JSON.stringify(v)); } catch {} },
  };
  let favs = new Set(store.get("favs", []));
  let plan = new Set(store.get("plan", []));            // perfIds de « Mon parcours »
  let savedParcours = store.get("savedParcours", []);   // parcours nommés [{id, name, ids, ts}]
  const saveSavedParcours = () => store.set("savedParcours", savedParcours);
  let seenUpdates = new Set(store.get("seenUpdates", []));
  let updates = store.get("updates", []);                // dernier flux connu
  const saveFavs = () => store.set("favs", [...favs]);
  const savePlan = () => store.set("plan", [...plan]);

  /* ---------- Statut des représentations (flux d'actualités) ---------- */
  // perfId -> {type:'cancel'|'delay', newTime?, title}
  const perfStatus = () => {
    const m = {};
    for (const u of updates) {
      if (!u.perfIds || (u.type !== "cancel" && u.type !== "delay")) continue;
      for (const pid of u.perfIds) m[pid] = { type: u.type, newTime: u.newTime, title: u.title };
    }
    return m;
  };
  let statusMap = perfStatus();

  const statusFlag = pid => {
    const s = statusMap[pid];
    if (!s) return "";
    if (s.type === "cancel") return ` <span class="status-flag cancel">Annulé</span>`;
    return ` <span class="status-flag delay">Retardé${s.newTime ? " → " + esc(s.newTime) : ""}</span>`;
  };

  /* ---------- Favoris & parcours ---------- */
  const toggleFav = id => {
    if (favs.has(id)) { favs.delete(id); toast("Retiré des favoris"); }
    else { favs.add(id); toast("❤️ Ajouté aux favoris"); }
    saveFavs(); rerender();
  };
  const togglePlan = pid => {
    if (plan.has(pid)) { plan.delete(pid); toast("Retiré de mon parcours"); }
    else { plan.add(pid); toast("➕ Ajouté à mon parcours"); }
    savePlan(); rerender();
  };

  /* ---------- Navigation (Google Maps + géo) ---------- */
  const navUrl = v => {
    const q = encodeURIComponent(`${v.name}, ${v.id === 21 ? "Ostwald" : "Strasbourg"}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=walking`;
  };

  /* ---------- Rendu : cartes spectacle ---------- */
  const genreClass = g => ({ danse: "g-danse", cirque: "g-cirque", theatre: "g-theatre", musique: "g-musique", village: "g-village" }[g] || "");
  const PLACEHOLDERS = { cirque: "🎪", danse: "💃", theatre: "🎭", musique: "🎵", village: "🎨" };

  const timePills = show => {
    const byDay = {};
    for (const p of show.perfs) (byDay[p.day] ??= []).push(p);
    return DAYS.filter(d => byDay[d.id]).map(d => {
      const times = byDay[d.id].map(p => {
        const s = statusMap[p.id];
        return `<span class="time-pill${s?.type === "cancel" ? " cancelled" : ""}"><span class="d">${esc(d.short)}</span>${fmtTime(p.time)}${p.note && p.day === "jeu" ? " (Ostwald)" : ""}</span>`;
      });
      return times.join("");
    }).join("");
  };

  // Carte spectacle, partagée entre les vues.
  // Sans opts : mode « Spectacles » (pastilles d'horaires). Avec opts.perf : mode
  // « Programme / Mon parcours » (lieu à la place des horaires, bouton ➕ ou ✕).
  const showCard = (show, opts = {}) => {
    const p = opts.perf;
    const img = show.img
      ? `<img class="show-thumb" src="${show.img}" alt="" loading="lazy">`
      : `<div class="show-thumb ph">${PLACEHOLDERS[show.group] || "🎪"}</div>`;
    const meta = [fmtDur(p ? p.duration : show.duration) || (p && !p.duration ? "en continu" : ""), show.audience].filter(Boolean).join(" · ");
    const title = p && p.kind === "rencontre" ? `Rencontre · ${show.title}` : show.title;
    const bottom = p
      ? `<div class="show-loc">📍 ${esc(p.venue.name)}</div>${p.note ? `<div class="show-note">${esc(p.note)}</div>` : ""}`
      : `<div class="times-row">${timePills(show)}</div>`;
    // pas de cœur sur les rencontres : le favori appartient au spectacle lui-même
    const actions = opts.removable
      ? `<button class="remove-x" data-unplan="${p.id}" aria-label="Retirer">✕</button>`
      : (p && p.kind === "rencontre" ? "" : `<button class="${favs.has(show.id) ? "on" : ""}" data-fav="${show.id}" aria-label="Favori">❤️</button>`) +
        (p ? `<button class="${plan.has(p.id) ? "on" : ""}" data-plan="${p.id}" aria-label="Mon parcours">➕</button>` : "");
    return `<article class="show-card${p ? " " + p.kind : ""}" data-show="${show.id}">
      ${img}
      <div class="show-body">
        <span class="genre-tag ${genreClass(show.group)}">${esc(show.genre)}</span>
        <div class="show-title">${esc(title)}${p ? statusFlag(p.id) : ""}</div>
        <div class="show-co">${esc(show.company)}</div>
        ${meta ? `<div class="show-meta">${esc(meta)}</div>` : ""}
        ${bottom}
        ${opts.warn ? `<div class="show-note" style="color:var(--warn)">⚠️ Chevauchement avec un autre créneau</div>` : ""}
      </div>
      <div class="card-actions">${actions}</div>
    </article>`;
  };

  /* ---------- Vue : Spectacles ---------- */
  let searchQ = store.get("searchQ", "");
  // filtres multi-sélection : OU à l'intérieur d'un groupe, ET entre groupes
  const filters = { day: new Set(), group: new Set(), aud: new Set() };
  const minAge = s => { const m = /(\d+)\s*ans/.exec(s.audience || ""); return m ? +m[1] : null; };

  function viewSpectacles(el) {
    const chips = [
      ["day:ven", "Ven 28"], ["day:sam", "Sam 29"], ["day:dim", "Dim 30"],
      ["group:danse", "Danse"], ["group:cirque", "Cirque"], ["group:theatre", "Théâtre"], ["group:musique", "Musique"], ["group:village", "Village"],
      ["aud:tp", "Tout public"], ["aud:3", "3+"], ["aud:5", "5+"], ["aud:6", "6+"], ["aud:7", "7+"], ["aud:10", "10+"], ["aud:12", "12+"],
    ];
    const anyFilter = filters.day.size || filters.group.size || filters.aud.size;
    const q = norm(searchQ);
    const matches = s => {
      if (q && !(norm(s.title).includes(q) || norm(s.company).includes(q) || norm(s.genre).includes(q)
        || s.venueIds.some(v => norm(venueById[v].name).includes(q)))) return false;
      if (filters.day.size && ![...filters.day].some(d => s.perfs.some(p => p.day === d))) return false;
      if (filters.group.size && !filters.group.has(s.group)) return false;
      if (filters.aud.size) {
        const age = minAge(s);
        const ok = (filters.aud.has("tp") && age == null) || (age != null && filters.aud.has(String(age)));
        if (!ok) return false;
      }
      return true;
    };
    const main = SHOWS.filter(s => s.group !== "village" && matches(s));
    const village = SHOWS.filter(s => s.group === "village" && matches(s));

    const chipsScroll = $(".chips", el)?.scrollLeft || 0;
    el.className = "view";
    el.innerHTML = `
      <h1 class="page">Spectacles</h1>
      <div class="searchbar">🔍<input id="search" type="search" placeholder="Chercher un spectacle, une compagnie, un lieu…" value="${esc(searchQ)}" autocomplete="off"></div>
      <div class="chips">
        <button class="chip ${anyFilter ? "" : "on"}" data-chip="all">Tous</button>
        ${chips.map(([id, l]) => {
          const [g, v] = id.split(":");
          return `<button class="chip ${filters[g].has(v) ? "on" : ""}" data-chip="${id}">${l}</button>`;
        }).join("")}
      </div>
      ${main.map(showCard).join("") || (village.length ? "" : `<div class="empty"><span class="big">🫥</span>Aucun résultat pour cette recherche.</div>`)}
      ${village.length ? `<h2 class="section">Au Village du FARSe</h2>${village.map(showCard).join("")}` : ""}
    `;
    $(".chips", el).scrollLeft = chipsScroll;
    $("#search", el).addEventListener("input", e => {
      searchQ = e.target.value; store.set("searchQ", searchQ);
      clearTimeout(viewSpectacles._t);
      viewSpectacles._t = setTimeout(() => { viewSpectacles(el); const i = $("#search", el); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 200);
    });
    el.querySelectorAll("[data-chip]").forEach(b => b.addEventListener("click", () => {
      const id = b.dataset.chip;
      if (id === "all") { filters.day.clear(); filters.group.clear(); filters.aud.clear(); }
      else {
        const [g, v] = id.split(":");
        filters[g].has(v) ? filters[g].delete(v) : filters[g].add(v);
      }
      viewSpectacles(el);
    }));
  }

  /* ---------- Battement entre deux étapes (temps de marche estimé) ---------- */
  const fmtMin = m => `${String(Math.floor(m / 60)).padStart(2, "0")}h${String(m % 60).padStart(2, "0")}`;
  const walkMin = (a, b) => {
    if (!a || !b || a.id === b.id) return 0;
    const rad = x => x * Math.PI / 180;
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
    const dist = 2 * 6371e3 * Math.asin(Math.sqrt(h)) * 1.35; // facteur voirie (on ne marche pas à vol d'oiseau)
    return Math.max(1, Math.round(dist / 75)); // ~4,5 km/h
  };
  function gapHTML(prevEnd, nextStart, vA, vB) {
    if (prevEnd == null || nextStart == null) return "";
    const gap = nextStart - prevEnd;
    if (gap < 0) return `<div class="tl-gap bad">⚠️ Chevauchement de ${-gap} min</div>`;
    const walk = walkMin(vA, vB);
    if (!walk) return `<div class="tl-gap ok">⏱ ${gap} min de battement · même lieu</div>`;
    const slack = gap - walk;
    if (slack < 0) return `<div class="tl-gap bad">⚠️ Trop court : ~${walk} min à pied pour ${gap} min de battement</div>`;
    return `<div class="tl-gap ${slack < 8 ? "tight" : "ok"}">🚶 ~${walk} min à pied · ${gap} min de battement</div>`;
  }

  /* ---------- Timeline (partagée) ---------- */
  function timelineHTML(perfs, { removable = false } = {}) {
    const groups = {};
    for (const p of perfs) (groups[p.time] ??= []).push(p);
    const times = Object.keys(groups).sort();
    // détection de chevauchements (pour Mon parcours)
    const overlaps = new Set();
    if (removable) {
      const arr = [...perfs].sort((a, b) => a.startMin - b.startMin);
      for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
        if (arr[j].startMin < (arr[i].endMin ?? arr[i].startMin + 60)) { overlaps.add(arr[i].id); overlaps.add(arr[j].id); }
      }
    }
    // battements entre étapes consécutives (Mon parcours uniquement)
    const gapAfter = {};
    if (removable) {
      for (let i = 0; i < times.length - 1; i++) {
        const prevs = groups[times[i]].filter(p => p.endMin != null);
        if (!prevs.length) continue;
        const prev = prevs.reduce((a, b) => a.endMin >= b.endMin ? a : b);
        const next = groups[times[i + 1]][0];
        gapAfter[times[i]] = gapHTML(prev.endMin, next.startMin, prev.venue, next.venue);
      }
    }
    return times.map(t => `<div class="tl-group">
      <div class="tl-time">${fmtTime(t)}</div>
      <div class="tl-items">${groups[t].map(p =>
        showCard(p.show, { perf: p, removable, warn: removable && overlaps.has(p.id) })
      ).join("")}${gapAfter[t] || ""}</div>
    </div>`).join("");
  }

  /* ---------- Vue : Programme ---------- */
  const PROG_DAYS = DAYS.filter(d => !d.pre); // le jeudi (avant-première à Ostwald) reste visible sur la fiche Épiphytes
  let curDay = store.get("curDay", null) || (() => {
    const today = new Date().toISOString().slice(0, 10);
    return (PROG_DAYS.find(d => d.date === today) || PROG_DAYS[0]).id;
  })();
  if (!PROG_DAYS.some(d => d.id === curDay)) curDay = PROG_DAYS[0].id;

  function viewProgramme(el) {
    const day = dayById[curDay] || PROG_DAYS[0];
    const perfs = PERFS.filter(p => p.day === day.id).sort((a, b) => a.startMin - b.startMin);
    const today = new Date().toISOString().slice(0, 10);
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

    let html = `<h1 class="page">Programme</h1>
      <div class="day-tabs">${PROG_DAYS.map(d => `<button class="day-tab ${d.id === curDay ? "on" : ""}" data-day="${d.id}">${d.short}</button>`).join("")}</div>`;

    if (day.date === today) {
      const before = perfs.filter(p => p.startMin <= nowMin);
      const after = perfs.filter(p => p.startMin > nowMin);
      html += timelineHTML(before) + `<div class="now-line">MAINTENANT · ${String(Math.floor(nowMin / 60)).padStart(2, "0")}h${String(nowMin % 60).padStart(2, "0")}</div>` + timelineHTML(after);
    } else {
      html += timelineHTML(perfs);
    }
    el.className = "view";
    el.innerHTML = html;
    el.querySelectorAll("[data-day]").forEach(b => b.addEventListener("click", () => { curDay = b.dataset.day; store.set("curDay", curDay); viewProgramme(el); }));
  }

  /* ---------- Vue : Carte ---------- */
  let mainMap = null, focusVenue = null;

  function viewCarte(el) {
    el.className = "view full";
    el.innerHTML = `<div id="map"></div>`;
    // Leaflet a besoin d'un conteneur affiché
    requestAnimationFrame(() => {
      mainMap = L.map("map", { zoomControl: false }).setView([48.5805, 7.7550], 14);
      L.control.zoom({ position: "bottomright" }).addTo(mainMap);
      addTiles(mainMap);
      const bounds = [];
      for (const v of VENUES) {
        const icon = L.divIcon({ className: "", html: `<div class="venue-pin ${v.id === 20 ? "village-pin" : ""}">${v.id === 20 ? "V" : v.id === 21 ? "O" : v.id}</div>`, iconSize: [30, 30], iconAnchor: [15, 28] });
        const m = L.marker([v.lat, v.lng], { icon }).addTo(mainMap);
        m.bindPopup(venuePopup(v), { maxWidth: 260 });
        if (!v.offMap) bounds.push([v.lat, v.lng]);
        if (focusVenue === v.id) setTimeout(() => { mainMap.setView([v.lat, v.lng], 17); m.openPopup(); }, 150);
      }
      if (!focusVenue) mainMap.fitBounds(bounds, { padding: [30, 30] });
      focusVenue = null;
      mainMap.on("popupopen", e => bindShowLinks(e.popup.getElement()));
    });
  }

  function venuePopup(v) {
    const upcoming = PERFS.filter(p => p.venueId === v.id).sort((a, b) => a.date === b.date ? a.startMin - b.startMin : a.date < b.date ? -1 : 1);
    const seen = new Set();
    const lines = upcoming.filter(p => p.kind !== "rencontre").filter(p => !seen.has(p.showId) && seen.add(p.showId)).slice(0, 5)
      .map(p => {
        const s = p.show;
        const days = DAYS.filter(d => s.perfs.some(x => x.day === d.id && x.venueId === v.id));
        const times = days.map(d => `${d.short.split(" ")[0]} ${s.perfs.filter(x => x.day === d.id && x.venueId === v.id).map(x => fmtTime(x.time)).join("/")}`).join(" · ");
        return `<a class="pop-show" href="#/show/${s.id}"><b>${esc(s.title)}</b><span class="pt">${times}</span></a>`;
      }).join("");
    return `<div class="pop-venue">${v.id <= 20 ? (v.id === 20 ? "🏕️ " : v.id + " · ") : ""}${esc(v.name)}</div>
      ${v.access ? `<div class="pop-access">${esc(v.access)}</div>` : ""}
      ${lines || `<div class="pop-access">Animations du Village en continu (12h–minuit)</div>`}
      <a class="pop-nav" href="${navUrl(v)}" target="_blank" rel="noopener">🧭 Y aller</a>`;
  }

  function addTiles(map) {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
  }

  /* ---------- Vue : Mon FARSe ---------- */
  let monTab = store.get("monTab", "plan");

  function viewMonFarse(el) {
    el.className = "view";
    let body = "";
    if (monTab === "favs") {
      const list = SHOWS.filter(s => favs.has(s.id));
      body = list.map(showCard).join("") ||
        `<div class="empty"><span class="big">🤍</span>Aucun favori pour l'instant.<br>Touchez le ❤️ d'un spectacle pour le retrouver ici.</div>`;
    } else if (monTab === "plan") {
      const perfs = [...plan].map(id => perfById[id]).filter(Boolean);
      if (!perfs.length) {
        body = `<div class="empty"><span class="big">🗓️</span>Votre parcours est vide.<br>Ajoutez des créneaux avec le bouton ➕ depuis le programme ou la fiche d'un spectacle — ou copiez un parcours proposé par le festival.</div>`;
      } else {
        body = DAYS.filter(d => perfs.some(p => p.day === d.id)).map(d =>
          `<h2 class="section">${d.long}</h2>` + timelineHTML(perfs.filter(p => p.day === d.id).sort((a, b) => a.startMin - b.startMin), { removable: true })
        ).join("");
        body += `<div class="btn-row">
          <button class="btn ghost" id="btn-ics">📅 Exporter (.ics)</button>
          <button class="btn ghost" id="btn-share">📤 Partager</button>
        </div>
        <div class="btn-row"><button class="btn ghost" id="btn-save-plan">💾 Enregistrer sous…</button></div>`;
      }
    } else {
      body = `<p style="color:var(--muted);font-size:13px;margin:2px 2px 12px">Deux parcours concoctés sur-mesure par le festival, pour samedi et dimanche.</p>` +
        PARCOURS.map(pc => {
          const d = dayById[pc.day];
          return `<div class="parcours-card" data-parcours="${pc.id}">
            <h3>${pc.icon} Parcours ${esc(pc.name)} · ${esc(d.short)}</h3>
            <p>${esc(pc.blurb)}</p>
            <p style="margin-top:6px;color:var(--accent2);font-weight:700">${pc.items.length} étapes · voir le détail →</p>
          </div>`;
        }).join("");
      if (savedParcours.length) {
        body += `<h2 class="section">Mes parcours enregistrés</h2>` +
          savedParcours.map(sp => `<div class="parcours-card" data-saved="${sp.id}">
            <h3>💾 ${esc(sp.name)}</h3>
            <p>${sp.ids.length} créneau${sp.ids.length > 1 ? "x" : ""} · enregistré le ${new Date(sp.ts).toLocaleDateString("fr-FR")}</p>
          </div>`).join("");
      }
    }
    el.innerHTML = `
      <h1 class="page">Mon FARSe</h1>
      <div class="seg">
        <button data-seg="plan" class="${monTab === "plan" ? "on" : ""}">Mon parcours</button>
        <button data-seg="favs" class="${monTab === "favs" ? "on" : ""}">Favoris</button>
        <button data-seg="official" class="${monTab === "official" ? "on" : ""}">Parcours</button>
      </div>${body}`;
    el.querySelectorAll("[data-seg]").forEach(b => b.addEventListener("click", () => { monTab = b.dataset.seg; store.set("monTab", monTab); viewMonFarse(el); }));
    $("#btn-ics", el)?.addEventListener("click", exportICS);
    $("#btn-share", el)?.addEventListener("click", sharePlan);
    $("#btn-save-plan", el)?.addEventListener("click", () => {
      const name = (window.prompt("Nom de ce parcours ?", "Mon parcours FARSe") || "").trim();
      if (!name) return;
      savedParcours.push({ id: "sp-" + Date.now().toString(36), name, ids: [...plan], ts: Date.now() });
      saveSavedParcours();
      toast(`💾 « ${name} » enregistré`);
    });
  }

  /* ---------- Export / partage du parcours ---------- */
  function exportICS() {
    const perfs = [...plan].map(id => perfById[id]).filter(Boolean).sort((a, b) => a.date === b.date ? a.startMin - b.startMin : a.date < b.date ? -1 : 1);
    const dt = (date, min) => date.replace(/-/g, "") + "T" + String(Math.floor(min / 60)).padStart(2, "0") + String(min % 60).padStart(2, "0") + "00";
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FARSe 2026//FR", "CALSCALE:GREGORIAN"];
    for (const p of perfs) {
      lines.push("BEGIN:VEVENT",
        `UID:${p.id}@farse2026`,
        `DTSTART;TZID=Europe/Paris:${dt(p.date, p.startMin)}`,
        `DTEND;TZID=Europe/Paris:${dt(p.date, p.endMin ?? p.startMin + 60)}`,
        `SUMMARY:${(p.kind === "rencontre" ? "Rencontre · " : "") + p.show.title.replace(/([,;])/g, "\\$1")}`,
        `LOCATION:${(p.venue.name + ", Strasbourg").replace(/([,;])/g, "\\$1")}`,
        "END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "mon-parcours-farse-2026.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  const sortPerfs = perfs => [...perfs].sort((a, b) => a.date === b.date ? a.startMin - b.startMin : a.date < b.date ? -1 : 1);
  const parcoursBody = perfs => DAYS.filter(d => perfs.some(p => p.day === d.id)).map(d =>
    `<h2 class="section">${d.long}</h2>` + timelineHTML(perfs.filter(p => p.day === d.id).sort((a, b) => a.startMin - b.startMin))
  ).join("");

  function shareParcoursLink(perfs, title) {
    // tout l'état du parcours vit dans l'URL : liste d'ids de représentations
    const url = `${location.origin}${location.pathname}#/p/${perfs.map(p => p.id).join(",")}`;
    const txt = `${title} :\n` + perfs.map(p =>
      `• ${dayById[p.day].short} ${fmtTime(p.time)} — ${p.kind === "rencontre" ? "Rencontre · " : ""}${p.show.title} (${p.venue.name})`).join("\n");
    if (navigator.share) navigator.share({ title, text: txt, url }).catch(() => {});
    else { navigator.clipboard?.writeText(`${txt}\n\n${url}`); toast("Lien du parcours copié 📋"); }
  }

  function sharePlan() {
    sharePerfsOfPlan();
  }
  const sharePerfsOfPlan = () => shareParcoursLink(sortPerfs([...plan].map(id => perfById[id]).filter(Boolean)), "Mon parcours FARSe 2026");

  /* ---------- Parcours partagé (état porté par l'URL, #/p/id1,id2,…) ---------- */
  function openSharedParcours(idsStr) {
    const ids = decodeURIComponent(idsStr || "").split(",").filter(Boolean);
    const perfs = ids.map(id => perfById[id]).filter(Boolean);
    const unknown = ids.length - perfs.length;
    const root = $("#sheet-root");
    root.innerHTML = `
      <div class="sheet-backdrop" data-close></div>
      <div class="sheet" role="dialog">
        <button class="sheet-close" data-close>✕</button>
        <div class="sheet-pad" style="padding-top:0">
          <div class="sheet-title">🔗 Parcours partagé</div>
          <div class="sheet-co">${perfs.length} créneau${perfs.length > 1 ? "x" : ""} — envoyé par un·e ami·e</div>
          ${unknown ? `<p style="color:var(--warn);font-size:12.5px">⚠️ ${unknown} créneau(x) du lien n'ont pas été reconnus (lien tronqué ?).</p>` : ""}
          ${perfs.length
            ? `<div class="btn-row"><button class="btn" id="btn-adopt-parcours">➕ Tout ajouter à mon parcours</button></div>
               <div class="save-row">
                 <input id="save-name" placeholder="Nom (ex. Samedi avec Léa)" maxlength="40" autocomplete="off">
                 <button class="btn ghost" id="btn-save-parcours">💾 Enregistrer</button>
               </div>${parcoursBody(perfs)}`
            : `<div class="empty"><span class="big">🤷</span>Ce lien ne contient aucun créneau lisible.</div>`}
        </div>
      </div>`;
    $("#btn-adopt-parcours")?.addEventListener("click", () => {
      let n = 0;
      for (const p of perfs) if (!plan.has(p.id)) { plan.add(p.id); n++; }
      savePlan();
      toast(n ? `${n} créneau(x) ajoutés à mon parcours` : "Déjà tout dans votre parcours");
      location.hash = "#/monfarse";
    });
    $("#btn-save-parcours")?.addEventListener("click", () => {
      const name = $("#save-name").value.trim() || `Parcours partagé du ${new Date().toLocaleDateString("fr-FR")}`;
      savedParcours.push({ id: "sp-" + Date.now().toString(36), name, ids: perfs.map(p => p.id), ts: Date.now() });
      saveSavedParcours();
      monTab = "official"; store.set("monTab", monTab);
      toast(`💾 « ${name} » enregistré`);
      location.hash = "#/monfarse";
    });
  }

  /* ---------- Parcours enregistré sur l'appareil ---------- */
  function openSavedParcours(id) {
    const sp = savedParcours.find(s => s.id === id);
    if (!sp) return closeSheet();
    const perfs = sortPerfs(sp.ids.map(i => perfById[i]).filter(Boolean));
    const root = $("#sheet-root");
    root.innerHTML = `
      <div class="sheet-backdrop" data-close></div>
      <div class="sheet" role="dialog">
        <button class="sheet-close" data-close>✕</button>
        <div class="sheet-pad" style="padding-top:0">
          <div class="sheet-title">💾 ${esc(sp.name)}</div>
          <div class="sheet-co">${perfs.length} créneau${perfs.length > 1 ? "x" : ""} — enregistré sur cet appareil</div>
          <div class="btn-row">
            <button class="btn" id="btn-adopt-saved">➕ Tout ajouter à mon parcours</button>
          </div>
          <div class="btn-row">
            <button class="btn ghost" id="btn-share-saved">📤 Partager</button>
            <button class="btn ghost" id="btn-delete-saved" style="color:var(--danger)">🗑 Supprimer</button>
          </div>
          ${parcoursBody(perfs)}
        </div>
      </div>`;
    $("#btn-adopt-saved").addEventListener("click", () => {
      let n = 0;
      for (const p of perfs) if (!plan.has(p.id)) { plan.add(p.id); n++; }
      savePlan();
      toast(n ? `${n} créneau(x) ajoutés à mon parcours` : "Déjà tout dans votre parcours");
      location.hash = "#/monfarse";
    });
    $("#btn-share-saved").addEventListener("click", () => shareParcoursLink(perfs, sp.name));
    $("#btn-delete-saved").addEventListener("click", () => {
      if (!confirm(`Supprimer « ${sp.name} » ?`)) return;
      savedParcours = savedParcours.filter(s => s.id !== sp.id);
      saveSavedParcours();
      toast("Parcours supprimé");
      location.hash = "#/monfarse";
    });
  }

  /* ---------- Vue : Infos ---------- */
  function viewInfos(el) {
    el.className = "view";
    el.innerHTML = `
      <h1 class="page">Infos pratiques</h1>
      <div class="info-card">
        <h3>🎪 ${esc(INFOS.festival)}</h3>
        <p>${esc(INFOS.dates)} — spectacles <b>gratuits</b>, dans l'espace public.</p>
        <p><a href="${INFOS.site}" target="_blank" rel="noopener">ete.strasbourg.eu</a> · <a href="${INFOS.facebook}" target="_blank" rel="noopener">Facebook ${esc(INFOS.hashtag)}</a></p>
      </div>
      <div class="info-card">
        <h3>🏕️ ${esc(INFOS.village.name)}</h3>
        <p><b>${esc(INFOS.village.where)}</b><br>${esc(INFOS.village.hours)}</p>
        <p>${esc(INFOS.village.blurb)}</p>
      </div>
      <div class="info-card">
        <h3>ℹ️ Le Point info</h3>
        <p><b>${esc(INFOS.pointInfo.where)}</b></p>
        <ul>${INFOS.pointInfo.hours.map(h => `<li>${esc(h)}</li>`).join("")}</ul>
      </div>
      <div class="info-card">
        <h3>🤝 Rencontres publiques</h3>
        <p>${esc(INFOS.rencontres)}</p>
        <ul>
          <li>Sam 29 · 18h30 — Cie Les Chaussons Rouges (aire de jeu du Jura)</li>
          <li>Sam 29 · 20h15 — Intrepidus Squad (place Saint-Pierre-le-Jeune)</li>
          <li>Dim 30 · 11h — Cie Joshua Monten (cour de l'école Schoepflin)</li>
          <li>Dim 30 · 18h15 — Joan Català (place Hans-Jean Arp)</li>
        </ul>
      </div>
      <div class="info-card">
        <h3>♿ Accessibilité & sur place</h3>
        <ul>${INFOS.access.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
      </div>
      <div class="info-card">
        <h3>🎒 Les indispensables</h3>
        <ul>${INFOS.tips.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
      </div>
      <div class="info-card">
        <h3>🎪 Actions de médiation</h3>
        <p>${esc(INFOS.mediation)}</p>
      </div>
      <div class="info-card">
        <h3>📞 Contact</h3>
        <p>${esc(INFOS.phone)} · <a href="mailto:${INFOS.email}">${esc(INFOS.email)}</a></p>
      </div>
      <div class="info-card">
        <h3>🔔 Actualités</h3>
        <p>Le bouton 🔔 en haut de l'app affiche le fil de la page Facebook officielle du festival (retards, annulations, infos de dernière minute). Vos favoris et votre parcours restent stockés uniquement sur votre téléphone.</p>
      </div>
      <p style="text-align:center;color:var(--muted);font-size:11.5px;margin:18px 0">
        App non-officielle réalisée à partir du programme officiel du FARSe 2026.<br>
        Positions des lieux approximatives — suivez la signalétique sur place.
      </p>`;
  }

  /* ---------- Fiche spectacle (sheet) ---------- */
  let miniMap = null;

  function openShow(id) {
    const s = showById[id];
    if (!s) return closeSheet();
    const root = $("#sheet-root");
    const perfLine = p => {
      const st = statusMap[p.id];
      return `<div class="perf-line">
        <div class="when">
          <b>${dayById[p.day].long} · ${fmtTime(p.time)}${statusFlag(p.id)}</b>
          <span>📍 ${esc(p.venue.name)}${p.duration ? " · " + fmtDur(p.duration) : ""}</span>
          ${p.note ? `<span class="note">${esc(p.note)}</span>` : ""}
        </div>
        <button class="add-parcours ${plan.has(p.id) ? "on" : ""}" data-plan="${p.id}">${plan.has(p.id) ? "✓ Parcours" : "+ Parcours"}</button>
      </div>`;
    };
    const venues = s.venueIds.map(v => venueById[v]);
    const v0 = venues[0];
    const alerts = updates.filter(u => u.showId === s.id || (u.perfIds || []).some(pid => perfById[pid]?.showId === s.id));
    root.innerHTML = `
      <div class="sheet-backdrop" data-close></div>
      <div class="sheet" role="dialog" aria-label="${esc(s.title)}">
        <button class="sheet-close" data-close>✕</button>
        ${s.img ? `<img class="sheet-hero" src="${s.img}" alt="">` : `<div class="sheet-hero ph">${PLACEHOLDERS[s.group] || "🎪"}</div>`}
        <div class="sheet-pad">
          <button class="sheet-fav ${favs.has(s.id) ? "on" : ""}" data-fav="${s.id}" aria-label="Favori">❤️</button>
          <span class="genre-tag ${genreClass(s.group)}">${esc(s.genre)}</span>
          <div class="sheet-title">${esc(s.title)}</div>
          <div class="sheet-co">${esc(s.company)}</div>
          <div class="facts">
            ${s.duration ? `<span class="fact">⏱ ${fmtDur(s.duration)}</span>` : ""}
            ${s.audience ? `<span class="fact">👥 ${esc(s.audience)}</span>` : ""}
          </div>
          ${alerts.map(u => `<div class="alert-box ${u.type}">${u.type === "cancel" ? "🚫" : u.type === "delay" ? "⏳" : "📣"} <b>${esc(u.title)}</b>${u.body ? `<br>${esc(u.body)}` : ""}</div>`).join("")}
          <h2 class="section">Horaires</h2>
          ${s.perfs.map(perfLine).join("")}
          ${s.meets.length ? `<h2 class="section">Rencontre avec les artistes</h2>${s.meets.map(perfLine).join("")}` : ""}
          <h2 class="section">Lieu${venues.length > 1 ? "x" : ""}</h2>
          ${venues.map(v => `<div class="venue-line"><b style="color:var(--text)">📍 ${esc(v.name)}</b>${v.access ? " — " + esc(v.access) : ""}</div>`).join("")}
          <div id="mini-map" class="mini-map"></div>
          <div class="btn-row">
            <a class="btn" href="${navUrl(v0)}" target="_blank" rel="noopener">🧭 Y aller</a>
            <button class="btn ghost" data-carte="${v0.id}">🗺️ Voir la carte</button>
          </div>
          <h2 class="section">Le spectacle</h2>
          <p class="desc">${esc(s.description)}</p>
          ${s.credit ? `<p class="credit">Photo : ${esc(s.credit)}</p>` : ""}
        </div>
      </div>`;
    requestAnimationFrame(() => {
      const mm = $("#mini-map");
      if (!mm) return;
      miniMap = L.map(mm, { zoomControl: false, dragging: false, scrollWheelZoom: false, tap: false });
      addTiles(miniMap);
      const pts = venues.map(v => {
        const icon = L.divIcon({ className: "", html: `<div class="venue-pin">${v.id === 20 ? "V" : v.id === 21 ? "O" : v.id}</div>`, iconSize: [30, 30], iconAnchor: [15, 28] });
        L.marker([v.lat, v.lng], { icon }).addTo(miniMap);
        return [v.lat, v.lng];
      });
      if (pts.length > 1) miniMap.fitBounds(pts, { padding: [40, 40] });
      else miniMap.setView(pts[0], 16);
      mm.addEventListener("click", () => { focusVenue = v0.id; location.hash = "#/carte"; });
    });
    root.querySelectorAll("[data-carte]").forEach(b => b.addEventListener("click", () => { focusVenue = +b.dataset.carte; location.hash = "#/carte"; }));
  }

  /* ---------- Parcours officiel (sheet) ---------- */
  function openParcours(id) {
    const pc = PARCOURS.find(p => p.id === id);
    if (!pc) return closeSheet();
    const d = dayById[pc.day];
    const root = $("#sheet-root");
    const toMin = t => t ? +t.slice(0, 2) * 60 + +t.slice(3, 5) : null;
    // étapes normalisées (heure de début/fin effective + lieu), pour les battements
    const steps = pc.items.map(it => {
      if (it.custom) {
        return { custom: it.custom, startMin: toMin(it.custom.start), endMin: toMin(it.custom.end), venue: venueById[it.custom.venueId] };
      }
      const p = perfById[it.perfId];
      const startMin = it.start ? toMin(it.start) : p.startMin;
      const endMin = it.end ? toMin(it.end) : p.endMin;
      return { p, label: it.label, startMin, endMin, venue: p.venue };
    });
    const rows = steps.map((st, i) => {
      const gap = i < steps.length - 1 ? gapHTML(st.endMin, steps[i + 1].startMin, st.venue, steps[i + 1].venue) : "";
      const until = st.endMin != null ? ` · jusqu'à ${fmtMin(st.endMin)}` : "";
      let card;
      if (st.custom) {
        card = `<div class="tl-card rencontre" ${st.custom.showId ? `data-show="${st.custom.showId}"` : ""}>
            <div class="t">${esc(st.custom.label)}</div>
            <div class="v">📍 ${esc(st.venue.name)}${until}</div>
          </div>`;
      } else {
        const p = st.p;
        const title = st.label || (p.kind === "rencontre" ? `Rencontre · ${p.show.title}` : p.show.title);
        card = `<div class="tl-card ${p.kind}" data-show="${p.showId}">
            <div class="t">${esc(title)}${statusFlag(p.id)}</div>
            <div class="v">📍 ${esc(p.venue.name)}${until}</div>
            <div class="tl-actions"><button class="${plan.has(p.id) ? "on" : ""}" data-plan="${p.id}">➕</button></div>
          </div>`;
      }
      return `<div class="tl-group"><div class="tl-time">${fmtMin(st.startMin)}</div><div class="tl-items">${card}${gap}</div></div>`;
    }).join("");
    root.innerHTML = `
      <div class="sheet-backdrop" data-close></div>
      <div class="sheet" role="dialog">
        <button class="sheet-close" data-close>✕</button>
        <div class="sheet-pad" style="padding-top:0">
          <div class="sheet-title">${pc.icon} Parcours ${esc(pc.name)}</div>
          <div class="sheet-co">${esc(d.long)} — proposé par le festival</div>
          <p style="color:var(--muted);font-size:13px">${esc(pc.blurb)}</p>
          <div class="btn-row"><button class="btn" id="btn-copy-parcours">➕ Tout ajouter à mon parcours</button></div>
          ${rows}
        </div>
      </div>`;
    $("#btn-copy-parcours").addEventListener("click", () => {
      let n = 0;
      for (const it of pc.items) if (it.perfId && !plan.has(it.perfId)) { plan.add(it.perfId); n++; }
      savePlan();
      toast(n ? `${n} créneaux ajoutés à mon parcours` : "Déjà dans votre parcours");
      openParcours(id); rerenderBase();
    });
  }

  /* ---------- Actualités (fil Facebook du festival + alertes éventuelles) ---------- */
  function openUpdates() {
    const root = $("#sheet-root");
    updates.forEach(u => seenUpdates.add(u.id));
    store.set("seenUpdates", [...seenUpdates]);
    refreshBadge();
    const fmtTs = ts => { try { return new Date(ts).toLocaleString("fr-FR", { weekday: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
    const list = [...updates].sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
    // Plugin officiel « Page » de Facebook : iframe, sans SDK ni compte développeur.
    const fbW = Math.min(500, Math.max(280, window.innerWidth - 32));
    const fbSrc = "https://www.facebook.com/plugins/page.php?" + new URLSearchParams({
      href: INFOS.facebook, tabs: "timeline", width: fbW, height: 620,
      small_header: "true", hide_cover: "false", show_facepile: "false", locale: "fr_FR",
    });
    root.innerHTML = `
      <div class="sheet-backdrop" data-close></div>
      <div class="sheet" role="dialog">
        <button class="sheet-close" data-close>✕</button>
        <div class="sheet-pad" style="padding-top:0">
          <div class="sheet-title">🔔 Actualités du festival</div>
          <p style="color:var(--muted);font-size:12.5px">Le fil de la page Facebook officielle du FARSe — retards, annulations et infos de dernière minute y sont annoncés.</p>
          ${list.length ? `<div class="updates-list">
            ${list.map(u => `<div class="u ${u.type || "info"}" ${u.showId ? `data-show="${u.showId}"` : ""}>
              <h4>${u.type === "cancel" ? "🚫" : u.type === "delay" ? "⏳" : "📣"} ${esc(u.title)}</h4>
              ${u.body ? `<p>${esc(u.body)}</p>` : ""}
              <div class="m">${fmtTs(u.ts)}${u.showId && showById[u.showId] ? " · " + esc(showById[u.showId].title) + " →" : ""}</div>
            </div>`).join("")}
          </div>` : ""}
          <div class="btn-row">
            <a class="btn" href="${INFOS.facebook}" target="_blank" rel="noopener">📘 Ouvrir la page Facebook</a>
          </div>
          <div class="btn-row">
            <a class="btn ghost" href="${INFOS.site}" target="_blank" rel="noopener">🌐 ete.strasbourg.eu (site officiel)</a>
          </div>
          <details class="fb-details">
            <summary>Afficher le fil Facebook intégré</summary>
            <p style="color:var(--muted);font-size:12px;margin:8px 0">En Europe, Facebook n'affiche le fil intégré que si vous êtes connecté·e à Facebook dans ce navigateur (règle de Meta, indépendante de l'app).</p>
            <div class="fb-embed" data-fb-src="${esc(fbSrc)}" data-fb-w="${fbW}"></div>
          </details>
        </div>
      </div>`;
    // l'iframe n'est injectée qu'à l'ouverture du dépliant (inutile de charger Facebook sinon)
    $(".fb-details", root).addEventListener("toggle", e => {
      const box = $(".fb-embed", root);
      if (e.target.open && box && !box.firstChild) {
        box.innerHTML = `<iframe src="${box.dataset.fbSrc}" width="${box.dataset.fbW}" height="620"
          style="border:none;overflow:hidden;border-radius:12px;display:block;margin:0 auto;background:#fff"
          scrolling="no" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
      }
    });
  }

  /* ---------- Flux updates.json ---------- */
  async function fetchUpdates(manual = false) {
    try {
      const res = await fetch(`updates.json?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const fresh = Array.isArray(data.updates) ? data.updates : [];
      const newOnes = fresh.filter(u => !seenUpdates.has(u.id));
      updates = fresh;
      store.set("updates", updates);
      statusMap = perfStatus();
      refreshBadge();
      if (newOnes.length) {
        rerenderBase();
        notify(newOnes);
        if (manual) toast(`${newOnes.length} nouvelle(s) actualité(s)`);
      } else if (manual) toast("Aucune nouveauté — tout est à jour ✅");
    } catch {
      if (manual) toast("Impossible de vérifier (hors-ligne ?)");
    }
  }

  function refreshBadge() {
    const n = updates.filter(u => !seenUpdates.has(u.id)).length;
    const b = $("#updates-badge");
    b.textContent = n;
    b.classList.toggle("hidden", n === 0);
  }

  async function notify(newOnes) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    for (const u of newOnes.slice(0, 3)) {
      const title = (u.type === "cancel" ? "🚫 " : u.type === "delay" ? "⏳ " : "📣 ") + u.title;
      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (reg) reg.showNotification(title, { body: u.body || "", icon: "icons/icon-192.png", tag: u.id });
        else new Notification(title, { body: u.body || "" });
      } catch {}
    }
  }

  /* ---------- Router ---------- */
  const VIEWS = { spectacles: viewSpectacles, programme: viewProgramme, carte: viewCarte, monfarse: viewMonFarse, infos: viewInfos };
  let baseRoute = "programme";

  function closeSheet() {
    $("#sheet-root").innerHTML = "";
    if (miniMap) { miniMap.remove(); miniMap = null; }
  }

  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [seg, arg] = h.split("/");
    closeSheet();
    const ensureBase = () => { if (!$("#view").firstChild) renderBase(); };
    if (seg === "show" && arg) { ensureBase(); openShow(arg); }
    else if (seg === "parcours" && arg) { ensureBase(); openParcours(arg); }
    else if (seg === "p" && arg) { ensureBase(); openSharedParcours(arg); }
    else if (seg === "saved" && arg) { ensureBase(); openSavedParcours(arg); }
    else if (seg === "updates") { ensureBase(); openUpdates(); }
    else {
      baseRoute = VIEWS[seg] ? seg : "programme";
      renderBase();
    }
    document.querySelectorAll(".tabbar a").forEach(a => a.classList.toggle("active", a.dataset.tab === baseRoute));
  }

  function renderBase() {
    if (mainMap) { mainMap.remove(); mainMap = null; }
    VIEWS[baseRoute]($("#view"));
  }
  // re-rendu léger après un changement d'état (favori, parcours, updates)
  function rerenderBase() { if (!mainMap) renderBase(); }
  function rerender() {
    const sheetOpen = $("#sheet-root").innerHTML !== "";
    if (!sheetOpen) return renderBase();
    // met à jour les boutons de la fiche ouverte sans la re-créer
    document.querySelectorAll("[data-fav]").forEach(b => b.classList.toggle("on", favs.has(b.dataset.fav)));
    document.querySelectorAll("[data-plan]").forEach(b => {
      const on = plan.has(b.dataset.plan);
      b.classList.toggle("on", on);
      if (b.classList.contains("add-parcours")) b.textContent = on ? "✓ Parcours" : "+ Parcours";
    });
  }

  /* ---------- Délégation d'événements globale ---------- */
  document.addEventListener("click", e => {
    const closeEl = e.target.closest("[data-close]");
    if (closeEl) { history.length > 1 ? history.back() : (location.hash = "#/" + baseRoute); return; }
    const fav = e.target.closest("[data-fav]");
    if (fav) { e.stopPropagation(); toggleFav(fav.dataset.fav); return; }
    const pl = e.target.closest("[data-plan]");
    if (pl) { e.stopPropagation(); togglePlan(pl.dataset.plan); return; }
    const un = e.target.closest("[data-unplan]");
    if (un) { e.stopPropagation(); plan.delete(un.dataset.unplan); savePlan(); toast("Retiré de mon parcours"); renderBase(); return; }
    const pc = e.target.closest("[data-parcours]");
    if (pc) { location.hash = "#/parcours/" + pc.dataset.parcours; return; }
    const sv = e.target.closest("[data-saved]");
    if (sv) { location.hash = "#/saved/" + sv.dataset.saved; return; }
    const sc = e.target.closest("[data-show]");
    if (sc && !e.target.closest("a")) { location.hash = "#/show/" + sc.dataset.show; return; }
  });
  $("#btn-updates").addEventListener("click", () => { location.hash = "#/updates"; });

  function bindShowLinks() { /* liens des popups Leaflet : gérés par le hash naturellement */ }

  /* ---------- Init ---------- */
  window.addEventListener("hashchange", route);
  if (!location.hash) location.replace("#/programme");
  route();
  refreshBadge();
  fetchUpdates();
  setInterval(() => { if (!document.hidden) fetchUpdates(); }, 5 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) fetchUpdates(); });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
