# OmniChannel WhatsApp — app mobile (Expo)

Client mobile de l'inbox WhatsApp d'OmniChannel : consultation des discussions,
envoi de messages / médias / templates, temps réel SignalR. C'est un portage de
la feature `src/pages/whatsapp` du SPA web (même API, mêmes règles métier), pas
une réécriture : les hooks et les helpers gardent volontairement les noms et les
commentaires de leurs équivalents web pour que les deux restent comparables.

## Démarrer

```bash
cd mobile
npm install
cp .env.example .env   # puis renseigner EXPO_PUBLIC_API_URL
npm start
```

Puis `a` (Android), `i` (iOS) ou scanner le QR code avec Expo Go.

> **Gestionnaire de paquets** : le SPA web utilise pnpm, ce dossier utilise
> **npm**. Metro et l'autolinking Expo supportent mal les `node_modules`
> symlinkés de pnpm, et la racine du dépôt n'est pas un workspace pnpm
> (`pnpm-workspace.yaml` ne déclare aucun `packages`). Le dossier est donc
> autonome, avec son propre `package-lock.json`.

> **Versions de React épinglées** : `react` et `react-dom` sont figés en `19.2.3`
> (la version attendue par le SDK 57). `expo-router` déclare `react-dom` en peer
> optionnel `*` : laissé libre, npm installe la dernière (19.2.8), qui exige
> `react@^19.2.8` et fait échouer toute installation ultérieure. Les garder
> alignés sur la version du SDK évite ce blocage — `npm run doctor` le vérifie.

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | **Obligatoire.** Origine de l'API, sans `/api` final (les chemins l'incluent). Doit être absolue : une app mobile n'a ni origine relative ni proxy de dev. |
| `EXPO_PUBLIC_SIGNALR_URL` | Optionnel. Hôte du hub temps réel si différent de l'origine API. |
| `EXPO_PUBLIC_WEB_URL` | Optionnel. Origine du portail web, pour que « copier le lien de la discussion » produise une URL ouvrable sur desktop. Sans elle, l'action copie l'identifiant. |

Les variables `EXPO_PUBLIC_*` sont inlinées **au bundling** : après une
modification du `.env`, relancer `npm start` (voire `npm start -- --clear`).

## Scripts

