import type { Operation } from "@/models/reabo.models";

/**
 * Réabonnement receipt for one operation.
 *
 * ReaboCanal has no invoice endpoint: `admin-web` renders its grid row into a
 * PDF on the client, and so does this — same A7 ticket, same fields, same
 * wording, so the document a customer receives on WhatsApp is the one they
 * already know from the point of sale.
 *
 * This module holds the data shape only. The rendering lives in
 * `reaboReceiptDocument.tsx` and is reached exclusively through the dynamic
 * import below — `@react-pdf/renderer` is about a megabyte, and an agent who
 * never prints a receipt never downloads it.
 */

export interface ReceiptData {
  /** Operation number, printed next to the subscriber's in the header. */
  id: string;
  date: string;
  subscriberId: string;
  deviceNumber: string;
  customerName: string;
  plan: string;
  /** Digits only — the template appends « F.CFA ». */
  amount: string;
  startDate: string;
  endDate: string;
  issuedAt: string;
  issuedBy: string;
  contact: string;
}

/** Support line printed in the footer, as on the point-of-sale ticket. */
const SUPPORT_CONTACT = "697953920";

/**
 * Dates arrive in two shapes on the same row: the operation's timestamp is an
 * ISO instant, while the subscription's own dates are already written
 * `JJ/MM/AAAA`. Anything unparseable is therefore printed as it came rather
 * than turned into `Invalid Date`.
 */
function receiptDate(value: string | null | undefined, withTime = false): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return withTime
    ? parsed.toLocaleString("fr-FR")
    : parsed.toLocaleDateString("fr-FR");
}

/** Fields of the operation, laid out for the receipt. */
export function toReceiptData(op: Operation): ReceiptData {
  const amount = op.operAmount ?? op.transAmount ?? null;

  return {
    id:
      op.operId != null
        ? String(op.operId)
        : (op.transReferenceInterne ?? ""),
    date: receiptDate(op.operCreateDate, true),
    subscriberId: op.operNumAbo ?? "",
    deviceNumber: op.operNumDecoder ?? "",
    customerName: op.custFullName ?? "",
    plan: op.operArticles ?? op.operOperationType ?? "",
    amount: amount != null ? String(Math.round(amount)) : "",
    startDate: receiptDate(op.custStartDateAbo),
    endDate: receiptDate(op.custEndDateAbo),
    issuedAt: receiptDate(op.operCreateDate, true),
    issuedBy: op.usersFullName ?? "",
    contact: SUPPORT_CONTACT,
  };
}

/**
 * Renders the receipt to a PDF blob, loading the renderer on demand.
 *
 * Returns the blob rather than saving it: the caller decides between a download
 * and sending it to the customer over WhatsApp, and the file is built once
 * either way.
 */
export async function buildReceiptBlob(data: ReceiptData): Promise<Blob> {
  const { renderReceipt } = await import("./reaboReceiptDocument");
  return renderReceipt(data);
}
