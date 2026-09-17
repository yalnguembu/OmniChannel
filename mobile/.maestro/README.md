# Tests end-to-end (Maestro)

Maestro est l'outil E2E recommandé par Expo. Ces flows servent surtout de
**contrôle visuel** : ils traversent les écrans et prennent des captures, ce qui
permet de vérifier le rendu sans avoir l'émulateur sous les yeux.

> Même convention que `FujiatBussines/.maestro` (flows numérotés, `runFlow` pour
> l'entrée commune), avec deux différences assumées, détaillées plus bas :
> l'app tourne dans **Expo Go** contre l'**API réelle**, pas dans une build
> `release` avec des fixtures.

## Installer

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Sous Windows, le binaire posé dans `~/.maestro/bin/maestro` fonctionne
directement depuis Git Bash — inutile de passer par WSL.

## Lancer

Le serveur de dev doit tourner (`npm start`), et l'URL du bundle est passée en
variable :

```bash
maestro test .maestro/00-inbox.yml --env EXPO_URL=exp://<ip-du-poste>:8081
```

L'IP est celle affichée par `expo start` (`exp://192.168.x.x:8081`). Le dossier
entier :

```bash
maestro test .maestro --env EXPO_URL=exp://<ip-du-poste>:8081
```

## Les flows

| Fichier | Écrans | Ce qui est vérifié |
| --- | --- | --- |
| `00-inbox.yml` | Liste des discussions | Ouvre l'app sur la session en cours, vérifie l'en-tête, la recherche et les filtres. Appelé par les autres via `runFlow`. |
| `00b-ouvrir-discussion-test.yml` | Liste → discussion de test | Cherche le `237696851231` et l'ouvre — **le seul** point d'entrée vers une discussion. Appelé par tous les flows de chat. |
| `01-discussion.yml` | Discussion → menu | Vérifie l'en-tête et le composeur, puis les actions du menu ⋮. |
| `02-details.yml` | Panneau d'infos + galerie | Identité, raccourcis, dépliage d'un réglage sur place, sous-vue galerie et retour. |
| `03-recherche.yml` | Recherche dans la discussion | Surlignage en place, compteur de couverture, navigation entre résultats, sélecteur de jour. |
| `04-reponses-rapides.yml` | Réponses rapides | Création, insertion par `/raccourci`, suppression. Les données vivent sur l'appareil. |
| `05-composeur-media.yml` | Compositeur de médias | File de deux pièces, légende par pièce, compteur, puis **annulation**. |
| `06-emojis-et-filtres.yml` | Sélecteur d'émojis + filtres | Groupes et recherche d'émojis, insertion au curseur, puis les trois sections de filtres et les préréglages de période. |
| `07-note-vocale.yml` | Lecteur de note vocale | Commandes, résolution de la durée, lecture/pause et cycle des vitesses. |

## ⚠️ Ces flows tournent contre la production

L'app pointe sur l'API de production et les conversations sont celles de vrais
clients. Les flows n'ouvrent donc que des écrans et ne vérifient que des
libellés. Sont **interdits** :

- taper sur un bouton d'envoi — message, média, template, flow ;
- sélectionner une option de statut, assigner une conversation, enregistrer un
  contact ;
- toute action qui écrit côté serveur.

**Toujours la même conversation de test.** Tous les flows passent par
`00b-ouvrir-discussion-test.yml`, qui cherche le numéro de test et ouvre cette
conversation-là. Raison : ouvrir une conversation la marque **lue côté
serveur** (SignalR `JoinConversation` — il n'existe pas d'endpoint REST de
marquage), et rien ne permet de la repasser en non-lue. Tester sur « la
première de la liste » consommait donc les notifications de vrais clients.

Vérifier une commande, c'est asserter qu'elle est visible, pas l'actionner.
`04-reponses-rapides.yml` est le seul flow qui saisit du texte (les réponses
rapides sont locales à l'appareil) : il efface son brouillon à la fin, et ne
touche jamais au bouton d'envoi.

## Assertions sur l'ossature, pas sur les données

Les flows tournent contre l'API de production : le contenu change à chaque
passage. Ils vérifient donc les **commandes** de l'écran (libellés de boutons,
placeholders, filtres) et jamais des valeurs métier — contrairement aux flows
fujisat, qui s'appuient sur une build à fixtures.

Pas de `clearState` non plus : la session est persistée sous `oc-auth` et il n'y
a pas de compte de test, donc l'effacer déconnecterait sans moyen de revenir.

## Les pièges rencontrés

**Les `testID` ne sont pas visibles par Maestro.** Sous la nouvelle
architecture (RN 0.86 / Fabric dans Expo Go), un `testID` React Native ne
remonte pas en `resource-id` Android : le sélecteur `id:` de Maestro ne trouve
rien, et le dump de hiérarchie ne contient que
`host.exp.exponent:id/action_bar_root`. Les flows ciblent donc des
**`accessibilityLabel`** (qui deviennent le `content-desc` Android) via des
sélecteurs texte. Les `testID` restent dans le code pour d'éventuels tests
unitaires, mais ne servent pas ici.

**`openLink` seul ne recharge pas le bundle.** Expo Go garde en mémoire le JS
déjà chargé : si l'app est déjà au premier plan sur le projet, `openLink` ne
fait que la ramener devant et le flow teste du code périmé — symptôme
déroutant, l'écran affiche l'ancienne UI alors que Metro a bien rebundlé. D'où
le `stopApp` en tête de `00-inbox.yml` : il force un démarrage à froid sans
toucher à AsyncStorage, donc sans perdre la session.

**Installer un module natif invalide Metro.** Après un `npx expo install`, le
serveur en cours sert encore l'ancien graphe de modules. Redémarrer avec
`npx expo start --clear`, sinon le rechargement à chaud n'applique rien.

**Un libellé d'accessibilité en double rend le `tapOn` ambigu.** Maestro prend
le premier élément qui matche dans la hiérarchie — y compris derrière une
modale. La pilule de statut décorative du panneau portait le même libellé que la
ligne de réglage : le tap atterrissait sur la pilule, qui ne fait rien. Les
commandes du panneau portent donc des libellés uniques (`Changer : …`), et une
pilule non cliquable n'annonce plus rien. Même raison pour le raccourci galerie
de l'en-tête, libellé « Ouvrir les médias » là où la ligne du panneau garde
« Médias et documents ».

**Le lecteur audio ne se teste que sur une note vocale déjà reçue.** Il ne se
monte que sur une bulle audio ou sur la scène du compositeur, et l'automatisation
ne peut pas lui en fabriquer une : le sélecteur de documents, sur la catégorie
Audio, **prévisualise** le fichier dans un lecteur système au lieu de le renvoyer
à l'app. `07-note-vocale.yml` s'appuie donc sur la note vocale présente dans la
conversation de test — si elle disparaît, le flow tombe et c'est attendu.

**Ne pas asserter un état transitoire.** La note de test dure quatre secondes :
attendre « Pause » après avoir lancé la lecture échoue une fois sur deux, le
clip se terminant entre deux sondages de Maestro. `07-note-vocale.yml` vérifie
donc un effet durable — la position n'est plus à `0:00` — et accepte les deux
libellés du bouton.

**`openLink` juste après `stopApp` retombe parfois sur l'écran d'accueil.**
Expo Go n'est alors pas relancé, le flow attend un en-tête qui n'arrive jamais
et échoue au bout du timeout. `00-inbox.yml` réessaie donc jusqu'à trois fois
(`repeat` avec `while: notVisible`), chaque tentative laissant 90 s au premier
bundle.

**La LogBox de développement avale les appuis.** Un `console.error` (hub
indisponible, réseau coupé) ouvre l'écran rouge de React Native par-dessus
l'app : les `tapOn` suivants atterrissent dessus et les `assertVisible`
échouent sur une UI pourtant correcte. `00-inbox.yml` la referme si elle est
présente, et `useSignalR` journalise en `console.warn` pour ne plus la
déclencher sur un échec de connexion qu'il rattrape lui-même.

**Les captures ne se posent pas dans le projet.** Sous Windows, un
`takeScreenshot: .maestro/screens/xxx` est écrit dans l'arborescence de debug de
Maestro, pas dans le dépôt :

```
~/.maestro/tests/<horodatage>/<flow>/takeScreenshot/.maestro/screens/xxx.png
```

C'est aussi là que se trouvent le dump de hiérarchie et la capture de l'étape en
échec, à ouvrir en premier quand une assertion tombe.