| Script | Effet |
| --- | --- |
| `npm start` | Serveur de dev Expo |
| `npm run android` / `npm run ios` | Ouvre directement sur l'appareil / l'émulateur |
| `npm run typecheck` | `tsc --noEmit` (il n'y a pas de runner de tests, comme sur le web) |
| `npm run doctor` | `expo-doctor` — cohérence des versions natives |

## Architecture

```
app/                       Routes expo-router (fichiers = URLs)
  _layout.tsx              Providers : React Query, SafeArea, toasts
  index.tsx                Redirection selon la session réhydratée
  login.tsx                Connexion e-mail / mot de passe
  (app)/_layout.tsx        Garde d'auth + montage du hub SignalR
  (app)/inbox.tsx          Liste des discussions
  (app)/chat/[id].tsx      Discussion
src/
  api/client.ts            Instance axios (Bearer, 401, URLs média)
  api/endpoints.ts         Un appel par chemin de l'API
  models/                  Types + helpers de dates / aperçus
  store/                   Zustand (authStore persisté, whatsappStore)
  hooks/                   Couche données + ViewModels
  components/              UI (inbox / chat / partagés)
  theme/                   Palette WhatsApp reprise du web
```

Le découpage suit le MVVM du web : **les écrans sont bêtes, les ViewModels
portent la logique**. `useInboxViewModel` (⇄ `sidebarViewModel.ts`) et
`useChatViewModel` (⇄ `chatViewModel.ts`) exposent des données prêtes à afficher
et des handlers ; `useWhatsapp.ts` (⇄ `useWhatsapp.ts`) contient les
requêtes / mutations React Query.

### Différences assumées avec le web

| Sujet | Web | Mobile | Pourquoi |
| --- | --- | --- | --- |
| Authentification | Cookie same-origin (`withCredentials`) | `Authorization: Bearer` rejoué depuis le store persisté | Pas de cookie de session fiable dans une app native. |
| Couche API | SDK hey-api généré depuis `spec.yaml` | `src/api/endpoints.ts` écrit à la main | Évite un générateur dans le pipeline Expo ; l'inbox WhatsApp du web appelle déjà `sdk.gen.ts` en direct (exception documentée dans `CLAUDE.md`). Chaque fonction porte son chemin d'API en commentaire. |
| Expéditeur actif | Porté par l'URL `/wa/$senderId` | Sélecteur dans l'en-tête, persisté (`oc-whatsapp`) | Il n'y a pas d'URL à recharger sur mobile. |
| Médias | `<img>`/`<video>` (cookie envoyé automatiquement) | `expo-image` / `expo-video` avec en-tête `Authorization` explicite | Les composants natifs ne traversent pas les intercepteurs axios. |
| Actions | Modales et menus déroulants | Feuilles ancrées en bas (`Sheet`) | Ergonomie tactile. |
| En-tête de discussion | Sélecteurs de statut en ligne + 4 boutons d'action | Pilule de statut sous le nom, galerie et recherche en boutons, le reste dans le menu ⋮ | La largeur d'un téléphone ne tient pas quatre sélecteurs déroulants ; le menu ⋮ reprend rechargement, statuts et assignation. |
| Icônes | `lucide-react` | `lucide-react-native` | Même jeu, mêmes noms, mêmes tailles : une icône du web se retrouve à l'identique ici. |
| Indicateurs de chargement | `Loader2` animé | `ActivityIndicator` natif | Même rôle ; le composant système tourne sans animation JS. |
| Écran « aucune discussion sélectionnée » | Panneau `ChatPlaceholder` à droite | Aucun | La discussion est un écran empilé : il n'existe pas d'état « rien de sélectionné » à remplir. |
| Diffusion de template | Une modale à trois modes (segment / fichier / client) | Deux entrées : « segment / fichier » depuis la liste, « client » depuis la discussion | Chaque mode est appelé là où il a du sens sur mobile. |
| Liste de messages | Liste virtuelle non inversée + logique de scroll | `FlatList` inversée | Le bas est l'offset 0 : ouverture au dernier message et clavier sans saut. |
| Emojis | `emoji-picker-react` | Sélecteur maison, **même jeu d'émojis** | Le jeu `fr` de `emoji-picker-react` est extrait dans `src/lib/emoji.ts` (les glyphes postérieurs à Unicode 13 sont écartés : beaucoup d'Android les afficheraient en tofu) ; la bibliothèque elle-même est DOM, non portable. La recherche ignore les accents — les mots-clés du jeu en portent, pas les claviers. |
| Validation | Schémas Zod (types uniquement) | Types TS | Comme sur le web, les DTO ne sont pas validés strictement : le backend renvoie des enums libres et rejeter une valeur inconnue ferait disparaître des messages. |
| Réponses rapides | IndexedDB | AsyncStorage, une seule clé | La liste est courte et tout écran qui l'affiche en a besoin entière. Même format d'import/export JSON, donc un jeu de réponses s'échange entre les deux clients. |
| Aperçu PDF | `iframe` dans le compositeur | Carte fichier + « Ouvrir pour vérifier » | React Native ne rend pas un PDF ; la visionneuse du système s'en charge, l'agent peut toujours contrôler la pièce avant envoi. |
| Réglages du panneau | Menus déroulants flottants | La ligne se déplie sous elle-même | Une seconde modale par-dessus une feuille se comporte mal sous Android. |
| Téléphone du contact | Champ modifiable | Champ en lecture seule | C'est la clé de résolution du contact depuis la discussion : le changer déplacerait la fiche vers un autre numéro que celui du fil ouvert. |
| Saut à une date | Calendrier avec jours pointés | Même calendrier, plus des raccourcis vers les jours récents | Le tactile rend la saisie de date pénible ; les raccourcis couvrent le cas courant. |
| Papier peint | Tuile SVG « doodle » à 6 % | Même tuile, rastérisée en PNG (`assets/chat-doodle.png`) | React Native ne sait pas répéter un SVG, et inliner 209 Ko de chemins à chaque ouverture coûterait plus que ne rapporte une texture à 6 %. Le PNG est rendu en `resizeMode="repeat"` avec la même opacité. |

### Règles métier reprises telles quelles

- **Fenêtre de 24h** : un message libre n'est autorisé que dans les 24h suivant
  le dernier message **entrant**. Au-delà, le compositeur est remplacé par un
  raccourci « Template ».
- **État « lu »** : il n'existe pas d'endpoint REST de marquage. C'est
  `JoinConversation` (SignalR) qui le persiste côté serveur ; le badge est aussi
  effacé localement à l'ouverture pour un retour immédiat.
