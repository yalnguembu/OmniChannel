import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReaboSheet, ReaboPrimaryButton } from "./ReaboSheet";
import {
  useCreatePayLink,
  useEstimateFluxPrice,
  useEstimateOperationPrice,
  useExecuteOperation,
  usePaymentMethods,
  PAYMENT_METHOD_BALANCE,
} from "@/hooks/useReabo";
import { useSendText } from "@/hooks/useWhatsapp";
import { useWhatsAppStore } from "@/store/useWhatsappStore";
import { payLinkMessage, subscriptionDoneMessage } from "@/lib/reaboMessages";
import {
  fmtFcfa,
  paymentMethodCode,
  toLocalPayer,
  type SubscriptionDetails,
} from "@/models/reabo.models";
import {
  TONE_ACCENT,
  TONE_ERROR_BAND,
  TONE_ERROR_TEXT,
  TONE_FIELD_FOCUS,
  TONE_SELECTED,
} from "./tone";
import type {
  ReaboRequest,
  UpgrateRequest,
} from "@/shared/api/reabo/generated/types.gen";

/**
 * Several option codes travel in the single `options` string of a
 * `ReaboFluxRequest`. The DTO documents no format; a comma is the convention
 * the rest of the platform uses for code lists.
 */
const OPTION_SEPARATOR = ",";

export type ReaboOperationMode = "paylink" | "reabo" | "upgrade";

const TITLES: Record<ReaboOperationMode, string> = {
  paylink: "Lien de paiement",
  reabo: "Réabonner",
  upgrade: "Changer d'offre",
};

interface ReaboOperationSheetProps {
  open: boolean;
  mode: ReaboOperationMode;
  onClose: () => void;
  details: SubscriptionDetails;
}

/** Section heading inside the sheet. */
const Group: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="border-b border-wa-border px-4 py-4 last:border-0">
    <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-wa-muted">
      {label}
    </p>
    {children}
  </div>
);

const Fact: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-baseline gap-3 py-1">
    <span className="w-28 shrink-0 text-xs text-wa-muted">{label}</span>
    <span className="min-w-0 break-words text-sm text-wa-text">{value || "—"}</span>
  </div>
);

const selectClass =
  `w-full rounded-lg border border-wa-border bg-white px-3 py-2.5 text-sm text-wa-text ${TONE_FIELD_FOCUS}`;

/**
 * The three commercial flows, in one surface.
 *
 * They share everything that matters — the same catalogue, the same
 * server-quoted amount, the same message written back to the customer — and
 * differ only in how the money moves: a link the customer opens, a mobile debit,
 * or the agent's balance. Splitting them into three components would have
 * duplicated the part that must never drift.
 *
 * Nothing is ever sent on the customer's behalf without the agent reading it:
 * the last step is the message itself, editable, with an explicit send.
 */
