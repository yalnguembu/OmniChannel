# Guide Front-End — Custom Data & Segments (React + Claude Code)

Ce guide s'adresse au **développeur React** (et à son copilote **Claude Code**) qui va construire
trois interfaces :

1. **Configurer les attributs personnalisés (custom data) d'un produit** — l'éditeur de *schéma*.
2. **Créer / éditer un client** avec ses valeurs de custom data.
3. **Construire les critères de filtre** des segments de clients (AND / OR, opérateurs).

> Tout est piloté par des **endpoints de métadonnées** : ne codez pas en dur la liste des types
> ou des opérateurs — récupérez-les dynamiquement. Le back est la **source de vérité**.

---

## 0. Conventions générales (à lire absolument)

### Base URL & Auth
- Dév : `http://localhost:5146`. Swagger : `/swagger`.
- Toutes les requêtes (sauf login) nécessitent l'en-tête `Authorization: Bearer <JWT>`.

### Enveloppe de réponse
Toutes les réponses sont encapsulées :
```json
{ "success": true, "data": { /* ... */ }, "message": null, "traceId": "..." }
```
En erreur :
```json
{ "success": false, "data": null, "message": "Description lisible",
  "errorCode": "ATTR_OPERATOR_NOT_SUPPORTED", "traceId": "..." }
```
➡️ Côté front, **toujours** lire `data` en cas de succès et `message`/`errorCode` en cas d'échec.

### Pagination
Les listes paginées renvoient :
```json
{ "items": [ ... ], "pageNumber": 1, "pageSize": 50, "totalCount": 230,
  "totalPages": 5, "hasNextPage": true, "hasPreviousPage": false }
```

