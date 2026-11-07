// Flux : tes flux RSS / Atom et tes chaînes YouTube, dans l'ordre de parution, sans algorithme.
// Colonne des sources à gauche, articles en cartes (image, extrait) rangés par jour, un panneau de lecture à droite ; « Plus tard » pour garder un article.
// Les nouveautés s'affichent sur l'accueil (widget) et en notification ; la mise à jour se fait toutes les 30 min, même onglet fermé.
const CSS = `
.fxWrap{max-width:1400px;margin:0 auto;padding:22px;display:flex;flex-direction:column;gap:14px;box-sizing:border-box;height:100%}
.fxAdd{display:flex;gap:10px;flex-wrap:wrap}
.fxAdd input,.fxSearch{flex:1;min-width:220px;font:14px var(--text,monospace);color:#fff;background:#0d0820;border:0;box-shadow:inset 0 0 0 2px var(--line2,#3a2a6e);padding:10px 12px;outline:0}
.fxAdd input:focus,.fxSearch:focus{box-shadow:inset 0 0 0 2px var(--magenta,#e01ec8)}
.fxBody{display:grid;grid-template-columns:240px minmax(0,1fr) minmax(0,420px);gap:16px;min-height:0;flex:1;align-items:start}
.fxBody.noRead{grid-template-columns:240px minmax(0,1fr)}
.fxSide{display:flex;flex-direction:column;gap:4px;position:sticky;top:0}
.fxSide .label{margin:8px 0 4px}
.fxSrc{all:unset;cursor:var(--cp,pointer);display:grid;grid-template-columns:18px 1fr auto auto;gap:8px;align-items:center;padding:7px 8px;font-size:14px;color:var(--lilac,#d9c6ff)}
.fxSrc img{width:16px;height:16px;image-rendering:pixelated}
.fxSrc span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fxSrc b{font:8px var(--title);background:var(--magenta,#e01ec8);color:#fff;padding:3px 4px 2px}
.fxSrc i{font-style:normal;color:var(--muted,#8f7bb8);visibility:hidden;padding:0 2px}
.fxSrc:hover{background:rgba(255,255,255,.05)} .fxSrc:hover i{visibility:visible} .fxSrc i:hover{color:#ff4f6d}
.fxSrc.on{background:rgba(224,30,200,.16);box-shadow:inset 3px 0 0 var(--magenta,#e01ec8);color:#fff}
.fxSrc.bad span{text-decoration:line-through;opacity:.6}
.fxMain{display:flex;flex-direction:column;gap:10px;min-width:0}
.fxBar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.fxTab{all:unset;cursor:var(--cp,pointer);font:8px var(--title);letter-spacing:1px;padding:8px 10px;color:var(--muted,#8f7bb8);box-shadow:inset 0 0 0 2px var(--line2,#3a2a6e)}
.fxTab.on{color:#fff;background:rgba(224,30,200,.2);box-shadow:inset 0 0 0 2px var(--magenta,#e01ec8)}
.fxDay{font:8px var(--title);letter-spacing:2px;color:var(--muted,#8f7bb8);margin:10px 0 2px;display:flex;align-items:center;gap:10px}
.fxDay::after{content:'';flex:1;height:2px;background:var(--line2,#3a2a6e)}
.fxCard{display:grid;grid-template-columns:120px 1fr;gap:4px 14px;padding:10px;cursor:var(--cp,pointer);background:color-mix(in srgb,var(--line2,#3a2a6e) 28%,#000);box-shadow:inset 0 0 0 2px var(--line2,#3a2a6e),4px 4px 0 rgba(0,0,0,.4)}
.fxCard.noImg{grid-template-columns:1fr}
.fxCard:hover{box-shadow:inset 0 0 0 2px var(--lilac,#d9c6ff),4px 4px 0 rgba(0,0,0,.4)}
.fxCard.sel{box-shadow:inset 0 0 0 2px var(--magenta,#e01ec8),4px 4px 0 rgba(0,0,0,.4)}
.fxCard.new{box-shadow:inset 4px 0 0 var(--yellow,#ffd84a),inset 0 0 0 2px var(--line2,#3a2a6e),4px 4px 0 rgba(0,0,0,.4)}
.fxCard.read{opacity:.6}
.fxThumb{grid-row:span 3;width:120px;height:68px;object-fit:cover;background:#0d0820;box-shadow:0 0 0 2px #000}
.fxMeta{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--muted,#8f7bb8);min-width:0}
.fxMeta img{width:14px;height:14px} .fxMeta .fxLater{margin-left:auto;color:var(--yellow,#ffd84a)}
.fxCard h4{margin:0;font:600 15px var(--text,monospace);color:#fff;line-height:1.3}
.fxCard p{margin:0;font-size:13px;color:var(--lilac,#d9c6ff);opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.fxRead{position:sticky;top:0;display:flex;flex-direction:column;gap:10px;padding:16px;background:color-mix(in srgb,var(--line2,#3a2a6e) 22%,#000);box-shadow:inset 0 0 0 2px var(--line2,#3a2a6e),6px 6px 0 rgba(0,0,0,.45);max-height:calc(100vh - 200px);overflow-y:auto}
.fxRead img.big{width:100%;max-height:240px;object-fit:cover;box-shadow:0 0 0 2px #000}
.fxRead h3{margin:0;font:600 20px var(--text,monospace);color:#fff;line-height:1.3}
.fxRead .txt{font-size:15px;line-height:1.6;color:var(--lilac,#d9c6ff);white-space:pre-wrap;word-break:break-word}
.fxRead .row{display:flex;gap:8px;flex-wrap:wrap}
.fxEmpty{opacity:.75;text-align:center;padding:30px 0;display:flex;flex-direction:column;gap:12px;align-items:center}
.fxSugg{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}`;
const KEEP = 60, READMAX = 3000, LATERMAX = 300;
// pour démarrer : des flux connus (on peut tous les retirer)
const SUGG = [['Le Monde', 'https://www.lemonde.fr/rss/une.xml'], ['Numerama', 'https://www.numerama.com/feed/'], ['Korben', 'https://korben.info/feed'],
  ['Frandroid', 'https://www.frandroid.com/feed'], ['Jeuxvideo.com', 'https://www.jeuxvideo.com/rss/rss.xml'], ['NASA', 'https://www.nasa.gov/feed/']];

