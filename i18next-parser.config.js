export default {
  contextSeparator: "_",
  createOldCatalogs: false, // Ne pas créer de fichiers de traduction obsolètes
  ns: ["translation"],
  defaultNamespace: "translation", // Namespace par défaut
  // Retourne la clé comme valeur par défaut pour les clés non traduites
  defaultValue: (locale, namespace, key) =>`_${String(key).split(".").at(-1)}`,
  indentation: 2, // Indentation des fichiers JSON
  keepRemoved: true, // Ne pas garder les clés supprimées
  keySeparator: ".", // Séparateur de clés (par exemple, 'nested.key')
  locales: ["en", "fr"], // Langues supportées
  output: "public/locales/$LOCALE/$NAMESPACE.json", // Dossier de sortie des fichiers de traduction
  input: ["src/**/*.{ts,tsx}"], // Fichiers à analyser
  sort: true, // Trier les clés dans les fichiers JSON
  verbose: false, // Afficher les logs
}
