// lancé par le test « local » de NeoDex : ajoute un flux RSS et une chaîne YouTube (réseau réel), vérifie la liste et le widget
module.exports = async ({ pj, js, sleep, id }) => {
  const add = async url => { await pj(`(document.querySelector('.fxAdd input').value = ${JSON.stringify(url)}, document.querySelector('.fxAdd button').click(), 0)`);
    for (let i = 0; i < 40; i++) { await sleep(300); if (await pj(`!document.querySelector('.fxAdd button').disabled`)) break; } };
  await add('https://www.lemonde.fr/rss/une.xml');
  await add('https://www.youtube.com/@Google');
  const chips = await pj(`[...document.querySelectorAll('.fxChip')].map(c => c.className + ' ' + c.textContent)`);
  const items = await pj(`document.querySelectorAll('.fxItem').length`);
  if (chips.length !== 2 || chips.some(c => /bad/.test(c))) throw new Error('sources : ' + JSON.stringify(chips));
  if (items < 10) throw new Error('seulement ' + items + ' articles');
  const w = await js(`JSON.stringify(pluginWidgets[${JSON.stringify(id)}] || null)`);
  if (!/nouveau/.test(w)) throw new Error('pas de widget : ' + w);
  return chips.length + ' sources, ' + items + ' articles, widget ' + JSON.parse(w).title;
};
