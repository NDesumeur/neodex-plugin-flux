# Flux

Un lecteur de flux : tes flux RSS, tes sites et tes chaînes YouTube réunis dans NeoDex, dans l'ordre de parution. Pas d'algorithme ni de suggestions, seulement ce que tu suis ; les nouveautés s'affichent sur l'accueil et en notification.

*English version: [README.en.md](README.en.md)*

## Ajouter une source

Colle dans le champ du haut, puis **Ajouter** (ou Entrée) :

- le lien d'un **flux RSS ou Atom** ;
- l'adresse d'un **site** : Flux trouve son flux tout seul ;
- le lien d'une **chaîne YouTube** (`youtube.com/@nom`) : ses vidéos arrivent comme des articles.

Au premier lancement, quelques idées sont proposées (Le Monde, Numerama, Korben, Frandroid, NASA). Pour retirer une source, clique sa croix ✕ dans la colonne **Sources**.

## Lire

- Les articles sont rangés par date : aujourd'hui, hier, cette semaine, ce mois-ci, plus ancien. Chacun montre sa source, son âge, son titre, un extrait et son image.
- **Clic** : lire l'extrait dans le panneau ; **double-clic** ou **Ouvrir l'article** : l'ouvrir dans un onglet. Un article ouvert est marqué comme lu.
- **Clic droit** : le garder pour **plus tard** ; la vue **Plus tard** les rassemble.
- La colonne **Sources** filtre sur une seule source, avec son nombre de non lus ; **Tout** les remontre toutes.
- **Rechercher dans les titres…** filtre la liste en direct.
- **Tout lu** remet les compteurs à zéro ; **Actualiser** relit tout de suite toutes les sources.

## Mises à jour

Flux relit tes sources **toutes les 30 minutes**, même quand son onglet est fermé. Quand il y a du nouveau :

- le **widget d'accueil** montre le nombre de nouveaux articles et les quatre derniers titres ;
- une **notification** annonce les nouveaux titres, avec l'image du premier (désactivable dans les notifications de NeoDex).

## Données et synchronisation

Tes sources, les articles lus et ta liste « plus tard » sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée. L'autorisation « réseau » couvre tous les sites, puisque tu choisis toi-même les flux à suivre ; Flux ne contacte que ces sites.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Flux → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
