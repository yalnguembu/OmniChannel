/**
 * Customer-facing messages suggested after a Reabo operation.
 *
 * They are never sent automatically: they land in the composer, the agent reads
 * them and presses send. That is deliberate — the agent knows the tone the
 * conversation has taken, and a canned message fired behind their back would be
 * the fastest way to make this tool untrustworthy.
 */

/** Trailing comma only when there is a name to greet. */
function greeting(name?: string | null): string {
  const trimmed = (name ?? "").trim();
  return trimmed ? `Bonjour ${trimmed},` : "Bonjour,";
}

export function reactivationMessage(params: {
  name?: string | null;
  decoder?: string | null;
}): string {
  const decoder = params.decoder ? ` ${params.decoder}` : "";
  return [
    greeting(params.name),
    `La réactivation des images de votre décodeur${decoder} vient d'être lancée.`,
    "",
    "Merci d'éteindre puis de rallumer votre décodeur, et de patienter quelques minutes le temps que les chaînes reviennent.",
  ].join("\n");
}

export function subscriptionDoneMessage(params: {
  name?: string | null;
  decoder?: string | null;
  offre?: string | null;
  duree?: number | null;
  isUpgrade?: boolean;
}): string {
  const what = params.isUpgrade ? "Votre changement d'offre" : "Votre réabonnement";
  const duree = params.duree ? ` pour ${params.duree} mois` : "";
  return [
    greeting(params.name),
    `${what} est enregistré : ${params.offre ?? "votre offre"}${duree}, sur le décodeur ${params.decoder ?? ""}.`.trim(),
    "",
    "Si les chaînes ne reviennent pas tout de suite, éteignez puis rallumez votre décodeur et patientez quelques minutes.",
  ].join("\n");
}

export interface PayLinkMessageParams {
  offre?: string | null;
  options?: string | null;
  duree?: number | null;
  montant?: number | null;
  decoder?: string | null;
  payUrl?: string | null;
}

/**
 * The payment-link message, in the wording My Reabo already uses.
 *
 * Three rules the template imposes, each of them load-bearing:
 * - `Options` reads **Aucune** when there is none, never an empty line — the
 *   customer is being asked to check what they are paying for.
 * - the amount is written plainly, `5000` and not `5 000`, as in the reference
 *   wording: a thousands separator is one more character for the customer to
 *   mistake for a digit when they retype the sum into their payment app.
 * - the link sits alone on its line with nothing glued to it: WhatsApp stops
 *   linkifying a URL that ends against punctuation, and an unclickable payment
 *   link is a payment that does not happen.
 */
export function payLinkMessage(params: PayLinkMessageParams): string {
  const options = (params.options ?? "").trim() || "Aucune";
  const duree = params.duree ?? 1;
  const montant =
    params.montant != null && Number.isFinite(params.montant)
      ? String(Math.round(params.montant))
      : "—";

  return [
    `Offre : ${params.offre ?? "—"}`,
    `Options : ${options}`,
    `Durée : ${duree} mois`,
    `Montant : ${montant} FCFA`,
    `Décodeur : ${params.decoder ?? "—"}`,
    "",
    "⚠️ Vérifiez bien le numéro de décodeur ci-dessus avant de payer.",
    "En cas d'erreur de votre part sur le numéro de décodeur, nous ne pourrons pas annuler ni rembourser le paiement.",
    "",
    "Payez en 30 secondes via Orange Money ou MTN MoMo 👇",
    params.payUrl ?? "",
    "",
    "Dès réception de votre paiement, notre équipe active immédiatement votre réabonnement et vous envoie votre reçu directement ici.",
  ].join("\n");
}
