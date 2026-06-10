/**
 * Device/client metadata sent with auth requests (LoginRequest:
 * platform / hardwareId / screenResolution). Computed in the background — the
 * user never fills these in.
 */

const HARDWARE_ID_KEY = "oc-hardware-id";

/** Platform tag for this client. */
export function getPlatform(): string {
  return "Web";
}

/** Current screen resolution, e.g. "1920x1080". */
export function getScreenResolution(): string {
  if (typeof window === "undefined" || !window.screen) return "unknown";
  const { width, height } = window.screen;
  return `${width}x${height}`;
}

/**
 * A stable, per-browser device identifier. Generated once and persisted in
 * localStorage so the same browser reports the same id across logins.
 */
export function getHardwareId(): string {
  if (typeof window === "undefined") return "unknown";
  try {
    let id = window.localStorage.getItem(HARDWARE_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `hw-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(HARDWARE_ID_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

/** All client metadata fields for a LoginRequest. */
export function getDeviceInfo(): {
  platform: string;
  hardwareId: string;
  screenResolution: string;
} {
  return {
    platform: getPlatform(),
    hardwareId: getHardwareId(),
    screenResolution: getScreenResolution(),
  };
}
