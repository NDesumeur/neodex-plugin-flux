// Flux : tes flux RSS / Atom et tes chaînes YouTube, dans l'ordre de parution, sans algorithme.
// Les nouveautés s'affichent sur l'accueil (widget) ; la mise à jour se fait toutes les 30 min, même onglet fermé.
const CSS = `
.fxWrap{max-width:980px;margin:0 auto;padding:22px;display:flex;flex-direction:column;gap:14px;box-sizing:border-box}
.fxAdd{display:flex;gap:10px;flex-wrap:wrap}
.fxAdd input{flex:1;min-width:220px;font:14px var(--body,monospace);color:#fff;background:#0d0820;border:2px solid var(--line2,#3a2a6e);padding:10px 12px}
.fxSrc{display:flex;gap:8px;flex-wrap:wrap}
.fxChip{display:flex;align-items:center;gap:6px;padding:6px 10px;font-size:12px;cursor:var(--cp,pointer);background:color-mix(in srgb,var(--line2,#3a2a6e) 45%,#000);box-shadow:inset 0 0 0 2px var(--line2,#3a2a6e)}
.fxChip.on{box-shadow:inset 0 0 0 2px var(--magenta,#e01ec8)}
.fxChip.bad{opacity:.6;text-decoration:line-through}
.fxChip b{font:8px var(--title);color:var(--yellow,#ffd84a)}
.fxChip i{font-style:normal;opacity:.6;padding-left:4px}
.fxChip i:hover{opacity:1;color:var(--magenta,#e01ec8)}
.fxList{display:flex;flex-direction:column;gap:6px}
.fxItem{display:flex;gap:12px;align-items:baseline;padding:10px 14px;cursor:var(--cp,pointer);background:color-mix(in srgb,var(--line2,#3a2a6e) 30%,#000)}
.fxItem:hover{box-shadow:inset 0 0 0 2px var(--magenta,#e01ec8)}
.fxItem.new{box-shadow:inset 3px 0 0 var(--yellow,#ffd84a)}
.fxItem.read{opacity:.55}
.fxItem span{flex:1;min-width:0;color:#fff;font-size:14px}
.fxItem small{font-size:11px;color:var(--muted,#9a8cc0);white-space:nowrap}
.fxEmpty{opacity:.7;text-align:center;padding:40px 0}`;
const KEEP = 60, READMAX = 3000;