- **Première négociation SignalR en 401** : normal au démarrage quand le jeton
  persisté a expiré. Le hub s'authentifie par `accessTokenFactory` (le web, lui,
  a son cookie) et part en parallèle du premier appel REST — c'est ce dernier qui
  rafraîchit le jeton. `withAutomaticReconnect` ne couvre pas l'échec d'un
  `start()` initial : `useSignalR` réessaie donc lui-même toutes les 5 s, et la
  tentative suivante passe. Ne pas chercher plus loin devant ce seul 401 dans les
  logs.
- **Dates** : l'API sérialise des datetimes naïfs en UTC. `toUtcDate()` ajoute le
  `Z` manquant, sinon tout serait décalé de l'offset du téléphone.
- **Envoi de média** : `SenderId` est requis (routage multi-tenant) et l'endpoint
  est choisi d'après le type MIME réel (`send/image` vs `send/document`).
  `Content-Type` n'est jamais forcé, sinon le multipart perd sa frontière.
- **Filtrage** : le `searchTerm` appartient au backend et n'est pas réappliqué
  côté client ; seul le filtre statut / non-lues l'est, pour qu'un push SignalR
  hors du filtre courant ne s'invite pas dans la liste.
- **Templates** : `send/template/client` adresse un **client CRM**, pas un
  numéro. Le numéro est résolu en contact via `/api/Client/search` (`searchTerm`,
  les filtres texte étant mutuellement exclusifs) ; sans contact, la feuille
  d'envoi propose de le créer sur place plutôt que de bloquer.
- **`PUT /api/Client` remplace la fiche**, il ne la patche pas : le formulaire
  mobile ne couvrant qu'une partie des champs, `updateClient()` repart du contact
  déjà chargé (la recherche renvoie tous les champs modifiables) et applique le
  formulaire par-dessus. Une clé absente vaut « inchangé », une chaîne vide vaut
  suppression explicite. Sans ce merge, éditer un contact viderait son adresse,
  sa langue et ses attributs personnalisés.
- **Deux statuts distincts** : celui du **contact CRM** (dans le formulaire de
  contact, vocabulaire de `/api/Client/statuses`) et celui du **canal** — la
  délivrabilité du numéro, `PATCH /api/ContactChannel/status`, accessible par
  « Statut du canal » dans le menu de discussion.
- **Fenêtre de messages** : les messages arrivent en **fenêtre croissante** (30,
  puis +30 en remontant), jamais en pages recousues — sur un fil vivant, chaque
  message qui arrive décale les bornes et la page 2 renvoie des lignes que la
  page 1 avait déjà. Le store fusionne par id, donc une arrivée SignalR survit.
- **Entités du texte** : une suite de chiffres nue n'est **jamais** un numéro de
  téléphone. Il lui faut un `+` ou un groupement visible, sinon les numéros de
  décodeur, les références de commande et les montants en FCFA deviendraient
  des liens `tel:`. Les règles E.164 sont appliquées après la détection.
- **Multipart** : `send/image` / `send/document` attendent `To` / `File` /
  `Caption` / `SenderId` (majuscules), alors que `send/template/file` attend
  `file` / `templateId` / `senderId` / `productId` / `mappingOverride`
  (minuscules). Les deux conventions coexistent côté backend.

## Pas encore fait

- **Dictée** : écartée. Le web l'assure avec la Web Speech API, qui n'existe pas
  en React Native ; il faudrait un module natif de reconnaissance vocale, donc un
  **build de développement**. Le bouton micro est en place, désactivé, exactement
  comme le web quand la dictée n'est pas disponible.
- **Notes vocales (enregistrement)** : la lecture fonctionne, pas
  l'enregistrement. Le portail web ne l'expose pas non plus, et il n'existe pas
  d'endpoint `send/audio` (un enregistrement partirait en document).
- **Notifications push** : nécessite un enregistrement de token côté backend
  (aucun endpoint dans le contrat aujourd'hui) ; l'app ne notifie donc rien
  lorsqu'elle est fermée.
- **Attributs personnalisés d'un contact** : le formulaire mobile couvre les
  mêmes champs que le web (produit, identité, téléphone, e-mail, ville, pays,
  statut) ; le panneau **affiche** les attributs par produit (`customData`), mais
  leur édition reste sur le portail web.

## Tests end-to-end

`.maestro/` contient les flows Maestro, calqués sur ceux de FujiatBussines. Ils
servent de contrôle visuel : ils traversent les écrans et prennent des captures.

⚠️ **Ils tournent contre la production** : ils n'ouvrent que des écrans, ne
vérifient que des libellés, et n'actionnent jamais un envoi. Tous passent par la
conversation de test — ouvrir une conversation la marque lue côté serveur.
Détails et pièges rencontrés dans [.maestro/README.md](.maestro/README.md).