export const ReaboOperationSheet: React.FC<ReaboOperationSheetProps> = ({
  open,
  mode,
  onClose,
  details,
}) => {
  const activeConv = useWhatsAppStore((s) => s.getActiveConversation());
  const sendText = useSendText();

  const offers = details.offres ?? [];
  const durations = details.durees ?? [];
  const decoder = details.numdecabo ?? "";
  const numabo = details.numabo ?? "";
  const subscriptionNumber = details.subscriptionNumber ?? 0;

  const [step, setStep] = useState<"configure" | "confirm" | "preview">("configure");
  const [offerCode, setOfferCode] = useState("");
  const [duree, setDuree] = useState(1);
  const [optionCodes, setOptionCodes] = useState<string[]>([]);
  const [methodCode, setMethodCode] = useState<number>(0);
  const [payer, setPayer] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const methods = usePaymentMethods();
  const estimateFlux = useEstimateFluxPrice();
  const estimateOperation = useEstimateOperationPrice(
    mode === "upgrade" ? "upgrade" : "reabo",
  );
  const createLink = useCreatePayLink();
  const execute = useExecuteOperation(mode === "upgrade" ? "upgrade" : "reabo");

  const isPayLink = mode === "paylink";
  const isUpgrade = mode === "upgrade";
  const useBalance = methodCode === PAYMENT_METHOD_BALANCE;

  // Reset on open: the sheet is reused for three flows and several subscribers,
  // so stale state from a previous run is a real hazard, not a theoretical one.
  useEffect(() => {
    if (!open) return;
    const current =
      offers.find((o) => o.code && o.code === details.offreCodeLC) ?? offers[0];
    setStep("configure");
    setOfferCode(current?.code ?? "");
    setOptionCodes([]);
    setDuree(durations[0]?.value ?? 1);
    setPrice(null);
    setError(null);
    setMessage("");
    setPayer(toLocalPayer(activeConv?.contactAddress ?? details.telephoneAbonne));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  // First active method, once the catalogue answers.
  useEffect(() => {
    if (methodCode || !methods.data?.length) return;
    const active = methods.data.find((m) => m.activate !== false) ?? methods.data[0];
    setMethodCode(paymentMethodCode(active));
  }, [methods.data, methodCode]);

  const offer = useMemo(
    () => offers.find((o) => o.code === offerCode) ?? null,
    [offers, offerCode],
  );
  const availableOptions = offer?.options ?? [];
  const optionsField = optionCodes.join(OPTION_SEPARATOR);
  const optionLabels =
    availableOptions
      .filter((o) => o.codeOption && optionCodes.includes(o.codeOption))
      .map((o) => o.descriptionOption || o.codeOption)
      .join(", ") || "";

  /** The body both the estimate and the operation are built from. */
  const operationBody = useMemo((): ReaboRequest | UpgrateRequest => {
    const paiementDetails = {
      payer,
      amount: price ?? 0,
      methodePaiement: methodCode,
    };
    if (isUpgrade) {
      return {
        numabo: Number(numabo),
        offreCode: offerCode,
        subscriptionNumber,
        option: optionCodes,
        paiementDetails,
      } as UpgrateRequest;
    }
    return {
      offreCode: offerCode,
      option: optionCodes[0] ?? "",
      subscriptionNumber,
      duree,
      telephone: details.telephoneAbonne ?? "",
      numabo: String(numabo),
      paiementDetails,
    } as ReaboRequest;
  }, [
    isUpgrade,
    numabo,
    offerCode,
    subscriptionNumber,
    optionCodes,
    duree,
    details.telephoneAbonne,
    payer,
    price,
    methodCode,
  ]);

  // Every change to the order invalidates the amount and asks the server again
  // — the total is never assembled from catalogue prices on this side.
  useEffect(() => {
    if (!open || !offerCode || step !== "configure") return;
    let cancelled = false;
    setPrice(null);
    setError(null);

    const request = isPayLink
      ? estimateFlux.mutateAsync({
          numdec: decoder,
          offre: offerCode,
          options: optionsField,
          duree,
          montant: 0,
        })
      : estimateOperation.mutateAsync(operationBody);

    request
      .then((value) => {
        if (!cancelled) setPrice(value);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, offerCode, optionsField, duree, isPayLink, decoder]);

  const toggleOption = (code: string) =>
    setOptionCodes((codes) =>
      codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code],
    );

  const isEstimating = estimateFlux.isPending || estimateOperation.isPending;

  const onCreateLink = async () => {
    if (price == null) return;
    try {
      const link = await createLink.mutateAsync({
        numdec: decoder,
        offre: offerCode,
        options: optionsField,
        duree,
        montant: price,
      });
      setMessage(
        payLinkMessage({
          offre: offer?.description || offerCode,
          options: optionLabels,
          duree,
          montant: link.montant ?? price,
          decoder,
          payUrl: link.payUrl,
        }),
      );
      setStep("preview");
    } catch (e) {
      toast.error((e as Error)?.message ?? "Création du lien impossible");
    }
  };

  const onExecute = async () => {
    if (price == null) return;
    try {
      await execute.mutateAsync({
        body: { ...operationBody, paiementDetails: { payer, amount: price, methodePaiement: methodCode } },
        useBalance,
      });
      toast.success(isUpgrade ? "Changement d'offre lancé" : "Réabonnement lancé");
      setMessage(
        subscriptionDoneMessage({
          name: details.prenomabo,
          decoder,
          offre: offer?.description || offerCode,
          duree: isUpgrade ? null : duree,
          isUpgrade,
        }),
      );
      setStep("preview");
    } catch (e) {
      toast.error((e as Error)?.message ?? "Opération refusée");
    }
  };

  const onSend = async () => {
    const to = activeConv?.contactAddress ?? "";
    if (!to || !message.trim()) return;
    try {
      await sendText.mutateAsync({ to, body: message });
      toast.success("Message envoyé");
      onClose();
    } catch (e) {
      toast.error((e as Error)?.message ?? "Envoi impossible");
    }
  };

  const payerIsValid = useBalance || payer.length === 9;
  const canContinue = price != null && !isEstimating && (isPayLink || payerIsValid);

  const footer = (() => {
    if (step === "preview") {
      return (
        <ReaboPrimaryButton onClick={onSend} disabled={sendText.isPending || !message.trim()}>
          {sendText.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          Envoyer au client
        </ReaboPrimaryButton>
      );
    }
    if (step === "confirm") {
      return (
        <ReaboPrimaryButton onClick={onExecute} disabled={execute.isPending}>
          {execute.isPending && <Loader2 size={16} className="animate-spin" />}
          {useBalance ? "Payer sur le solde" : `Encaisser ${fmtFcfa(price)}`}
        </ReaboPrimaryButton>
      );
    }
    return (
      <ReaboPrimaryButton
        onClick={isPayLink ? onCreateLink : () => setStep("confirm")}
        disabled={!canContinue || createLink.isPending}
      >
        {createLink.isPending && <Loader2 size={16} className="animate-spin" />}
        {isPayLink ? "Créer le lien" : "Continuer"}
      </ReaboPrimaryButton>
    );
  })();

  return (
    <ReaboSheet
      open={open}
      title={TITLES[mode]}
      onClose={onClose}
      onBack={step === "configure" ? undefined : () => setStep("configure")}
      footer={footer}
    >
      {step === "preview" ? (
        <div className="px-4 py-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-wa-muted">
            Message à envoyer
          </p>
          {/* Editable on purpose: the agent knows the tone this conversation
              has taken, and a canned paragraph is worse than a corrected one. */}
          <textarea
            id="reabo-preview-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={16}
            className={cn(
              "w-full resize-none rounded-lg border border-wa-border bg-white px-3 py-2.5",
              "text-sm leading-relaxed text-wa-text",
              TONE_FIELD_FOCUS,
            )}
          />
          <p className="pt-2 text-xs text-wa-muted">
            Relisez avant d'envoyer — le message part dans la conversation
            {activeConv?.contactAddress ? ` avec ${activeConv.contactAddress}` : ""}.
          </p>
        </div>
      ) : step === "confirm" ? (
        <div className="px-4 py-4">
          <p className="mb-3 text-sm text-wa-text">
            {useBalance
              ? "Le montant sera débité de votre solde."
              : "Le client va recevoir une demande de paiement sur son téléphone."}
          </p>
          <div className="rounded-lg border border-wa-border px-3 py-2">
            <Fact label="Abonné" value={`${details.nomabo ?? ""} ${details.prenomabo ?? ""}`.trim()} />
            <Fact label="Décodeur" value={decoder} />
            <Fact label="Offre" value={offer?.description || offerCode} />
            {!isUpgrade && <Fact label="Durée" value={`${duree} mois`} />}
            <Fact label="Options" value={optionLabels || "Aucune"} />
            <Fact
              label="Paiement"
              value={
                methods.data?.find((m) => paymentMethodCode(m) === methodCode)?.name ??
                String(methodCode)
              }
            />
            {!useBalance && <Fact label="Payeur" value={payer} />}
            <Fact
              label="Montant"
              value={<span className="font-semibold">{fmtFcfa(price)}</span>}
            />
          </div>
          <p className="pt-3 text-xs text-wa-muted">
            Cette opération ne peut pas être annulée.
          </p>
        </div>
      ) : (
        <>
          <Group label="Décodeur">
            <p className="font-mono text-sm text-wa-text">{decoder || "—"}</p>
            <p className="text-xs text-wa-muted">
              {`${details.nomabo ?? ""} ${details.prenomabo ?? ""}`.trim()}
            </p>
          </Group>

          <Group label="Offre">
            <select
              id="reabo-offer"
              value={offerCode}
              onChange={(e) => {
                setOfferCode(e.target.value);
                setOptionCodes([]);
              }}
              className={selectClass}
            >
              {offers.map((o) => (
                <option key={o.code ?? ""} value={o.code ?? ""}>
                  {o.description || o.code}
                </option>
              ))}
            </select>
          </Group>

          {!isUpgrade && (
            <Group label="Durée">
              <select
                id="reabo-duration"
                value={duree}
                onChange={(e) => setDuree(Number(e.target.value))}
                className={selectClass}
              >
                {(durations.length ? durations : [{ value: 1, description: "1 mois" }]).map(
                  (d) => (
                    <option key={d.value ?? 1} value={d.value ?? 1}>
                      {d.description || `${d.value} mois`}
                    </option>
                  ),
                )}
              </select>
            </Group>
          )}

          {availableOptions.length > 0 && (
            <Group label="Options">
              <div className="space-y-1">
                {availableOptions.map((o) => (
                  <label
                    key={o.codeOption ?? ""}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm hover:bg-wa-hover"
                  >
                    <input
                      type="checkbox"
                      className={TONE_ACCENT}
                      checked={optionCodes.includes(o.codeOption ?? "")}
                      onChange={() => toggleOption(o.codeOption ?? "")}
                    />
                    <span className="flex-1 text-wa-text">
                      {o.descriptionOption || o.codeOption}
                    </span>
                    <span className="tabular-nums text-wa-muted">
                      {fmtFcfa(o.priceOption ?? null)}
                    </span>
                  </label>
                ))}
              </div>
            </Group>
          )}

          {!isPayLink && (
            <Group label="Paiement">
              <div className="space-y-1.5">
                {(methods.data ?? [])
                  .filter((m) => m.activate !== false)
                  .map((m) => (
                    <label
                      key={paymentMethodCode(m)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm",
                        methodCode === paymentMethodCode(m)
                          ? TONE_SELECTED
                          : "border-wa-border",
                      )}
                    >
                      <input
                        type="radio"
                        name="reabo-method"
                        className={TONE_ACCENT}
                        checked={methodCode === paymentMethodCode(m)}
                        onChange={() => setMethodCode(paymentMethodCode(m))}
                      />
                      <span className="flex-1 text-wa-text">{m.name || m.code}</span>
                    </label>
                  ))}
              </div>

              {!useBalance && (
                <div className="pt-3">
                  <label
                    htmlFor="reabo-payer"
                    className="mb-1.5 block text-xs text-wa-muted"
                  >
                    Numéro payeur (9 chiffres)
                  </label>
                  <input
                    id="reabo-payer"
                    inputMode="numeric"
                    value={payer}
                    onChange={(e) =>
                      setPayer(e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    className={selectClass}
                  />
                  {payer.length > 0 && payer.length !== 9 && (
                    <p className={cn("pt-1 text-xs", TONE_ERROR_TEXT)}>
                      Il faut exactement 9 chiffres.
                    </p>
                  )}
                </div>
              )}
            </Group>
          )}

          <div className="flex items-baseline gap-3 px-4 py-4">
            <span className="text-sm text-wa-muted">Montant</span>
            <span className="ml-auto text-xl font-semibold tabular-nums text-wa-text">
              {isEstimating ? (
                <Loader2 size={18} className="animate-spin text-wa-muted" />
              ) : (
                fmtFcfa(price)
              )}
            </span>
          </div>

          {error && (
            <p className={cn("mx-4 mb-4 rounded-lg px-3 py-2 text-sm", TONE_ERROR_BAND)}>
              {error}
            </p>
          )}
        </>
      )}
    </ReaboSheet>
  );
};
