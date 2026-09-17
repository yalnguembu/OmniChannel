/**
 * Response unwrapping for the ReaboCanal API.
 *
 * ReaboCanal does **not** signal success through the HTTP status: every
 * response carries an envelope and the call succeeded only when its `code`
 * (or `status`) is `0`. A 200 holding a business error is normal — a failed
 * payment, an unknown subscriber, an expired CGA session all come back that
 * way, with the message to show the agent in `message`.
 *
 * This is incompatible with `handleRequest()` in `shared/api/setup.ts`, which
 * reads `response.error` and treats any 200 as a success. Hence a dedicated
 * unwrapper, mirroring the `unwrap()` helper in ReaboCanal's own
 * `admin-web/src/components/PaymentForm.tsx`.
 */

const DEFAULT_ERROR = "Une erreur est survenue";

export type ReaboResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

interface Envelope {
  status?: number;
  code?: number;
  message?: string | null;
  data?: unknown;
}

function isEnvelope(body: unknown): body is Envelope {
  return (
    !!body &&
    typeof body === "object" &&
    ("code" in body || "status" in body) &&
    ("message" in body || "data" in body)
  );
}

/** The SDK shape: axios responses land in `data`, thrown ones in `error`. */
interface SdkResult {
  data?: unknown;
  error?: unknown;
}

/**
 * Normalises one generated SDK call into a discriminated result.
 *
 * Never reports success without a body: a forgotten `await` used to land here
 * and wrongly showed the "payment initiated" screen in `admin-web`.
 */
export function unwrapReabo<T>(res: SdkResult): ReaboResult<T> {
  const body = res?.data ?? res?.error;

  if (body == null || typeof (body as { then?: unknown })?.then === "function") {
    return { success: false, message: DEFAULT_ERROR };
  }

  if (isEnvelope(body)) {
    const ok = body.code === 0 || body.status === 0;
    if (!ok) return { success: false, message: body.message || DEFAULT_ERROR };
    return { success: true, data: (body.data ?? null) as T };
  }

  if (res?.error) {
    const message =
      typeof res.error === "string"
        ? res.error
        : (res.error as { message?: string })?.message || DEFAULT_ERROR;
    return { success: false, message };
  }

  return { success: true, data: ((body as Envelope)?.data ?? body) as T };
}

/** Message carried by a rejected promise (network error, thrown interceptor). */
export function reaboErrorMessage(error: unknown): string {
  const e = error as {
    response?: { data?: { message?: string } };
    data?: { message?: string };
    message?: string;
  };
  return (
    e?.response?.data?.message ??
    e?.data?.message ??
    e?.message ??
    DEFAULT_ERROR
  );
}

/**
 * Runs an SDK call and returns a result, turning a rejection into a failure
 * rather than letting it escape — the two error channels (envelope and throw)
 * are then handled in one place by the caller.
 */
export async function callReabo<T>(
  request: Promise<SdkResult>,
): Promise<ReaboResult<T>> {
  try {
    return unwrapReabo<T>(await request);
  } catch (error) {
    return { success: false, message: reaboErrorMessage(error) };
  }
}
