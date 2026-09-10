import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions, Platform } from "react-native";

/**
 * Métadonnées d'appareil envoyées avec le login (`platform` / `hardwareId` /
 * `screenResolution`) — équivalent mobile de `src/lib/device.ts` du web.
 * L'utilisateur ne les saisit jamais.
 */

const HARDWARE_ID_KEY = "oc-hardware-id";

export function getPlatform(): string {
  return Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web";
}

export function getScreenResolution(): string {
  const { width, height, scale } = Dimensions.get("window");
  return `${Math.round(width * scale)}x${Math.round(height * scale)}`;
}

/**
 * Identifiant d'installation stable : généré une fois puis persisté, afin que le
 * backend voie le même appareil d'une connexion à l'autre (il signale sinon un
 * « nouvel appareil » à chaque login).
 */
export async function getHardwareId(): Promise<string> {
  try {
    let id = await AsyncStorage.getItem(HARDWARE_ID_KEY);
    if (!id) {
      id = `hw-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem(HARDWARE_ID_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export async function getDeviceInfo(): Promise<{
  platform: string;
  hardwareId: string;
  screenResolution: string;
}> {
  return {
    platform: getPlatform(),
    hardwareId: await getHardwareId(),
    screenResolution: getScreenResolution(),
  };
}