export default async function (ctx) {
  const view = ctx.view, el = ctx.el, host = ctx.host;
  if (!host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  host.addStyle(CSS);
  let st = (await ctx.storage.get()) || {};
  st.sources = st.sources || []; st.items = st.items || {}; st.read = st.read || []; st.later = st.later || [];
  let read = new Set(st.read), only = null, busy = false, tab = 'new', q = '', sel = null, narrow = false, showAll = false;
  const save = () => { st.read = [...read].slice(-READMAX); st.later = st.later.slice(0, LATERMAX); return ctx.storage.set(st); };

  const fetchText = async url => { const r = await ctx.net(url); if (!r.ok) throw new Error('erreur ' + r.status); return r.body; };
  // un lien de chaîne YouTube (@nom, /channel/UC…, /c/…, /user/…) devient son flux ; une page de site, le flux qu'elle annonce ; sinon le lien est pris tel quel
  async function resolve(input) {
    let u = input.trim(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    const url = new URL(u);
    if (/(^|\.)youtube\.com$/.test(url.hostname) && !url.pathname.startsWith('/feeds/')) {
      let id = /^\/channel\/(UC[\w-]{22})/.exec(url.pathname)?.[1];
      if (!id) id = /"(?:channelId|externalId)":"(UC[\w-]{22})"/.exec(await fetchText(url.href))?.[1];
      if (!id) throw new Error('chaîne YouTube introuvable');
      return 'https://www.youtube.com/feeds/videos.xml?channel_id=' + id;
    }
    const body = await fetchText(url.href);
    if (/^\s*<(\?xml|rss|feed|rdf)/i.test(body)) return url.href;
    const alt = /<link[^>]+type=["']application\/(rss|atom)\+xml["'][^>]*>/i.exec(body)?.[0], href = alt && /href=["']([^"']+)["']/i.exec(alt)?.[1];  // la page d'un site : son flux
    return href ? new URL(href.replace(/&amp;/g, '&'), url).href : url.href;
  }
  // le texte d'un morceau de HTML (jamais inséré tel quel dans la page) et sa première image
  const plain = html => { const d = new DOMParser().parseFromString('<body>' + html, 'text/html'); return (d.body.textContent || '').replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); };
  const firstImg = html => /<img[^>]+src=["'](https:[^"']+)["']/i.exec(html || '')?.[1] || '';
  const https = u => /^https:\/\/[^\s"'<>]+$/.test(u || '') ? u : '';
  // RSS 2.0, RSS 1.0 (RDF) et Atom (YouTube compris) : titre, lien, date, extrait, image
  function parse(xml, feed) {
    const d = new DOMParser().parseFromString(xml, 'text/xml');
    if (d.querySelector('parsererror')) throw new Error('ce lien n\'est pas un flux RSS ou Atom');
    const txt = (n, sel) => n.getElementsByTagName(sel)[0]?.textContent?.trim() || '';
    const attr = (n, sel, a) => n.getElementsByTagName(sel)[0]?.getAttribute(a) || '';
    const root = d.documentElement, atom = root.localName === 'feed';
    const title = txt(atom ? root : (root.getElementsByTagName('channel')[0] || root), 'title') || new URL(feed).hostname;
    const nodes = [...d.getElementsByTagName(atom ? 'entry' : 'item')];
    const items = nodes.map(n => {
      const link = atom ? ([...n.getElementsByTagName('link')].find(l => !l.getAttribute('rel') || l.getAttribute('rel') === 'alternate')?.getAttribute('href') || '') : txt(n, 'link');
      const date = Date.parse(txt(n, atom ? 'published' : 'pubDate') || txt(n, 'updated') || txt(n, 'dc:date')) || 0;
      const html = txt(n, 'content:encoded') || txt(n, 'description') || txt(n, 'summary') || txt(n, 'content') || txt(n, 'media:description');
      const enc = [...n.getElementsByTagName('enclosure')].find(e => /^image\//.test(e.getAttribute('type') || ''))?.getAttribute('url');
      const img = https(attr(n, 'media:thumbnail', 'url') || [...n.getElementsByTagName('media:content')].find(m => /image/.test(m.getAttribute('medium') || m.getAttribute('type') || 'image'))?.getAttribute('url') || enc || firstImg(html));
      return { id: txt(n, atom ? 'id' : 'guid') || link || txt(n, 'title'), title: plain(txt(n, 'title')) || '(sans titre)', link, at: date, sum: plain(html).slice(0, 1200), img,
        by: txt(n, 'dc:creator') || txt(n, 'name') || txt(n, 'author') };
    }).filter(i => i.link && /^https?:/i.test(i.link));
    return { title, items: items.sort((a, b) => b.at - a.at).slice(0, KEEP) };
  }
  async function refresh(src) {
    try { const r = parse(await fetchText(src.feed), src.feed); src.title = src.title || r.title; src.err = '';
      const old = st.items[src.feed]; st.items[src.feed] = r.items;
      if (!old) for (const i of r.items.slice(3)) read.add(i.id);  // nouvelle source : seuls ses 3 derniers comptent comme nouveaux
    } catch (e) { src.err = e.message; }
  }
  async function refreshAll() {
    if (busy) return; busy = true; render();
    const before = new Set(fresh().map(i => i.id));
    await Promise.all(st.sources.map(refresh)); busy = false;
    await save(); render(); widget();
    const added = fresh().filter(i => !before.has(i.id));
    if (added.length && st.notified !== added[0].id) {  // une notification par fournée de nouveautés
      st.notified = added[0].id; save();
      ctx.notifications?.send({ type: 'nouveaux', title: added.length + (added.length > 1 ? ' nouveaux articles' : ' nouvel article') + ' · ' + added[0].src.title,
        body: added.slice(0, 3).map(i => i.title).join('\n'), image: added.find(i => i.img)?.img || '', open: 'plugin:neodex.flux' }).catch(() => {});
    }
  }
  const all = () => st.sources.flatMap(s => (st.items[s.feed] || []).map(i => ({ ...i, src: s }))).sort((a, b) => b.at - a.at);
  const fresh = () => all().filter(i => !read.has(i.id));
  const isLater = id => st.later.some(x => x.id === id);
  function widget() {
    const n = fresh();
    if (!n.length) return ctx.widget.clear();
    ctx.widget.set({ title: 'Flux · ' + n.length + ' nouveau' + (n.length > 1 ? 'x' : ''), lines: n.slice(0, 4).map(i => i.src.title.slice(0, 18) + ' · ' + i.title) });
  }
  const fav = feed => { try { return 'https://www.google.com/s2/favicons?sz=32&domain=' + new URL(feed).hostname.replace(/^feeds?\./, ''); } catch { return ''; } };
  const imgEl = (src, cls) => { const i = el('img', cls); i.src = src; i.alt = ''; i.loading = 'lazy'; i.referrerPolicy = 'no-referrer'; i.onerror = () => i.remove(); return i; };

  const wrap = el('div', 'fxWrap'), add = el('div', 'fxAdd'), inp = el('input'), addB = el('button', 'btn main px', 'AJOUTER'), upB = el('button', 'btn px', 'ACTUALISER'), allB = el('button', 'btn px', 'TOUT LU');
  const side = el('div', 'fxSide'), main = el('div', 'fxMain'), reader = el('div', 'fxRead'), body = el('div', 'fxBody noRead'), head = el('div', 'agHead'), bar = el('div', 'fxBar'), list = el('div', 'fxMain');
  const search = Object.assign(el('input', 'fxSearch'), { placeholder: 'Rechercher dans les titres…', spellcheck: false });
  inp.placeholder = 'Lien d\'un flux RSS, d\'un site (son flux est trouvé tout seul) ou d\'une chaîne YouTube (youtube.com/@nom)';
  head.append(el('span', 'label', 'Flux'), el('span', 'hint', 'dans l\'ordre de parution, rien d\'autre'));
  add.append(inp, addB, upB, allB); main.append(bar, list); body.append(side, main, reader); wrap.append(head, add, body); view.replaceChildren(wrap);

  const ago = t => { if (!t) return ''; const s = (Date.now() - t) / 1000; return s < 3600 ? 'il y a ' + Math.max(1, Math.round(s / 60)) + ' min' : s < 86400 ? 'il y a ' + Math.round(s / 3600) + ' h' : new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };
  const dayOf = t => { const d0 = new Date(); d0.setHours(0, 0, 0, 0); const k = (d0 - new Date(t).setHours(0, 0, 0, 0)) / 864e5; return !t ? 'SANS DATE' : k <= 0 ? "AUJOURD'HUI" : k === 1 ? 'HIER' : k < 7 ? 'CETTE SEMAINE' : k < 31 ? 'CE MOIS-CI' : 'PLUS ANCIEN'; };
  function markRead(i, on = true) { on ? read.add(i.id) : read.delete(i.id); save(); render(); widget(); }
  function toggleLater(i) {
    if (isLater(i.id)) st.later = st.later.filter(x => x.id !== i.id);
    else st.later.unshift({ id: i.id, title: i.title, link: i.link, at: i.at, sum: i.sum, img: i.img, by: i.by, srcTitle: i.src?.title || i.srcTitle || '', feed: i.src?.feed || i.feed || '' });
    save(); render();
  }
  function openItem(i) { sel = i.id; read.add(i.id); save(); render(); widget(); }
  function renderReader(i) {
    body.classList.toggle('noRead', !i);
    if (!i) return reader.replaceChildren();
    const open = el('button', 'btn main px', 'OUVRIR L\'ARTICLE'), later = el('button', 'btn px', isLater(i.id) ? 'RETIRER DE PLUS TARD' : 'PLUS TARD'), unread = el('button', 'btn px', 'NON LU'), close = el('button', 'btn px', '✕');
    open.onclick = () => host.newTab(i.link); later.onclick = () => toggleLater(i); unread.onclick = () => { markRead(i, false); };
    close.onclick = () => { sel = null; render(); };
    const meta = el('div', 'fxMeta'); meta.append(imgEl(fav(i.src?.feed || i.feed), ''), el('span', '', (i.src?.title || i.srcTitle || '') + (i.by ? ' · ' + i.by : '') + ' · ' + ago(i.at)));
    reader.replaceChildren(...[i.img && imgEl(i.img, 'big'), meta, el('h3', '', i.title), el('div', 'txt', i.sum || 'Pas d\'extrait dans le flux : ouvre l\'article pour le lire.'), (() => { const r = el('div', 'row'); r.append(open, later, unread, close); return r; })()].filter(Boolean));
  }
  function render() {
    // la colonne des sources : toutes, plus tard, puis chaque flux avec ses non lus
    const srcRow = (key, name, icon, n, s) => {
      const r = el('button', 'fxSrc' + (only === key ? ' on' : '') + (s?.err ? ' bad' : '')); r.append(icon ? imgEl(icon, '') : el('span'), el('span', '', name), n ? el('b', '', String(n)) : el('span'));
      if (s) { const x = el('i', '', '✕'); x.title = 'Retirer cette source';
        x.onclick = async e => { e.stopPropagation(); if (!await host.confirm('Retirer « ' + (s.title || s.feed) + ' » ?', { ok: 'Retirer', danger: true })) return;
          st.sources = st.sources.filter(y => y !== s); delete st.items[s.feed]; if (only === s.feed) only = null; await save(); render(); widget(); };
        r.append(x); r.title = s.err ? 'Erreur : ' + s.err : s.feed; }
      r.onclick = () => { only = only === key ? null : key; if (key === '@later') tab = 'all'; render(); };
      return r;
    };
    side.replaceChildren(el('span', 'label', 'Sources'), srcRow(null, 'Tout', '', fresh().length), srcRow('@later', 'Plus tard', '', st.later.length),
      ...st.sources.map(s => srcRow(s.feed, s.title || s.feed, fav(s.feed), (st.items[s.feed] || []).filter(i => !read.has(i.id)).length, s)));
    // la barre : non lus / tout, recherche
    const tb = (k, name) => { const b = el('button', 'fxTab' + (tab === k ? ' on' : ''), name); b.onclick = () => { tab = k; render(); }; return b; };
    if (!bar.contains(search)) search.oninput = () => { q = search.value.trim().toLowerCase(); render(); };
    const nNew = fresh().length;
    bar.replaceChildren(tb('new', 'NON LUS · ' + nNew), tb('all', 'TOUT'), search, el('span', 'hint', busy ? 'Mise à jour…' : st.sources.length ? 'toutes les 30 min' : ''));
    let items = only === '@later' ? st.later.map(x => ({ ...x, src: st.sources.find(s => s.feed === x.feed) || { title: x.srcTitle, feed: x.feed } })) : all().filter(i => !only || i.src.feed === only);
    if (tab === 'new' && only !== '@later') items = items.filter(i => !read.has(i.id) || i.id === sel);
    if (q) items = items.filter(i => (i.title + ' ' + (i.sum || '')).toLowerCase().includes(q));
    const more = narrow && !showAll && items.length > 5 ? items.length - 5 : 0;
    items = items.slice(0, more ? 5 : 200);
    const out = []; let day = '';
    for (const i of items) {
      const d = dayOf(i.at); if (d !== day) { day = d; out.push(el('div', 'fxDay', d)); }
      const c = el('div', 'fxCard' + (i.img ? '' : ' noImg') + (read.has(i.id) ? ' read' : ' new') + (i.id === sel ? ' sel' : '')), meta = el('div', 'fxMeta');
      if (i.img) c.append(imgEl(i.img, 'fxThumb'));
      meta.append(imgEl(fav(i.src.feed), ''), el('span', '', (i.src.title || '').slice(0, 30) + ' · ' + ago(i.at)));
      if (isLater(i.id)) meta.append(el('span', 'fxLater', '★ plus tard'));
      c.append(meta, el('h4', '', i.title)); if (i.sum) c.append(el('p', '', i.sum.slice(0, 300)));
      c.onclick = () => openItem(i); c.ondblclick = () => host.newTab(i.link);
      c.oncontextmenu = e => { e.preventDefault(); toggleLater(i); };
      c.title = 'Clic : lire l\'extrait · double-clic : ouvrir l\'article · clic droit : plus tard';
      out.push(c);
    }
    if (!out.length) {
      const e = el('div', 'fxEmpty');
      if (!st.sources.length) {
        e.append(el('div', '', 'Ajoute un flux, un site ou une chaîne YouTube pour commencer. Quelques idées :'));
        const s = el('div', 'fxSugg'); for (const [name, url] of SUGG) { const b = el('button', 'btn px', '+ ' + name); b.onclick = () => { inp.value = url; addB.click(); }; s.append(b); } e.append(s);
      } else e.append(el('div', '', only === '@later' ? 'Rien de gardé pour plus tard (clic droit sur un article).' : tab === 'new' ? 'Tout est lu. ✓' : 'Rien pour l\'instant.'));
      out.push(e);
    }
    if (more) { const b = el('button', 'btn px', 'VOIR TOUT (' + more + ' de plus)'); b.style.margin = '8px auto'; b.onclick = () => { showAll = true; render(); }; out.push(b); }
    list.replaceChildren(...out);
    renderReader(sel && (all().find(i => i.id === sel) || st.later.find(x => x.id === sel)));
  }
  addB.onclick = async () => {
    if (!inp.value.trim()) return;
    addB.disabled = true;
    try {
      const feed = await resolve(inp.value);
      if (st.sources.some(s => s.feed === feed)) throw new Error('déjà dans ta liste');
      const src = { feed, title: '' }; await refresh(src);
      if (src.err) throw new Error(src.err);
      st.sources.push(src); inp.value = ''; await save(); render(); widget(); host.toast('Ajouté : ' + src.title);
    } catch (e) { host.toast('Impossible d\'ajouter : ' + e.message, true); }
    addB.disabled = false;
  };
  inp.onkeydown = e => { if (e.key === 'Enter') addB.click(); };
  upB.onclick = refreshAll;
  allB.onclick = () => { for (const i of all()) read.add(i.id); save(); render(); widget(); };
  view.addEventListener('keydown', e => {  // j / k : article suivant / précédent, o : l'ouvrir, s : plus tard
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const cards = all(), k = cards.findIndex(i => i.id === sel);
    if (e.key === 'j' || e.key === 'k') { const n = cards[Math.max(0, Math.min(cards.length - 1, k + (e.key === 'j' ? 1 : -1)))]; if (n) openItem(n); }
    else if (e.key === 'o' && k >= 0) host.newTab(cards[k].link);
    else if (e.key === 's' && k >= 0) toggleLater(cards[k]);
  });
  ctx.onOpen(() => { render(); if (!busy && Date.now() - (st.at || 0) > 5 * 60000) { st.at = Date.now(); refreshAll(); } });
  ctx.background.every(30, () => { st.at = Date.now(); refreshAll(); });
  { // vérification : un flux RSS minimal donne titre, lien, extrait en texte et image
    const r = parse('<rss><channel><title>T</title><item><title>A &amp; B</title><link>https://x.fr/a</link><description>&lt;p&gt;Bonjour &lt;img src="https://x.fr/i.png"&gt;&lt;/p&gt;</description><pubDate>Mon, 02 Nov 2026 10:00:00 GMT</pubDate></item></channel></rss>', 'https://x.fr/f');
    console.assert(r.title === 'T' && r.items[0].title === 'A & B' && r.items[0].sum === 'Bonjour' && r.items[0].img === 'https://x.fr/i.png', 'flux', r);
  }
  // épinglé sur le côté (colonne étroite) : 5 articles, puis « Voir tout »
  new ResizeObserver(() => { const n = view.clientWidth < 520; if (n !== narrow) { narrow = n; showAll = false; render(); } }).observe(view);
  render(); widget(); refreshAll();
}
