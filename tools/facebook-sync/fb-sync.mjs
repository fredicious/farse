#!/usr/bin/env node
/**
 * Synchronisation (optionnelle) des actualités depuis la page Facebook du FARSe.
 *
 * Facebook n'offre pas d'API publique pour lire une page sans app vérifiée.
 * Ce script lit donc un flux RSS de la page produit par une instance RSS-Bridge
 * (auto-hébergée sur votre VPS — voir tools/facebook-sync/README.md), transforme
 * les posts en entrées `updates.json`, tente de détecter retards/annulations et
 * de relier chaque post à un spectacle par son titre, puis écrit/committe le fichier.
 *
 * Usage :
 *   RSS_URL="https://rss.mon-vps.fr/?action=display&bridge=FacebookBridge&context=User&u=Festivalfarse&format=Atom" \
 *   OUT=updates.json node tools/facebook-sync/fb-sync.mjs
 *
 * À lancer en cron (ex. toutes les 10 min pendant le festival), suivi d'un
 * `git commit + push` si le fichier a changé (GitHub Pages redéploie tout seul),
 * ou en écrivant directement dans le dossier servi par votre VPS.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const RSS_URL = process.env.RSS_URL;
const OUT = process.env.OUT || "updates.json";
if (!RSS_URL) {
  console.error("RSS_URL manquant (flux RSS-Bridge de la page Facebook). Voir tools/facebook-sync/README.md");
  process.exit(1);
}

// Correspondance mots-clés → spectacle (ids de data/data.js)
const SHOW_KEYWORDS = {
  mirage: ["mirage", "dyptik"],
  prelude: ["prélude", "prelude", "accrorap", "kader attou"],
  pelat: ["pelat", "català", "catala"],
  stek: ["stek", "intrepidus"],
  ceremoniale: ["cérémoniale", "ceremoniale", "cie du coin"],
  autostop: ["autostop", "rond-point"],
  wanted: ["wanted", "bruital"],
  epiphytes: ["épiphytes", "epiphytes", "chaussons rouges"],
  lavertu: ["la vertu"],
  baignoire: ["baignoire", "cirque compost"],
  anti: ["anti", "lapin 34"],
  influence: ["influence", "invendus"],
  commentfaire: ["choses avec les mots", "joshua monten"],
  fondre: ["fondre dans l'ombre", "amigara"],
  wakeup: ["wake up", "errância", "errancia"],
  plasticboum: ["plastic boum", "trufu"],
  grosdebit: ["gros débit", "gros debit", "facile d'excès"],
  pigments: ["pigments", "cirkvost"],
  broglii: ["broglii"],
  compostcollaps: ["compost collaps", "gagouz"],
  monmonstre: ["mon monstre", "rouge carmin"],
};

const decode = s => s
  .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
  .replace(/\s+/g, " ").trim();

function classify(text) {
  const t = text.toLowerCase();
  if (/(annul|cancel)/.test(t)) return "cancel";
  if (/(retard|report|décal|decal|delay)/.test(t)) return "delay";
  return "info";
}

function matchShow(text) {
  const t = text.toLowerCase();
  for (const [id, kws] of Object.entries(SHOW_KEYWORDS))
    if (kws.some(k => t.includes(k))) return id;
  return undefined;
}

const res = await fetch(RSS_URL);
if (!res.ok) { console.error("Flux RSS inaccessible:", res.status); process.exit(1); }
const xml = await res.text();

// Parse minimal RSS/Atom
const items = [...xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/g)].map(m => m[0]).slice(0, 20).map(raw => {
  const pick = tag => (raw.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)) || [])[1] || "";
  const title = decode(pick("title"));
  const content = decode(pick("description") || pick("content") || pick("summary"));
  const date = decode(pick("pubDate") || pick("published") || pick("updated"));
  const link = decode(pick("link")) || (raw.match(/<link[^>]*href="([^"]+)"/) || [])[1] || "";
  const guid = decode(pick("guid") || pick("id")) || link || title;
  return { title, content, date, link, guid };
});

const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { updates: [] };
const known = new Set(existing.updates.map(u => u.id));
let added = 0;

for (const it of items) {
  const id = "fb-" + Buffer.from(it.guid).toString("base64url").slice(0, 24);
  if (known.has(id)) continue;
  const text = `${it.title} ${it.content}`;
  const u = {
    id,
    ts: it.date ? new Date(it.date).toISOString() : new Date().toISOString(),
    type: classify(text),
    title: it.title || it.content.slice(0, 90),
    body: it.content.slice(0, 500) + (it.link ? `\n${it.link}` : ""),
  };
  const showId = matchShow(text);
  if (showId) u.showId = showId;
  existing.updates.unshift(u);
  known.add(id);
  added++;
}

existing.updates = existing.updates.slice(0, 50);
existing.generated = new Date().toISOString();
writeFileSync(OUT, JSON.stringify(existing, null, 2) + "\n");
console.log(added ? `${added} nouvelle(s) actu(s) écrite(s) dans ${OUT}` : "Rien de nouveau.");
