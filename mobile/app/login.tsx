import { AlertCircle, Eye, EyeOff } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL, errorMessage } from "@/api/client";
import { getMe, login } from "@/api/endpoints";
import { FullScreenLoader } from "@/components/shared/Loader";
import { getDeviceInfo } from "@/lib/device";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { colors, radius } from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async () => {
      // E-mail et mot de passe viennent du formulaire ; plateforme / hardwareId /
      // résolution sont renseignés en arrière-plan (comme sur le web).
      const device = await getDeviceInfo();
      const result = await login({
        email: email.trim(),
        password,
        ...device,
      });
      if (!result?.accessToken) throw new Error("Réponse de connexion invalide");
      setSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user
          ? {
              id: result.user.id,
              email: result.user.email,
              fullName: result.user.fullName,
              userType: result.user.userType,
              companyId: result.user.companyId,
            }
          : null,
        requiresPasswordChange: !!result.requiresPasswordChange,
      });

      if (result.isNewDevice) {
        toast.warning("Nouvel appareil détecté sur ce compte.");
      }

      // Le login renvoie un utilisateur « mince » (sans société ni permissions) :
      // /api/User/me l'enrichit. Un échec ici ne doit pas bloquer la connexion.
      try {
        const me = await getMe();
        if (me) {
          setUser({
            id: me.id,
            email: me.email,
            firstName: me.firstName,
            lastName: me.lastName,
            fullName: me.fullName,
            userType: me.userType,
            companyId: me.companyId,
            companyName: me.companyName,
            permissions: me.permissions ?? [],
          });
        }
      } catch {
        /* profil non enrichi : l'inbox fonctionne quand même */
      }
    },
    onSuccess: () => router.replace("/inbox"),
    onError: (e) => toast.error(errorMessage(e, "E-mail ou mot de passe incorrect")),
  });

  if (!hydrated) return <FullScreenLoader />;
  if (token) return <Redirect href="/inbox" />;

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loginMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../assets/logo-whatsapp.png")}
          style={styles.logo}
          accessibilityLabel="WhatsApp"
        />
        <Text style={styles.title}>OmniChannel</Text>
        <Text style={styles.subtitle}>Messagerie WhatsApp</Text>

        {!API_URL ? (
          <View style={styles.warning}>
            <AlertCircle size={18} color="#92400e" />
            <Text style={styles.warningText}>
              EXPO_PUBLIC_API_URL n'est pas défini : renseignez l'URL de l'API dans le fichier
              .env puis relancez le serveur Expo.
            </Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="prenom.nom@societe.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mot de passe</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textContentType="password"
              onSubmitEditing={() => canSubmit && loginMutation.mutate()}
              returnKeyType="go"
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eye}>
              {showPassword ? (
                <EyeOff size={20} color={colors.muted} />
              ) : (
                <Eye size={20} color={colors.muted} />
              )}
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => loginMutation.mutate()}
          disabled={!canSubmit}
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </Pressable>

        <Text style={styles.footer}>{API_URL || "Aucune API configurée"}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: 24, gap: 14 },
  logo: { alignSelf: "center", width: 70, height: 70 },
  title: { textAlign: "center", fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { textAlign: "center", fontSize: 13.5, color: colors.muted, marginBottom: 14 },
  warning: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#fef3c7",
    borderRadius: radius.md,
    padding: 12,
  },
  warningText: { flex: 1, fontSize: 12.5, color: "#92400e", lineHeight: 17 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500", color: colors.text },
  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, fontSize: 15, color: colors.text },
  eye: { paddingLeft: 8 },
  button: {
    height: 50,
    marginTop: 8,
    borderRadius: radius.md,
    backgroundColor: colors.greenSend,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontSize: 15.5, fontWeight: "600" },
  footer: { textAlign: "center", fontSize: 11, color: colors.muted, marginTop: 18 },
});
