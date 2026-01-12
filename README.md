# Template Web

Application front-end pour une plateforme de microcrédit, construite avec Vite, React, TypeScript, TailwindCSS et TanStack Router.

## 📦 Aperçu du projet

Ce projet est une application web moderne, typée et optimisée pour la performance, avec les technologies suivantes :

- **Vite** – Bundler ultra-rapide pour le développement
- **React 19** – Librairie UI
- **TypeScript** – Typage statique
- **TailwindCSS 4** – Utilitaire CSS moderne
- **TanStack Router** – Gestion avancée du routage
- **Zustand** – Gestion légère de l’état global
- **React Hook Form** + **Zod** – Gestion des formulaires et validation
- **i18next** – Internationalisation

---

## 🚀 Scripts disponibles

Voici un récapitulatif des scripts définis dans le `package.json` :

| Script          | Description                                                                |
|-----------------|----------------------------------------------------------------------------|
| `dev`           | Démarre le serveur de développement avec Vite                              |
| `build`         | Compile TypeScript (`tsc -b`) puis construit le projet avec Vite           |
| `lint`          | Lint tout le projet avec ESLint                                            |
| `preview`       | Lance un aperçu local de la version de production                          |
| `format`        | Formate tous les fichiers `.ts` et `.tsx` avec Prettier                    |
| `format:check`  | Vérifie si les fichiers sont bien formatés                                 |
| `parse`         | Extrait les chaînes traduisibles avec `i18next-parser` et génère les types |
| `release:dev`   | Prépare une version de pré-release (dev) avec `standard-version`           |
| `release:prod`  | Génère une version stable avec `standard-version`                          |

---

---

## 🔐 Authentification & Sécurité

L’authentification est gérée dans le répertoire [`/src/auth/*`](./src/auth/), avec une logique centralisée dans le **store Zustand `authStore`**.

Les routes protégées sont définies dans le répertoire [`/_protected/*`](./src/routes/_protected).  
Le fichier [`_protected.tsx`](./src/routes/_protected.tsx) s’occupe de la vérification de l’authentification à chaque chargement :

```tsx
beforeLoad: async () => {
  const { user, fetchUser } = useAuthStore.getState()
  if (!user) {
    try {
      await fetchUser()
    } catch (e) {
      throw redirect({ to: "/auth/login" })
    }
  }

  const { isAuthenticated } = useAuthStore.getState()
  if (!isAuthenticated) {
    throw redirect({
      to: "/auth/login",
      search: { redirect: window.location.pathname },
    })
  }
}
```

## 🌍 Internationalisation

L'internationalisation est assurée par i18next avec les plugins suivants :

-i18next-browser-languagedetector
-i18next-http-backend
-react-i18next

Utilise le script npm run parse pour extraire les chaînes traduisibles et générer les types.

## ⚙️ Variables d’environnement
Le fichier .env.example contient les variables d’environnement nécessaires pour démarrer le projet.
Copiez ce fichier et renommez-le .env, puis complétez les valeurs : 

# cp .env.example .env


## 🧪 Qualité du code

# Linting : npm run lint
# Formatage : npm run format / format:check

Typage strict via TypeScript + ESLint + Prettier