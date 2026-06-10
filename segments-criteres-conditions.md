# Segments clients — Critères & conditions (guide complet)

Ce document explique **comment écrire les critères** (`Criteria`) d'un `ClientSegment` :
structure de l'arbre, opérateurs logiques **AND / OR**, opérateurs de comparaison par **type
d'attribut**, forme des opérandes, gestion des valeurs nulles, et de **nombreux exemples** (du
plus simple au plus complexe). Les endpoints associés sont listés à la fin.

---

## 1. Principe

Un segment cible les clients d'un **produit** qui satisfont un **arbre de conditions**.
Cet arbre est stocké en JSON dans `ClientSegment.Criteria` et évalué **en mémoire** contre
chaque client du produit (champs natifs + attributs personnalisés + attributs dérivés).

- **Segment dynamique** (`isDynamic = true`) : le critère est ré-évalué à chaque consultation
  (`/clients`, `/clients/flat`) ou recalcul (`/recalculate`).
- **Segment statique** (`isDynamic = false`) : la liste des membres est figée lors du
  `/recalculate` et lue depuis `ClientSegmentMember`.

---

## 2. Structure de l'arbre

Deux sortes de nœuds, distingués par le champ **`kind`** :

### 2.1 Feuille (`leaf`) — une comparaison
```json
{ "kind": "leaf", "attribute": "<clé>", "operator": "<opérateur>", "operand": <valeur> }
```
| Champ | Rôle |
|---|---|
| `attribute` | Clé d'un attribut du schéma **ou** nom d'un champ natif du client |
| `operator` | Opérateur de comparaison (voir §4), en **camelCase** |
| `operand` | Valeur de comparaison (forme selon l'opérateur ; **absent** pour `isNull`/`isNotNull`/`isTrue`/`isFalse`) |

### 2.2 Groupe (`group`) — combine AND / OR
```json
{ "kind": "group", "operator": "and", "children": [ <noeud>, <noeud>, ... ] }
```
| Champ | Rôle |
|---|---|
| `operator` | `"and"` (toutes vraies) ou `"or"` (au moins une vraie) |
| `children` | Liste de nœuds (`leaf` **ou** `group`) — l'imbrication est libre |

> Un **groupe vide** (`children: []`) est considéré comme **vrai** (ne filtre rien).
> La racine du critère peut être une **feuille** directement (pas besoin de groupe pour une seule condition).

---

## 3. Opérateurs logiques (AND / OR) et imbrication

- `and` : court-circuit — dès qu'un enfant est **faux**, le groupe est faux.
- `or`  : court-circuit — dès qu'un enfant est **vrai**, le groupe est vrai.
- On imbrique des groupes pour exprimer des combinaisons : `A AND (B OR C)`, `(A AND B) OR (C AND D)`, etc.

---

## 4. Opérateurs de comparaison par type d'attribut

Chaque type n'autorise que **certains** opérateurs. Un opérateur non autorisé → erreur de
validation `ATTR_OPERATOR_NOT_SUPPORTED`. `isNull` / `isNotNull` sont valides pour **tous** les types.

> Une valeur **absente** (non renseignée) ne satisfait **aucun** opérateur de comparaison
> (sauf `isNull`). Ex. un client sans `prix` ne matche jamais `prix > 0`.

### 4.1 Texte — `Text`, `Email`, `Phone`, `Url`
Comparaison **insensible à la casse**.

| Opérateur (wire) | Sens | `operand` |
|---|---|---|
| `eq` / `neq` | égal / différent | chaîne |
| `contains` / `notContains` | contient / ne contient pas (sous-chaîne) | chaîne |
| `startsWith` / `endsWith` | commence / finit par | chaîne |
| `in` / `notIn` | dans / hors d'une liste | tableau de chaînes |
| `isNull` / `isNotNull` | vide / renseigné | — |

### 4.2 Numérique — `Integer`, `Decimal`, `Currency`, `Percentage`
Unifiés sur `decimal`.

| Opérateur | Sens | `operand` |
|---|---|---|
| `eq` / `neq` | égal / différent | nombre |
| `gt` / `gte` / `lt` / `lte` | >, ≥, <, ≤ | nombre |
| `between` | intervalle **inclusif** `[min, max]` | tableau **2 éléments** `[min, max]` |
| `in` / `notIn` | dans / hors liste | tableau de nombres |
| `isNull` / `isNotNull` | — | — |

### 4.3 Date / Date-heure — `Date`, `DateTime`
Format **ISO-8601** : `"yyyy-MM-dd"` (Date) ; `"yyyy-MM-ddTHH:mm:ss"` (DateTime).

| Opérateur | Sens | `operand` |
|---|---|---|
| `eq` / `neq` | égal / différent | date ISO |
| `gt` / `gte` / `lt` / `lte` | après / ≥ / avant / ≤ | date ISO |
| `between` | intervalle inclusif `[début, fin]` | tableau `[début, fin]` |
| `in` / `notIn` | dans / hors liste | tableau de dates ISO |
| `isNull` / `isNotNull` | — | — |

### 4.4 Booléen — `Boolean`
| Opérateur | Sens | `operand` |
|---|---|---|
| `eq` / `neq` | égal / différent | `true` / `false` |
| `isTrue` / `isFalse` | est vrai / est faux | — |
| `isNull` / `isNotNull` | — | — |

### 4.5 Choix unique — `Select`
Comparaison **sensible à la casse** (jeton exact d'option).

| Opérateur | Sens | `operand` |
|---|---|---|
| `eq` / `neq` | égal / différent | valeur d'option (chaîne) |
| `in` / `notIn` | dans / hors liste | tableau de valeurs |
| `isNull` / `isNotNull` | — | — |

### 4.6 Choix multiple — `MultiSelect`
La valeur client est un **ensemble** de jetons (`string[]`). Comparaison sensible à la casse.

| Opérateur | Sens | `operand` |
|---|---|---|
| `contains` / `notContains` | l'ensemble **contient** / ne contient pas un jeton | chaîne (un jeton) |
| `in` / `notIn` | **intersecte** / n'intersecte pas une liste | tableau de jetons |
| `eq` / `neq` | **égalité d'ensemble** (ordre indifférent) | tableau de jetons |
| `isNull` / `isNotNull` | — | — |

---

## 5. Attributs référençables

Dans `attribute`, on met soit un **champ natif**, soit une **clé du schéma** du produit
(personnalisée ou **dérivée**). Insensible à la casse côté résolution.

**Champs natifs** : `externalId`, `email` (Email), `phone` (Phone), `firstName`, `lastName`,
`gender`, `birthDate` (Date), `language`, `timezone`, `address`, `city`, `postalCode`,
`country`, `status`, `createdAt` (DateTime).

**Attributs personnalisés / dérivés** : ceux définis dans le schéma du produit
(`Product.ClientAttributes`). Les **dérivés** (calculés, ex. `jours_restants`) sont aussi
utilisables comme cible ; ils sont évalués à la volée (`today()` etc.).

---

## 6. Exemples (du simple au complexe)

> Les exemples montrent le critère sous sa forme **lisible** (objet JSON).
> Pour `POST /api/clientsegment`, ce critère doit être **encodé en chaîne** dans le champ
> `criteria` (voir §7). Pour `POST /api/clientsegment/preview`, il est passé **inline**.

### 6.1 Une seule condition (feuille racine)
« Date de fin = 30 mai 2026 »
```json
{ "kind": "leaf", "attribute": "date_fin_abonnement", "operator": "eq", "operand": "2026-05-30" }
```

### 6.2 AND — deux conditions
« Formule ACCESS **ET** date de fin = 30 mai 2026 »
```json
{ "kind": "group", "operator": "and", "children": [
  { "kind": "leaf", "attribute": "libelle_offre",        "operator": "eq", "operand": "ACCESS" },
  { "kind": "leaf", "attribute": "date_fin_abonnement",  "operator": "eq", "operand": "2026-05-30" }
]}
```

### 6.3 OR — l'une ou l'autre
« Formule ACCESS **OU** EVASION »
```json
{ "kind": "group", "operator": "or", "children": [
  { "kind": "leaf", "attribute": "libelle_offre", "operator": "eq", "operand": "ACCESS" },
  { "kind": "leaf", "attribute": "libelle_offre", "operator": "eq", "operand": "EVASION" }
]}
```
Équivalent plus court avec `in` :
```json
{ "kind": "leaf", "attribute": "libelle_offre", "operator": "in", "operand": ["ACCESS", "EVASION"] }
```

### 6.4 AND + OR imbriqués
« (Formule ACCESS **OU** EVASION) **ET** il reste ≤ 3 jours »
```json
{ "kind": "group", "operator": "and", "children": [
  { "kind": "group", "operator": "or", "children": [
    { "kind": "leaf", "attribute": "libelle_offre", "operator": "eq", "operand": "ACCESS" },
    { "kind": "leaf", "attribute": "libelle_offre", "operator": "eq", "operand": "EVASION" }
  ]},
  { "kind": "leaf", "attribute": "jours_restants", "operator": "lte", "operand": 3 }
]}
```

### 6.5 Intervalle de dates (`between`)
« Date de fin entre le 1ᵉʳ et le 31 mai 2026 (inclus) »
```json
{ "kind": "leaf", "attribute": "date_fin_abonnement", "operator": "between", "operand": ["2026-05-01", "2026-05-31"] }
```

### 6.6 Numérique
« Prix ≥ 5000 **ET** prix < 10000 »
```json
{ "kind": "group", "operator": "and", "children": [
  { "kind": "leaf", "attribute": "prix", "operator": "gte", "operand": 5000 },
  { "kind": "leaf", "attribute": "prix", "operator": "lt",  "operand": 10000 }
]}
```
Équivalent avec `between` :
```json
{ "kind": "leaf", "attribute": "prix", "operator": "between", "operand": [5000, 9999.99] }
```

### 6.7 Texte — `contains`, `startsWith`, `in`
« Téléphone commençant par 00237 **ET** nom contenant "NGO" »
```json
{ "kind": "group", "operator": "and", "children": [
  { "kind": "leaf", "attribute": "phone",    "operator": "startsWith", "operand": "00237" },
  { "kind": "leaf", "attribute": "lastName", "operator": "contains",   "operand": "NGO" }
]}
```
« Pays dans une liste »
```json
{ "kind": "leaf", "attribute": "country", "operator": "in", "operand": ["CM", "FR", "CI"] }
```

### 6.8 Select — `in`
« Code offre ACDD ou EVDD »
```json
{ "kind": "leaf", "attribute": "code_offre", "operator": "in", "operand": ["ACDD", "EVDD"] }
```

### 6.9 Booléen
« Client opt-in newsletter = vrai »
```json
{ "kind": "leaf", "attribute": "newsletter_optin", "operator": "isTrue" }
```

### 6.10 MultiSelect
« Les canaux préférés **contiennent** WhatsApp »
```json
{ "kind": "leaf", "attribute": "canaux_preferes", "operator": "contains", "operand": "whatsapp" }
```
« Les canaux préférés **intersectent** {sms, email} »
```json
{ "kind": "leaf", "attribute": "canaux_preferes", "operator": "in", "operand": ["sms", "email"] }
```

### 6.11 Nullité
« A une adresse email renseignée »
```json
{ "kind": "leaf", "attribute": "email", "operator": "isNotNull" }
```

### 6.12 Attribut dérivé (dynamique avec `today()`)
« Abonnement expirant aujourd'hui » (`jours_restants = daysBetween(today(), date_fin_abonnement)`)
```json
{ "kind": "leaf", "attribute": "jours_restants", "operator": "eq", "operand": 0 }
```

### 6.13 Exemple complexe combiné
« (Formule ACCESS expirant dans ≤ 3 jours) **OU** (Formule EVASION expirant aujourd'hui),
le tout pour des clients avec téléphone renseigné »
```json
{ "kind": "group", "operator": "and", "children": [
  { "kind": "leaf", "attribute": "phone", "operator": "isNotNull" },
  { "kind": "group", "operator": "or", "children": [
    { "kind": "group", "operator": "and", "children": [
      { "kind": "leaf", "attribute": "libelle_offre",  "operator": "eq",  "operand": "ACCESS" },
      { "kind": "leaf", "attribute": "jours_restants", "operator": "lte", "operand": 3 }
    ]},
    { "kind": "group", "operator": "and", "children": [
      { "kind": "leaf", "attribute": "libelle_offre",  "operator": "eq", "operand": "EVASION" },
      { "kind": "leaf", "attribute": "jours_restants", "operator": "eq", "operand": 0 }
    ]}
  ]}
]}
```

---

## 7. Utilisation via l'API

### 7.1 Créer un segment — `POST /api/clientsegment`
`criteria` est une **chaîne** contenant le JSON (guillemets échappés).
```json
{
  "productId": "REMPLACE-PAR-L-ID-DU-PRODUIT",
  "name": "Expiration 30 mai 2026",
  "description": "Date de fin = 30/05/2026",
  "isDynamic": true,
  "criteria": "{\"kind\":\"leaf\",\"attribute\":\"date_fin_abonnement\",\"operator\":\"eq\",\"operand\":\"2026-05-30\"}",
  "clientCount": 0
}
```
Le critère est **validé contre le schéma** du produit à la création (attribut inconnu,
opérateur non autorisé, JSON malformé → 400).

### 7.2 Tester un critère sans sauvegarder — `POST /api/clientsegment/preview`
Ici `criteria` est passé **inline** (objet, pas une chaîne) :
```json
{
  "productId": "REMPLACE-PAR-L-ID-DU-PRODUIT",
  "criteria": { "kind": "leaf", "attribute": "date_fin_abonnement", "operator": "eq", "operand": "2026-05-30" },
  "take": 50
}
```
→ renvoie `{ matchedCount, sampleClientIds }` sans rien persister.

### 7.3 Autres endpoints
| Endpoint | Rôle |
|---|---|
| `GET /api/clientsegment/preview/{id}?take=50` | Aperçu d'un segment **déjà enregistré** |
| `POST /api/clientsegment/recalculate/{id}` | Recalcule et **persiste** les membres + `ClientCount` |
| `GET /api/clientsegment/{id}/clients?pageNumber=&pageSize=` | Clients du segment (forme `SearchClientResponse`, `customData` en chaîne) |
| `GET /api/clientsegment/{id}/clients/flat?pageNumber=&pageSize=` | Clients **à plat** : attributs custom/dérivés **typés** (recommandé) |

Pour un segment **dynamique**, `/clients` et `/clients/flat` évaluent le critère en direct.
Pour un segment **statique**, ils lisent les membres calculés au dernier `/recalculate`.

---

## 8. Erreurs de validation fréquentes

| Code | Cause |
|---|---|
| `ATTR_CRITERIA_MALFORMED` | JSON du critère invalide / `kind` manquant |
| `ATTR_UNKNOWN_REFERENCE` / `ATTR_UNKNOWN` | `attribute` inconnu (ni natif ni schéma) |
| `ATTR_OPERATOR_NOT_SUPPORTED` | opérateur non autorisé pour ce type d'attribut |
| `ATTR_TYPE_MISMATCH` | opérande du mauvais type (ex. texte pour un numérique, date non ISO) |

---

## 9. Tableau récapitulatif opérateurs × types

| Opérateur \ Type | Texte | Numérique | Date(Time) | Booléen | Select | MultiSelect |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `eq` / `neq`        | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (ensemble) |
| `gt` `gte` `lt` `lte` | — | ✅ | ✅ | — | — | — |
| `between`           | — | ✅ | ✅ | — | — | — |
| `contains` `notContains` | ✅ (sous-chaîne) | — | — | — | — | ✅ (jeton) |
| `startsWith` `endsWith` | ✅ | — | — | — | — | — |
| `in` / `notIn`      | ✅ | ✅ | ✅ | — | ✅ | ✅ (intersection) |
| `isTrue` / `isFalse` | — | — | — | ✅ | — | — |
| `isNull` / `isNotNull` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Légende : ✅ autorisé · — non autorisé. `isNull`/`isNotNull` valides partout.
