// lancé par le test « local » de NeoDex, sans réseau : ajoute un flux RSS et un flux de chaîne YouTube (Atom) intégrés, par le même chemin que le bouton AJOUTER ; vérifie la liste, les nouveautés et le widget
module.exports = async ({ pj, js, sleep, id }) => {
  await sleep(800);
  const day = i => new Date(Date.now() - i * 36e5).toUTCString();
  const rss = '<rss version="2.0"><channel><title>Le Journal</title>' + Array.from({ length: 12 }, (_, i) => `<item><title>Article ${i + 1} &amp; suite</title><link>https://journal.example/a${i + 1}</link><guid>a${i + 1}</guid><pubDate>${day(i * 2)}</pubDate><description>&lt;p&gt;Résumé de l’article ${i + 1}.&lt;/p&gt;</description></item>`).join('') + '</channel></rss>';
  const atom = '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><title>Une chaîne</title>' + Array.from({ length: 3 }, (_, i) => `<entry><id>yt:video:v${i}</id><title>Vidéo ${i + 1}</title><link rel="alternate" href="https://www.youtube.com/watch?v=v${i}"/><published>${new Date(Date.now() - (i * 2 + 1) * 36e5).toISOString()}</published><media:group><media:description>Description ${i + 1}</media:description><media:thumbnail url="https://i.ytimg.com/vi/v${i}/hqdefault.jpg"/></media:group></entry>`).join('') + '</feed>';
  const err = await pj(`(async () => { let v = document.querySelector('.fxWrap'); while (v && !v.__fx) v = v.parentElement; const F = v.__fx;
    try { await F.reset(); await F.add('https://journal.example/rss.xml', ${JSON.stringify(rss)}); await F.add('https://www.youtube.com/feeds/videos.xml?channel_id=UCtest', ${JSON.stringify(atom)});
      return (await F.add('https://journal.example/rss.xml', ${JSON.stringify(rss)}).then(() => 'doublon accepté', e => '')); } catch (e) { return e.message; } })()`);
  if (err) throw new Error('ajout : ' + err);
  await sleep(300);
  const chips = await pj(`[...document.querySelectorAll('.fxSrc')].filter(c => c.querySelector('i')).map(c => c.className + ' ' + c.textContent)`);
  const unread = await pj(`document.querySelectorAll('.fxCard').length`);  // une source neuve : ses 3 derniers articles comptent comme nouveaux
  await pj(`[...document.querySelectorAll('.fxTab')].find(b => b.textContent === 'TOUT').click(), 0`); await sleep(200);
  const items = await pj(`document.querySelectorAll('.fxCard').length`);
  if (chips.length !== 2 || chips.some(c => /bad/.test(c))) throw new Error('sources : ' + JSON.stringify(chips));
  if (items !== 15 || unread !== 6) throw new Error(items + ' articles dont ' + unread + ' non lus (attendu 15 dont 6)');
  const w = await js(`JSON.stringify(pluginWidgets[${JSON.stringify(id)}] || null)`);
  if (!/nouveau/.test(w)) throw new Error('pas de widget : ' + w);
  const over = await pj(`[...document.querySelectorAll('.fxWrap *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length`);
  if (over) throw new Error(over + ' élément(s) débordent à droite');
  await sleep(1500);  // le temps de la capture d'écran
  return chips.length + ' sources, ' + items + ' articles dont ' + unread + ' non lus, widget ' + JSON.parse(w).title;
};
