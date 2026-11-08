# Flux (Feeds)

A feed reader: your RSS feeds, websites and YouTube channels together in NeoDex, in order of publication. No algorithm and no suggestions, only what you follow; new items show on the home page and as notifications.

*Version française : [README.md](README.md)*

## Adding a source

Paste into the top field, then **Add** (or Enter):

- the link of an **RSS or Atom feed**;
- a **website** address: Flux finds its feed by itself;
- the link of a **YouTube channel** (`youtube.com/@name`): its videos arrive like articles.

On first launch, a few ideas are suggested (Le Monde, Numerama, Korben, Frandroid, NASA). To remove a source, click its ✕ in the **Sources** column.

## Reading

- Articles are grouped by date: today, yesterday, this week, this month, older. Each shows its source, age, title, an excerpt and its image.
- **Click**: read the excerpt in the panel; **double-click** or **Open the article**: open it in a tab. An opened article is marked as read.
- **Right-click**: keep it for **later**; the **Later** view gathers them.
- The **Sources** column filters on a single source, with its unread count; **All** shows them all again.
- **Search titles…** filters the list live.
- **All read** resets the counters; **Refresh** reads every source right away.

## Updates

Flux reads your sources **every 30 minutes**, even when its tab is closed. When there is something new:

- the **home widget** shows the number of new articles and the four latest titles;
- a **notification** announces the new titles, with the first one's image (can be turned off in NeoDex notifications).

## Data and sync

Your sources, read articles and "later" list are stored by NeoDex, backed up and synced between your PCs when sync is on. The "network" permission covers every site, since you choose the feeds yourself; Flux only contacts those sites.

## Install

In NeoDex: **NeoStore → Discover → Flux → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