### ⚠️ Pièges de sérialisation (très important)
| Élément | Casse / format | Exemple |
|---|---|---|
| **Type d'attribut** (`AttributeDefinition.type`, `derived.resultType`) | **PascalCase** | `"Integer"`, `"Select"`, `"MultiSelect"`, `"Currency"` |
| **Opérateur de condition** (`operator` d'une feuille) | **camelCase** | `"eq"`, `"notContains"`, `"isNull"` |
| **Connecteur logique** (`operator` d'un groupe) | **camelCase** | `"and"`, `"or"` |
| **Dates** | **ISO-8601** | `"2026-05-30"` (Date), `"2026-05-30T10:00:00"` (DateTime) |
| **`Client.customData`** | **chaîne JSON échappée** | `"{\"loyalty_points\":1200}"` |
| **`ClientSegment.criteria`** (création) | **chaîne JSON échappée** | voir §3 |

> Les deux derniers points sont la cause #1 des bugs : `customData` et `criteria` sont des
> **`string`** dans les requêtes de création/mise à jour, pas des objets inline (sauf l'aperçu de
> segment qui accepte l'objet, voir §3.4).

---

# 1. Éditeur de schéma (custom data d'un produit)

Objectif : permettre à l'utilisateur de définir les attributs personnalisés d'un produit
(ex. `loyalty_points` (entier), `tier` (choix), `date_fin_abonnement` (date), `age` (dérivé)).

### 1.1 Charger les métadonnées de l'éditeur
`GET /api/product/attribute-schema/metadata`

Renvoie tout ce qu'il faut pour générer dynamiquement le formulaire :
```json
{
  "types": [
    { "type": "Integer", "label": "Entier", "valueKind": "number",
      "supportsOptions": false, "supportsRange": true, "supportsLength": false,
      "supportsRegex": false, "requiresCurrencyCode": false,
      "operators": ["eq","neq","gt","gte","lt","lte","between","in","notIn","isNull","isNotNull"] },
    { "type": "Select", "label": "Choix unique", "valueKind": "string",
      "supportsOptions": true, "supportsRange": false, "supportsLength": false,
      "supportsRegex": false, "requiresCurrencyCode": false,
      "operators": ["eq","neq","in","notIn","isNull","isNotNull"] },
    { "type": "Currency", "label": "Montant (devise)", "valueKind": "number",
      "supportsRange": true, "requiresCurrencyCode": true, "operators": [ ... ] }
    /* ... 13 types au total */
  ],
  "keyPattern": "^[a-zA-Z][a-zA-Z0-9_]*$",
  "reservedKeys": ["address","city","country","createdAt","email","externalId","firstName",
                   "gender","lastName","language","phone","postalCode","status","timezone","birthDate"],
  "derivedFunctions": [
    { "signature": "today()", "description": "Date du jour (UTC, sans heure)." },
    { "signature": "now()", "description": "Date et heure courantes (UTC)." },
    { "signature": "yearsBetween(début, fin)", "description": "Nombre d'années entières entre deux dates." },
    { "signature": "daysBetween(début, fin)", "description": "Nombre de jours entre deux dates." }
  ]
}
```

**Comment exploiter chaque champ d'un type :**
| Champ | UI à afficher |
|---|---|
| `supportsOptions` | éditeur de liste d'options `{ value, label }` (obligatoire pour `Select`/`MultiSelect`) |
| `supportsRange` | deux champs numériques `min` / `max` |
| `supportsLength` | deux champs `minLength` / `maxLength` |
| `supportsRegex` | un champ `regex` |
| `requiresCurrencyCode` | un champ `currencyCode` (ISO, ex. `XAF`) **obligatoire** |
| `valueKind` | détermine le widget de saisie de la valeur par défaut et, plus tard, des valeurs client |

**Règles de validation de clé (à pré-valider côté front) :**
- `key` doit matcher `keyPattern` (`^[a-zA-Z][a-zA-Z0-9_]*$`).
- `key` ne doit pas être dans `reservedKeys` (collision avec un champ natif).
- `key` unique dans le schéma. `label` obligatoire.

### 1.2 Modèle `AttributeDefinition`
```jsonc
{
  "key": "loyalty_points",         // requis, ^[a-zA-Z][a-zA-Z0-9_]*$, unique, non réservé
  "label": "Points de fidélité",   // requis
  "type": "Integer",               // PascalCase
  "required": true,
  "defaultValue": "0",             // chaîne (interprétée selon le type)
  "min": 0, "max": 100000,         // si supportsRange
  "minLength": null, "maxLength": null, "regex": null,  // si type texte
  "options": null,                 // [{ "value": "gold", "label": "Or" }] si Select/MultiSelect
  "currencyCode": null,            // "XAF" si Currency
  "derived": null                  // ou { "expression": "...", "resultType": "Integer" }
}
```
Attribut **dérivé** (calculé, non saisissable) :
```json
{
  "key": "age", "label": "Âge", "type": "Integer",
  "derived": { "expression": "yearsBetween(birthDate, today())", "resultType": "Integer" }
}
```
> Dans une expression dérivée, les identifiants autorisés sont : les **autres attributs** du schéma,
> les **champs natifs** (`reservedKeys`) et les **fonctions** (`derivedFunctions`). Tout identifiant
> inconnu fait échouer la validation.

### 1.3 Lire le schéma existant
`GET /api/product/attribute-schema/{productId}` →
```json
{ "productId": "...", "version": 1, "attributes": [ /* AttributeDefinition[] */ ] }
```

### 1.4 Valider sans enregistrer (pour l'éditeur live)
`POST /api/product/attribute-schema/validate`
```json
{ "version": 1, "attributes": [ /* AttributeDefinition[] */ ] }
```
→ renvoie un résultat de validation (valide / liste d'erreurs). À appeler à la volée pour feedback.

### 1.5 Mesurer l'impact d'un changement (optionnel mais recommandé)
`POST /api/product/attribute-schema/impact/{productId}?sample=50` (même corps que `/validate`)
→ combien de clients existants deviendraient invalides sous le schéma candidat (avant de sauvegarder).

### 1.6 Enregistrer le schéma
`PUT /api/product/attribute-schema`
```json
{ "id": "PRODUCT_ID", "version": 1, "attributes": [ /* AttributeDefinition[] */ ] }
```
Validé côté serveur ; en cas d'erreur → 400 avec `errorCode` (`ATTR_DUPLICATE_KEY`, `ATTR_INVALID_KEY`,
`ATTR_RESERVED_KEY`, `ATTR_INVALID_DEFINITION`, `ATTR_DERIVED_CYCLE`, …).

### 1.7 Guidage React
- Composant `SchemaEditor` : liste d'attributs + bouton « Ajouter ».
- Chaque `AttributeRow` lit le descripteur de type (depuis `/metadata`) pour afficher **uniquement**
  les champs pertinents (`supportsOptions`, `supportsRange`, …).
- Débouncer un appel `/validate` pour le feedback live ; bloquer « Enregistrer » si invalide.
- Pour les dérivés : un champ expression + une aide listant `reservedKeys` + autres clés + `derivedFunctions`.

---

# 2. Créer / éditer un client avec custom data

### 2.1 Construire le formulaire
1. Récupérer le **schéma** du produit : `GET /api/product/attribute-schema/{productId}`.
2. Pour chaque attribut **non dérivé**, générer un champ selon `type`/`valueKind` :
   - `number` → input numérique ; `string` → texte ; `boolean` → switch ;
   - `date`/`dateTime` → date/datetime picker (sortie **ISO**) ;
   - `Select` → liste déroulante (depuis `options`) ; `MultiSelect` → multi-select (tableau).
3. Les attributs **dérivés** ne sont **pas** saisis (lecture seule, calculés côté serveur).

### 2.2 Envoyer la création
`POST /api/client` — `customData` est une **chaîne JSON** :
```json
{
  "productId": "PRODUCT_ID",
  "firstName": "Eric", "lastName": "Ndonkou",
  "email": "eric@example.com", "phone": "00237697807539",
  "status": "Active",
  "customData": "{\"loyalty_points\":1200,\"tier\":\"gold\",\"date_fin_abonnement\":\"2026-05-30\"}"
}
```
Côté front : construire un objet JS `{ loyalty_points: 1200, tier: "gold", ... }` puis
`customData = JSON.stringify(obj)`.

Mise à jour : `PUT /api/client` (même principe, avec `id`).

### 2.3 Validation serveur du custom data
Le serveur valide `customData` contre le schéma du produit :
- clé inconnue → `ATTR_UNKNOWN` ;
- mauvais type → `ATTR_TYPE_MISMATCH` ;
- contrainte (min/max, longueur, regex, option hors liste) → `ATTR_CONSTRAINT` ;
- attribut requis manquant (sans défaut) → `ATTR_REQUIRED_MISSING` ;
- attribut dérivé fourni en entrée → refusé.

➡️ Afficher `message`/`errorCode` du 400 sous le champ concerné (la description nomme la clé).

### 2.4 Règles de valeurs par type (pour la saisie)
| Type | Valeur attendue dans `customData` |
|---|---|
| `Integer` | entier (`1200`) |
| `Decimal`, `Currency`, `Percentage` | nombre (`19.99`) |
| `Boolean` | `true` / `false` |
| `Date` | `"2026-05-30"` |
| `DateTime` | `"2026-05-30T10:00:00"` |
| `Select` | un `value` d'option (sensible à la casse) |
| `MultiSelect` | tableau de `value` (`["sms","email"]`) |
| `Text/Email/Phone/Url` | chaîne |

### 2.5 Lister les clients
- Recherche paginée : `POST /api/client/search` (filtres `email`, `firstName`, `status`, `productId`…)
  → `items[]` de **SearchClientResponse** (⚠️ `customData` y est une **chaîne** brute).

---

# 3. Constructeur de critères de segment

Un segment cible les clients d'un produit satisfaisant un **arbre de conditions** stocké dans
`criteria`. Voir aussi le guide détaillé : `docs/segments-criteres-conditions.md`.

### 3.1 Charger les métadonnées de l'éditeur de critères
`GET /api/clientsegment/metadata`
```json
{
  "operators": [
    { "code": "eq", "label": "Égal à", "description": "...", "operandKind": "single" },
    { "code": "between", "label": "Entre", "description": "...", "operandKind": "range" },
    { "code": "in", "label": "Dans la liste", "description": "...", "operandKind": "array" },
    { "code": "isNull", "label": "Non renseigné", "description": "...", "operandKind": "none" }
    /* ... 17 opérateurs */
  ],
  "attributeTypes": [
    { "type": "Integer", "label": "Entier", "operators": ["eq","neq","gt","gte","lt","lte","between","in","notIn","isNull","isNotNull"] },
    { "type": "MultiSelect", "label": "Choix multiple", "operators": ["contains","notContains","in","notIn","eq","neq","isNull","isNotNull"] }
    /* ... */
  ],
  "logicalOperators": [
    { "code": "and", "label": "ET", "description": "Toutes les sous-conditions doivent être vraies." },
    { "code": "or",  "label": "OU", "description": "Au moins une sous-condition doit être vraie." }
  ]
}
```
**`operandKind`** pilote le widget d'opérande :
- `none` → aucun champ (ex. `isNull`, `isTrue`)
- `single` → un champ
- `array` → liste de valeurs (`in`/`notIn`)
- `range` → deux champs `[min, max]` (`between`)

### 3.2 Structure de l'arbre `criteria`
**Feuille** (comparaison) :
```json
{ "kind": "leaf", "attribute": "<clé ou champ natif>", "operator": "<code>", "operand": <valeur> }
```
**Groupe** (combine AND/OR, imbriquable) :
```json
{ "kind": "group", "operator": "and", "children": [ <noeud>, <noeud>, ... ] }
```
- `operand` est **absent** pour `isNull`/`isNotNull`/`isTrue`/`isFalse`.
- La racine peut être une feuille directe (une seule condition). Groupe vide = vrai.

### 3.3 Exemples
Une condition :
```json
{ "kind": "leaf", "attribute": "date_fin_abonnement", "operator": "eq", "operand": "2026-05-30" }
```
AND + OR imbriqués — « (ACCESS ou EVASION) ET il reste ≤ 3 jours » :
```json
{ "kind": "group", "operator": "and", "children": [
  { "kind": "group", "operator": "or", "children": [
    { "kind": "leaf", "attribute": "libelle_offre", "operator": "eq", "operand": "ACCESS" },
    { "kind": "leaf", "attribute": "libelle_offre", "operator": "eq", "operand": "EVASION" }
  ]},
  { "kind": "leaf", "attribute": "jours_restants", "operator": "lte", "operand": 3 }
]}
```
`between` / `in` :
```json
{ "kind": "group", "operator": "and", "children": [
  { "kind": "leaf", "attribute": "prix", "operator": "between", "operand": [5000, 9999.99] },
  { "kind": "leaf", "attribute": "country", "operator": "in", "operand": ["CM", "FR"] }
]}
```

### 3.4 Tester le critère sans sauvegarder (aperçu)
`POST /api/clientsegment/preview` — ici `criteria` est **inline** (objet, pas une chaîne) :
```json
{
  "productId": "PRODUCT_ID",
  "criteria": { "kind": "leaf", "attribute": "date_fin_abonnement", "operator": "eq", "operand": "2026-05-30" },
  "take": 50
}
```
→ `{ "matchedCount": 128, "sampleClientIds": ["...","..."] }`. Idéal pour un bouton « Tester » live.

### 3.5 Créer le segment
`POST /api/clientsegment` — ici `criteria` est une **chaîne JSON échappée** :
```json
{
  "productId": "PRODUCT_ID",
  "name": "Expiration 30 mai 2026",
  "description": "date de fin = 30/05/2026",
  "isDynamic": true,
  "criteria": "{\"kind\":\"leaf\",\"attribute\":\"date_fin_abonnement\",\"operator\":\"eq\",\"operand\":\"2026-05-30\"}",
  "clientCount": 0
}
```
Mise à jour : `PUT /api/clientsegment` (avec `id`). Le critère est validé contre le schéma à la
création/maj (→ 400 si attribut inconnu, opérateur non autorisé, JSON malformé).

### 3.6 Récupérer les clients d'un segment
- `POST /api/clientsegment/recalculate/{id}` — (re)calcule et **persiste** les membres + `clientCount`.
- `GET /api/clientsegment/{id}/clients?pageNumber=1&pageSize=50` — clients paginés
  (forme `SearchClientResponse`, `customData` = **chaîne**).
- `GET /api/clientsegment/{id}/clients/flat?pageNumber=1&pageSize=50` — **recommandé** : clients
  « à plat », avec les attributs custom/dérivés **typés** dans `attributes` :
```json
{
  "items": [
    { "id": "...", "lastName": "NDONKOU", "phone": "00237697807539", "status": "Active",
      "attributes": { "libelle_offre": "ACCESS", "date_fin_abonnement": "2026-05-30",
                      "jours_restants": 0, "prix": 5000 } }
  ],
  "totalCount": 128, "pageNumber": 1, "pageSize": 50
}
```
> Segment **dynamique** → le critère est évalué en direct à chaque appel.
> Segment **statique** → on lit les membres du dernier `recalculate`.

### 3.7 Guidage React (constructeur récursif)
- Composant récursif `<ConditionNodeEditor>` : si `kind === "group"`, afficher un sélecteur
  AND/OR + la liste des enfants (chacun un `<ConditionNodeEditor>`) + boutons « +Condition » / « +Groupe ».
  Si `kind === "leaf"` : sélecteur d'attribut → sélecteur d'opérateur (filtré par le type de
  l'attribut via `attributeTypes`) → widget d'opérande (selon `operandKind`).
- Étapes pour une feuille :
  1. l'utilisateur choisit un **attribut** ; on connaît son `type` via le schéma produit ;
  2. on propose les opérateurs de `attributeTypes[type].operators` (libellés depuis `operators`) ;
  3. selon `operandKind`, on affiche 0 / 1 / N / 2 champs d'opérande.
- À la sauvegarde : `JSON.stringify(criteriaTree)` → champ `criteria` (string).
- Avant sauvegarde : bouton « Tester » → `POST /preview` (criteria inline) pour montrer le volume.

---

# 4. Récapitulatif des endpoints

| Domaine | Méthode & route | Rôle |
|---|---|---|
| Schéma — métadonnées | `GET /api/product/attribute-schema/metadata` | Types, champs applicables, clés réservées, fonctions dérivées |
| Schéma — lecture | `GET /api/product/attribute-schema/{productId}` | Schéma actuel |
| Schéma — validation | `POST /api/product/attribute-schema/validate` | Valider sans enregistrer |
| Schéma — impact | `POST /api/product/attribute-schema/impact/{productId}?sample=50` | Clients impactés par un schéma candidat |
| Schéma — écriture | `PUT /api/product/attribute-schema` | Enregistrer le schéma |
| Client — créer | `POST /api/client` | `customData` = string JSON |
| Client — modifier | `PUT /api/client` | idem |
| Client — rechercher | `POST /api/client/search` | Liste paginée |
| Segment — métadonnées | `GET /api/clientsegment/metadata` | Opérateurs (+descriptions), opérateurs par type, AND/OR |
| Segment — créer | `POST /api/clientsegment` | `criteria` = string JSON |
| Segment — modifier | `PUT /api/clientsegment` | idem |
| Segment — aperçu (ad-hoc) | `POST /api/clientsegment/preview` | `criteria` = objet inline ; volume + échantillon |
| Segment — aperçu (sauvé) | `GET /api/clientsegment/preview/{id}?take=50` | volume + échantillon |
| Segment — recalcul | `POST /api/clientsegment/recalculate/{id}` | Persiste les membres |
| Segment — clients | `GET /api/clientsegment/{id}/clients` | Clients (customData en string) |
| Segment — clients à plat | `GET /api/clientsegment/{id}/clients/flat` | Clients + attributs typés (**recommandé**) |

Permissions : `PRODUCT_VIEW`/`PRODUCT_UPDATE` (schéma), `CLIENT_VIEW`/`CLIENT_CREATE` (clients),
`CLIENTSEGMENT_VIEW`/`CLIENTSEGMENT_CREATE`/`CLIENTSEGMENT_UPDATE` (segments).

---

# 5. Check-list anti-bugs

- [ ] Types d'attribut en **PascalCase** ; opérateurs et AND/OR en **camelCase**.
- [ ] `customData` (client) et `criteria` (création de segment) envoyés en **`JSON.stringify`** (string), pas en objet.
- [ ] L'aperçu de segment (`/preview`) attend le `criteria` **inline** (objet).
- [ ] Dates en **ISO** (`yyyy-MM-dd`). Ne pas envoyer `30/05/2026`.
- [ ] Opérateurs proposés **filtrés par le type** de l'attribut (via `/metadata`).
- [ ] `operand` **omis** pour `isNull`/`isNotNull`/`isTrue`/`isFalse`.
- [ ] `Select`/`MultiSelect` : comparer/valider les valeurs en **sensible à la casse** (jeton exact d'option).
- [ ] Ne pas saisir les attributs **dérivés** ; les afficher en lecture seule (calculés serveur).
- [ ] Toujours gérer l'enveloppe `{ success, data, message, errorCode }`.
