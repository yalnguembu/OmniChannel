import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Side-effect import: configures the ReaboCanal axios instance.
import "@/shared/api/reabo/client";
import {
  getApiV1MyposSearchSubscriberUserBySearchAttribute,
  getApiV1MyposDetailsResubscribingByNumaboBySubscriptionNumber,
  getApiV1TransactionGetLastOperationsByNumdec,
  getApiV1TransactionGetPagedOperationDetailsByPageIndexByPageSize,
  getApiV1MyposVerifyById,
  postApiV1MyposReactivateDecoderUserByNumaboBySubscriptionNumber,
  postApiV1MyposFluxEstimatePriceReabo,
  postApiV1MyposFluxCreatePayLink,
  postApiV1MyposEstimatePriceReabonnementUser,
  postApiV1MyposEstimatePriceUpgrateUser,
  postApiV1MyposReabonnementUser,
  postApiV1MyposReabonnementUserUseSolde,
  postApiV1MyposUpgrateUser,
  postApiV1MyposUpgrateUserUseSolde,
  getApiV1PaymentMethodGetAll,
} from "@/shared/api/reabo/generated/sdk.gen";
import type {
  ReaboFluxRequest,
  ReaboRequest,
  UpgrateRequest,
} from "@/shared/api/reabo/generated/types.gen";
import { callReabo } from "@/shared/api/reabo/unwrap";
import { useReaboAuthStore } from "@/store/useReaboAuthStore";
import {
  parseSubscribers,
  parseSubscriptionDetails,
  parseOperations,
  parsePaymentLink,
  parsePaymentMethods,
  parsePrice,
  toOperationRangeIso,
  type Subscriber,
  type SubscriptionDetails,
  type Operation,
  type PaymentLink,
  type PaymentMethod,
} from "@/models/reabo.models";

export const reaboDataKeys = {
  all: ["reabo-data"] as const,
  subscribers: (term: string) => [...reaboDataKeys.all, "subscribers", term] as const,
  details: (numabo: number, sub: number) =>
    [...reaboDataKeys.all, "details", numabo, sub] as const,
  operations: (numdec: string, nbOper: number, statut: string) =>
    [...reaboDataKeys.all, "operations", numdec, nbOper, statut] as const,
};

/** Nothing is fetched while the agent has no ReaboCanal session. */
function useReaboReady(): boolean {
  return useReaboAuthStore((s) => !!s.token);
}

/** How long a resolved search stays fresh — also used by the thread scan. */
export const SUBSCRIBER_STALE_TIME = 5 * 60_000;

/**
 * One subscriber lookup. Exported so the thread scan can resolve candidates
 * imperatively through `queryClient.fetchQuery` under the same key, and share
 * one cache with the declarative hook below.
 */
export async function fetchSubscribers(
  searchAttribute: string,
): Promise<Subscriber[]> {
  const res = await callReabo<unknown>(
    getApiV1MyposSearchSubscriberUserBySearchAttribute({
      path: { searchAttribute },
    }),
  );
  if (!res.success) throw new Error(res.message);
  return parseSubscribers(res.data);
}

/**
 * Resolve a phone number, a decoder number or a name into subscribers.
 *
 * The `-user` variant, as admin-web uses: it is the private one, scoped to the
 * connected account. Disabled on an empty term — the search attribute sits in
 * the path, so an empty one answers 404 and pops an error before the agent has
 * typed anything.
 */
export function useReaboSubscribers(term: string, enabled = true) {
  const ready = useReaboReady();
  const searchAttribute = term.trim();

  return useQuery({
    queryKey: reaboDataKeys.subscribers(searchAttribute),
    enabled: ready && enabled && searchAttribute.length > 0,
    staleTime: SUBSCRIBER_STALE_TIME,
    queryFn: () => fetchSubscribers(searchAttribute),
  });
}

/**
 * Current subscription, offers, durations and promotions in one call.
 *
 * `subscriptionNumber` is the subscriber's **`cabo`**, taken from the search
 * result — see `subscriptionKey()`. The endpoint is the variant *without*
 * `-user`, on purpose: its `-user` twin returns an empty `telephoneAbonne`.
 */
export function useSubscriptionDetails(
  numabo: number | null,
  subscriptionNumber: number | null,
  enabled = true,
) {
  const ready = useReaboReady();
  const hasKey = !!numabo && !!subscriptionNumber;

  return useQuery({
    queryKey: reaboDataKeys.details(numabo ?? 0, subscriptionNumber ?? 0),
    enabled: ready && enabled && hasKey,
    staleTime: 2 * 60_000,
    queryFn: async (): Promise<SubscriptionDetails | null> => {
      const res = await callReabo<unknown>(
        getApiV1MyposDetailsResubscribingByNumaboBySubscriptionNumber({
          path: {
            numabo: numabo as number,
            subscriptionNumber: subscriptionNumber as number,
          },
        }),
      );
      if (!res.success) throw new Error(res.message);
      return parseSubscriptionDetails(res.data);
    },
  });
}