export default async function (ctx) {
  const view = ctx.view, el = ctx.el, host = ctx.host;
  if (!host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  host.addStyle(CSS);
  let st = (await ctx.storage.get()) || {};
  st.sources = st.sources || []; st.items = st.items || {}; st.read = st.read || [];
  let read = new Set(st.read), only = null, busy = false;
  const save = () => { st.read = [...read].slice(-READMAX); return ctx.storage.set(st); };

  const fetchText = async url => { const r = await ctx.net(url); if (!r.ok) throw new Error('erreur ' + r.status); return r.body; };
  // un lien de chaîne YouTube (@nom, /channel/UC…, /c/…, /user/…) devient son flux ; sinon le lien est pris tel quel
  async function resolve(input) {
    let u = input.trim(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    const url = new URL(u);
    if (/(^|\.)youtube\.com$/.test(url.hostname) && !url.pathname.startsWith('/feeds/')) {
      let id = /^\/channel\/(UC[\w-]{22})/.exec(url.pathname)?.[1];
      if (!id) id = /"(?:channelId|externalId)":"(UC[\w-]{22})"/.exec(await fetchText(url.href))?.[1];
      if (!id) throw new Error('chaîne YouTube introuvable');
      return 'https://www.youtube.com/feeds/videos.xml?channel_id=' + id;
    }
    return url.href;
  }
  // RSS 2.0, RSS 1.0 (RDF) et Atom (YouTube compris)
  function parse(xml, feed) {
    const d = new DOMParser().parseFromString(xml, 'text/xml');
    if (d.querySelector('parsererror')) throw new Error('ce lien n\'est pas un flux RSS ou Atom');
    const txt = (n, sel) => n.getElementsByTagName(sel)[0]?.textContent?.trim() || '';
    const root = d.documentElement, atom = root.localName === 'feed';
    const title = txt(atom ? root : (root.getElementsByTagName('channel')[0] || root), 'title') || new URL(feed).hostname;
    const nodes = [...d.getElementsByTagName(atom ? 'entry' : 'item')];
    const items = nodes.map(n => {
      const link = atom ? ([...n.getElementsByTagName('link')].find(l => !l.getAttribute('rel') || l.getAttribute('rel') === 'alternate')?.getAttribute('href') || '') : txt(n, 'link');
      const date = Date.parse(txt(n, atom ? 'published' : 'pubDate') || txt(n, 'updated') || txt(n, 'dc:date')) || 0;
      return { id: txt(n, atom ? 'id' : 'guid') || link || txt(n, 'title'), title: txt(n, 'title') || '(sans titre)', link, at: date };
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
    if (busy) return; busy = true; status.textContent = 'Mise à jour…';
    await Promise.all(st.sources.map(refresh)); busy = false;
    await save(); render(); widget();
  }
  const all = () => st.sources.flatMap(s => (st.items[s.feed] || []).map(i => ({ ...i, src: s }))).sort((a, b) => b.at - a.at);
  const fresh = () => all().filter(i => !read.has(i.id));
  function widget() {
    const n = fresh();
    if (!n.length) return ctx.widget.clear();
    ctx.widget.set({ title: 'Flux · ' + n.length + ' nouveau' + (n.length > 1 ? 'x' : ''), lines: n.slice(0, 4).map(i => i.src.title.slice(0, 18) + ' · ' + i.title) });
  }

  const wrap = el('div', 'fxWrap'), add = el('div', 'fxAdd'), inp = el('input'), addB = el('button', 'btn px', 'AJOUTER'), upB = el('button', 'btn px', 'ACTUALISER'), allB = el('button', 'btn px', 'TOUT LU');
  const srcs = el('div', 'fxSrc'), status = el('div', 'hint'), list = el('div', 'fxList'), head = el('div', 'agHead');
  inp.placeholder = 'Lien d\'un flux RSS, d\'un site ou d\'une chaîne YouTube (youtube.com/@nom)';
  head.append(el('span', 'label', 'Flux'), el('span', 'hint', 'dans l\'ordre de parution, rien d\'autre'));
  add.append(inp, addB, upB, allB); wrap.append(head, add, srcs, status, list); view.replaceChildren(wrap);

  const ago = t => { if (!t) return ''; const s = (Date.now() - t) / 1000; return s < 3600 ? 'il y a ' + Math.max(1, Math.round(s / 60)) + ' min' : s < 86400 ? 'il y a ' + Math.round(s / 3600) + ' h' : new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };
  function render() {
    srcs.replaceChildren(...st.sources.map(s => {
      const n = (st.items[s.feed] || []).filter(i => !read.has(i.id)).length;
      const c = el('div', 'fxChip' + (only === s.feed ? ' on' : '') + (s.err ? ' bad' : ''), s.title || s.feed), x = el('i', '', '✕');
      if (n) c.prepend(el('b', '', String(n)));
      c.title = s.err ? 'Erreur : ' + s.err : 'Clique pour n\'afficher que cette source';
      c.onclick = () => { only = only === s.feed ? null : s.feed; render(); };
      x.title = 'Retirer cette source';
      x.onclick = async e => { e.stopPropagation(); if (!await host.confirm('Retirer « ' + (s.title || s.feed) + ' » ?', { ok: 'Retirer', danger: true })) return;
        st.sources = st.sources.filter(y => y !== s); delete st.items[s.feed]; if (only === s.feed) only = null; await save(); render(); widget(); };
      c.append(x); return c;
    }));
    const items = all().filter(i => !only || i.src.feed === only).slice(0, 200);
    const nNew = fresh().length;
    status.textContent = busy ? 'Mise à jour…' : st.sources.length ? nNew + ' nouveau' + (nNew > 1 ? 'x' : '') + ' · mis à jour toutes les 30 min' : '';
    list.replaceChildren(...(items.length ? items.map(i => {
      const r = el('div', 'fxItem' + (read.has(i.id) ? ' read' : ' new'));
      r.append(el('small', '', i.src.title.slice(0, 22)), el('span', '', i.title), el('small', '', ago(i.at)));
      r.onclick = () => { read.add(i.id); save(); render(); widget(); host.newTab(i.link); };
      r.title = i.link; return r;
    }) : [el('div', 'fxEmpty', st.sources.length ? 'Rien pour l\'instant.' : 'Ajoute un flux ou une chaîne YouTube pour commencer.')]));
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
  ctx.onOpen(() => { render(); if (!busy && Date.now() - (st.at || 0) > 5 * 60000) { st.at = Date.now(); refreshAll(); } });
  ctx.background.every(30, () => { st.at = Date.now(); refreshAll(); });
  render(); widget(); refreshAll();
}
