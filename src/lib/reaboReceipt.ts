import type { Operation } from "@/models/reabo.models";

/**
 * Customer receipt for one operation.
 *
 * ReaboCanal has no invoice endpoint: `admin-web` renders its grid row into a
 * PDF on the client, and so does this. Everything printed therefore comes from
 * the operation itself, so a receipt can never show a figure the operation does
 * not carry.
 *
 * This module holds the data shape only. The rendering lives in
 * `reaboReceiptDocument.tsx` and is reached exclusively through the dynamic
 * import below — `@react-pdf/renderer` is about a megabyte, and an agent who
 * never prints a receipt never downloads it.
 */

export interface ReceiptData {
  reference: string;
  date: string;
  subscriberNumber: string;
  decoder: string;
  contract: string;
  customerName: string;
  plan: string;
  amount: string;
  fees: string;
  paymentMethod: string;
  payer: string;
  periodStart: string;
  periodEnd: string;
  issuedBy: string;
}

/** Fields of the operation, laid out for the receipt. */
export function toReceiptData(
  op: Operation,
  fmtAmount: (value: number | null | undefined) => string,
): ReceiptData {
  return {
    reference:
      op.transReferenceInterne ||
      op.transReferenceProvider ||
      (op.operId != null ? String(op.operId) : "—"),
    date: op.operCreateDate ?? "",
    subscriberNumber: op.operNumAbo ?? "",
    decoder: op.operNumDecoder ?? "",
    contract: op.operNumContrat != null ? String(op.operNumContrat) : "",
    customerName: op.custFullName ?? "",
    plan: op.operArticles ?? op.operOperationType ?? "",
    amount: fmtAmount(op.operAmount ?? op.transAmount ?? null),
    fees: op.transFees != null ? fmtAmount(op.transFees) : "",
    paymentMethod: op.transPaymentMethod ?? "",
    payer: op.transTelephonePayeur ?? "",
    periodStart: op.custStartDateAbo ?? "",
    periodEnd: op.custEndDateAbo ?? "",
    issuedBy: op.usersFullName ?? "",
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
