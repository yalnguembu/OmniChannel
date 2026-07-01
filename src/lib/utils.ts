import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000)
    return (value / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (value >= 1000) return (value / 1000).toFixed(1).replace(".0", "") + "k";
  return String(value);
}

export function fmtCurrency(value: number, currency = "XAF"): string {
  return `${value.toLocaleString("fr-FR")} ${currency}`;
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export function avatarColor(name: string): string {
  const colors = [
    "#2E8FAD",
    "#1B5E82",
    "#E8541A",
    "#16A34A",
    "#7C3AED",
    "#D97706",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    active: "bg-green-50 text-green-700 border border-green-200",
    inactive: "bg-gray-100 text-gray-600 border border-gray-200",
    paused: "bg-amber-50 text-amber-700 border border-amber-200",
    draft: "bg-gray-100 text-gray-500 border border-gray-200",
    blocked: "bg-red-50 text-red-700 border border-red-200",
    completed: "bg-gray-100 text-gray-600 border border-gray-200",
    scheduled: "bg-amber-50 text-amber-700 border border-amber-200",
    failed: "bg-red-50 text-red-700 border border-red-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    delivered: "bg-green-50 text-green-700 border border-green-200",
    opened: "bg-blue-50 text-blue-700 border border-blue-200",
    paid: "bg-green-50 text-green-700 border border-green-200",
    overdue: "bg-red-50 text-red-700 border border-red-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-500 border border-gray-200";
}

/** Maps a 0-100 percentage to a semantic color (used by gauges/timelines). */
export function levelColor(pct: number): string {
  if (pct >= 75) return "#16A34A";
  if (pct >= 40) return "#D97706";
  return "#DC2626";
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "Actif",
    inactive: "Inactif",
    paused: "En pause",
    draft: "Brouillon",
    blocked: "Bloqué",
    completed: "Terminé",
    scheduled: "Planifié",
    failed: "Échoué",
    pending: "En attente",
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
  return map[status] ?? status;
}