/**
 * Price of a payment link, before creating it.
 *
 * Same body as the creation call, so the amount the customer will be asked for
 * is the amount the link is created with — never a figure computed locally.
 */
export function useEstimateFluxPrice() {
  return useMutation({
    mutationFn: async (body: ReaboFluxRequest): Promise<number | null> => {
      const res = await callReabo<unknown>(
        postApiV1MyposFluxEstimatePriceReabo({ body }),
      );
      if (!res.success) throw new Error(res.message);
      return parsePrice(res.data);
    },
  });
}

/**
 * Creates the payment link the customer pays from.
 *
 * In `myreabo` the five fields of a `ReaboFluxRequest` are typed by hand in a
 * modal; here they all come from the subscription already on screen, so the
 * agent checks rather than transcribes.
 *
 * **Not implemented: following the link's fate.** The endpoint answers with the
 * bare URL, so nothing tells us whether the customer has paid — no `isUsed`, no
 * `expiresAt`. Showing "envoyé il y a 2 h — non utilisé" on the subscriber card
 * therefore needs a second read, and `parsePaymentLink` already recovers the
 * guid from the URL for exactly that purpose:
 *
 * - `GET /mypos/data-reabo-link/{linkGuid}` for one link, or
 * - `GET /payment-links/get-paged/{i}/{n}` to list them.
 *
 * Deliberately left out for now: creating the link is the part that saves the
 * agent time, knowing which ones went unpaid is the part that would save their
 * day, and it can be added without touching anything above.
 */
export function useCreatePayLink() {
  return useMutation({
    mutationFn: async (body: ReaboFluxRequest): Promise<PaymentLink> => {
      const res = await callReabo<unknown>(
        postApiV1MyposFluxCreatePayLink({ body }),
      );
      if (!res.success) throw new Error(res.message);
      const link = parsePaymentLink(res.data);
      // A link without a URL is not a link: failing here beats sending the
      // customer a message with an empty line where the payment should be.
      if (!link) throw new Error("Lien de paiement créé sans URL exploitable.");
      return link;
    },
  });
}

// ─── Réabonnement / upgrade ──────────────────────────────────────────────────

/**
 * Payment methods, as the platform declares them.
 *
 * Never hard-coded: `methodePaiement` is a number on the wire (1 Orange Money,
 * 2 MTN MoMo, 3 balance) but which of them are open for business is a server
 * setting, and a method shown while it is off is a payment that fails in front
 * of the customer.
 */
export function usePaymentMethods() {
  const ready = useReaboReady();

  return useQuery({
    queryKey: [...reaboDataKeys.all, "payment-methods"],
    enabled: ready,
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<PaymentMethod[]> => {
      const res = await callReabo<unknown>(getApiV1PaymentMethodGetAll({}));
      if (!res.success) throw new Error(res.message);
      return parsePaymentMethods(res.data);
    },
  });
}

/** Paying from the agent's own balance routes to the `use-solde` endpoints. */
export const PAYMENT_METHOD_BALANCE = 3;

export type OperationMode = "reabo" | "upgrade";

/**
 * Price of a réabonnement or an upgrade.
 *
 * Same body as the operation itself, as `admin-web` does: the quoted amount is
 * produced by the very call that will take the money, so the figure the agent
 * reads aloud cannot drift from the one that gets charged.
 */
export function useEstimateOperationPrice(mode: OperationMode) {
  return useMutation({
    mutationFn: async (
      body: ReaboRequest | UpgrateRequest,
    ): Promise<number | null> => {
      const res = await callReabo<unknown>(
        mode === "reabo"
          ? postApiV1MyposEstimatePriceReabonnementUser({
              body: body as ReaboRequest,
            })
          : postApiV1MyposEstimatePriceUpgrateUser({
              body: body as UpgrateRequest,
            }),
      );
      if (!res.success) throw new Error(res.message);
      return parsePrice(res.data);
    },
  });
}

/**
 * Executes a réabonnement or an upgrade — the only irreversible call in this
 * feature.
 *
 * Always the `-user` variants: they are the private ones, scoped to the
 * connected account. The balance method has its own pair of endpoints rather
 * than a flag, so the choice of method decides which function is called.
 */
export function useExecuteOperation(mode: OperationMode) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      body,
      useBalance,
    }: {
      body: ReaboRequest | UpgrateRequest;
      useBalance: boolean;
    }) => {
      const call =
        mode === "reabo"
          ? useBalance
            ? postApiV1MyposReabonnementUserUseSolde({ body: body as ReaboRequest })
            : postApiV1MyposReabonnementUser({ body: body as ReaboRequest })
          : useBalance
            ? postApiV1MyposUpgrateUserUseSolde({ body: body as UpgrateRequest })
            : postApiV1MyposUpgrateUser({ body: body as UpgrateRequest });

      const res = await callReabo<unknown>(call);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_data, { body }) => {
      const numabo = Number(body.numabo);
      const sub = Number(body.subscriptionNumber);
      // The subscription just moved; so did the balance if it paid for it.
      qc.invalidateQueries({ queryKey: reaboDataKeys.details(numabo, sub) });
      qc.invalidateQueries({ queryKey: [...reaboDataKeys.all, "operations"] });
      qc.invalidateQueries({ queryKey: ["reabo", "solde"] });
    },
  });
}

