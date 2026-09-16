import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";
import { colors, radius } from "@/theme";

type ToastKind = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  duration: number;
}

interface ToastState {
  items: ToastItem[];
  push: (kind: ToastKind, message: string, duration?: number) => void;
  dismiss: (id: number) => void;
}

const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (kind, message, duration = 2600) =>
    set((s) => ({
      // Au plus trois toasts empilés : au-delà on masque l'écran pour rien.
      items: [...s.items, { id: Date.now() + Math.random(), kind, message, duration }].slice(-3),
    })),
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

/**
 * Même surface d'appel que `sonner` côté web (`toast.success(...)`), pour que le
 * code porté depuis les hooks du web reste lisible à l'identique.
 */
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().push("success", message, duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().push("error", message, duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().push("info", message, duration),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().push("warning", message, duration),
};

const ICONS: Record<ToastKind, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const TINTS: Record<ToastKind, string> = {
  success: colors.greenSend,
  error: colors.danger,
  info: colors.teal,
  warning: "#d97706",
};

function Toast({ item }: { item: ToastItem }) {
  const Icon = ICONS[item.kind];
  const dismiss = useToastStore((s) => s.dismiss);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }).start(() =>
        dismiss(item.id),
      );
    }, item.duration);
    return () => clearTimeout(timer);
  }, [dismiss, item.duration, item.id, opacity]);

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <Icon size={18} color={TINTS[item.kind]} />
      <Pressable style={styles.pressable} onPress={() => dismiss(item.id)}>
        <Text style={styles.text} numberOfLines={3}>
          {item.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/** À monter une seule fois, au-dessus de la navigation. */
export function ToastHost() {
  const items = useToastStore((s) => s.items);
  const insets = useSafeAreaInsets();
  if (items.length === 0) return null;
  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom: insets.bottom + 76 }]}>
      {items.map((item) => (
        <Toast key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 12,
    right: 12,
    gap: 8,
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressable: { flex: 1 },
  text: { color: colors.text, fontSize: 13.5, lineHeight: 18 },
});
