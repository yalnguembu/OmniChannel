/**
 * Libellés de statuts — portage de `statusLabel` de `src/lib/utils.ts` du web.
 *
 * Le backend est propriétaire de ce vocabulaire : une valeur inconnue est
 * rendue telle quelle plutôt que masquée.
 */
const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  inactive: "Inactif",
  paused: "En pause",
  draft: "Brouillon",
  blocked: "Bloqué",
  completed: "Terminé",
  scheduled: "Planifié",
  failed: "Échoué",
  pending: "En attente",
  opted_out: "Désinscrit",
  delivered: "Livré",
  opened: "Ouvert",
  paid: "Payée",
  overdue: "En retard",
  standard: "Standard",
  ai: "IA",
  trigger: "Déclenché",
  recurring: "Récurrent",
  success: "Succès",
  error: "Erreur",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