export interface OperationSearch {
  /** How many to bring back — « les 10 dernières ». */
  nbOper?: number;
  /** Provider status filter, e.g. only the successful ones. */
  statut?: string;
  /** Start of the period, ISO — « du … ». */
  startDate?: string;
  /** End of the period, ISO — « … au … ». */
  endDate?: string;
}

export interface ReactivateInput {
  numabo: number;
  /** The subscriber's `cabo`, as every other subscription call takes it. */
  subscriptionNumber: number;
}

/**
 * Re-sends the decoder's rights — "réactiver les images".
 *
 * The `-user` variant, like admin-web. Note the path pair: admin-web's own
 * reactivate call feeds this second slot from a grid column that holds
 * `debabo`, while its details call feeds the same-named slot with `cabo`. Two
 * different values for one parameter cannot both be right, and `cabo` is the
 * one proven by the details endpoint — so that is what goes out here.
 *
 * Idempotent by nature: re-sending rights that are already correct changes
 * nothing, which is why this is the safe first write to ship.
 */
export function useReactivateDecoder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ numabo, subscriptionNumber }: ReactivateInput) => {
      const res = await callReabo<string>(
        postApiV1MyposReactivateDecoderUserByNumaboBySubscriptionNumber({
          path: { numabo, subscriptionNumber },
        }),
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: (_data, { numabo, subscriptionNumber }) => {
      // The subscription state may have moved: re-read it rather than leave a
      // stale "expiré" badge next to a decoder that has just been reactivated.
      qc.invalidateQueries({
        queryKey: reaboDataKeys.details(numabo, subscriptionNumber),
      });
    },
  });
}

/**
 * Transactions matching a term — a decoder number, a phone number, a subscriber
 * number or a name.
 *
 * `recherche` on the paged view searches every key field, so the term is passed
 * straight through rather than second-guessed: asking for a decoder returns its
 * operations, asking for a payer's phone returns theirs. That view is also the
 * only one carrying `operId` and `transId`, without which a row can neither be
 * relaunched nor numbered on a receipt — which is why it is the primary source
 * and `get-last-operations` only covers the case where it fails outright.
 *
 * Each row is self-sufficient (amount, articles, payer, provider references,
 * the customer's own subscription dates), so an expanded row *is* the detail
 * view — there is no second call to make.
 */
export function useReaboOperations(
  term: string | null,
  { nbOper = 10, statut = "", startDate = "", endDate = "" }: OperationSearch = {},
  enabled = true,
) {
  const ready = useReaboReady();
  const search = (term ?? "").trim();
  // The interval is not optional: the endpoint filters strictly on it, and
  // omitting it returns nothing. Missing bounds fall back to a wide default
  // rather than to "no filter", which does not exist here.
  const range = toOperationRangeIso(startDate, endDate);

  return useQuery({
    queryKey: [
      ...reaboDataKeys.operations(search, nbOper, statut),
      range.startDateTime,
      range.endDateTime,
    ],
    enabled: ready && enabled && search.length > 0,
    staleTime: 60_000,
    queryFn: async (): Promise<Operation[]> => {
      const paged = await callReabo<{ items?: unknown[] } | unknown[]>(
        getApiV1TransactionGetPagedOperationDetailsByPageIndexByPageSize({
          path: { pageIndex: 1, pageSize: Math.max(nbOper * 2, 20) },
          query: {
            recherche: search,
            sortField: "operCreateDate",
            sortOrder: "desc",
            startDateTime: range.startDateTime,
            endDateTime: range.endDateTime,
          },
        }),
      );

      if (paged.success) {
        const rows = Array.isArray(paged.data)
          ? paged.data
          : ((paged.data as { items?: unknown[] })?.items ?? []);
        return parseOperations(rows)
          .filter((op) => !statut || (op.operStatut ?? "") === statut)
          .slice(0, nbOper);
      }

      // Only reached when the paged view itself failed. Decoder-only, and
      // without ids — the rows show, the actions that need an id do not.
      const res = await callReabo<unknown>(
        getApiV1TransactionGetLastOperationsByNumdec({
          path: { numdec: search },
          query: { nbOper, ...(statut ? { statut } : {}) },
        }),
      );
      if (!res.success) throw new Error(res.message);
      return parseOperations(res.data);
    },
  });
}

/**
 * Relaunches an operation — the same call `admin-web` puts behind "relancer".
 *
 * It asks the platform to re-check the payment with the provider and settle the
 * operation accordingly, so it is safe to repeat: it reads a state, it does not
 * take money a second time. Needs `operId`, which only the paged view returns.
 */
export function useVerifyOperation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (operationId: number) => {
      const res = await callReabo<unknown>(
        getApiV1MyposVerifyById({ path: { id: operationId } }),
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...reaboDataKeys.all, "operations"] });
    },
  });
}
