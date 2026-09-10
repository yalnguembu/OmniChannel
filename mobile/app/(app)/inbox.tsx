import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logout as logoutRequest } from "@/api/endpoints";
import { BroadcastSheet } from "@/components/inbox/BroadcastSheet";
import { ConversationRow } from "@/components/inbox/ConversationRow";
import { FilterChips } from "@/components/inbox/FilterChips";
import { SearchField } from "@/components/inbox/SearchField";
import { Sheet, SheetOption, SheetSeparator } from "@/components/shared/Sheet";
import { useInboxViewModel, type ConversationViewModel } from "@/hooks/useInboxViewModel";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme";

export default function InboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.logout);

  const {
    conversationVMs,
    statsVM,
    filter,
    search,
    senders,
    selectedSenderId,
    setSelectedSenderId,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    handleFilterChange,
    handleSearchChange,
    handleEndReached,
    refetchConvs,
  } = useInboxViewModel();

  const [senderSheet, setSenderSheet] = useState(false);
  const [accountSheet, setAccountSheet] = useState(false);
  const [broadcastSheet, setBroadcastSheet] = useState(false);

  const activeSender = senders.find((s) => s.id === selectedSenderId);

  const openConversation = useCallback(
    (id: string) => router.push(`/chat/${id}`),
    [router],
  );

  const handleLogout = useCallback(async () => {
    setAccountSheet(false);
    // On invalide la session côté serveur quand c'est possible, mais on
    // déconnecte localement dans tous les cas (réseau coupé, token expiré…).
    try {
      await logoutRequest();
    } catch {
      /* déconnexion locale quand même */
    }
    clearSession();
    qc.clear();
    router.replace("/login");
  }, [clearSession, qc, router]);

  const renderItem = useCallback(
    ({ item }: { item: ConversationViewModel }) => (
      <ConversationRow vm={item} onPress={openConversation} />
    ),
    [openConversation],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Discussions</Text>
          <Pressable style={styles.senderChip} onPress={() => setSenderSheet(true)}>
            <Ionicons name="logo-whatsapp" size={13} color={colors.teal} />
            <Text style={styles.senderText} numberOfLines={1}>
              {activeSender?.senderName ?? "Aucun expéditeur"}
            </Text>
            <Ionicons name="chevron-down" size={13} color={colors.muted} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => setBroadcastSheet(true)}
          hitSlop={8}
          style={styles.iconButton}
          accessibilityLabel="Diffuser un template"
        >
          <Ionicons name="megaphone-outline" size={21} color={colors.icon} />
        </Pressable>
        <Pressable onPress={() => refetchConvs()} hitSlop={8} style={styles.iconButton}>
          <Ionicons name="refresh" size={21} color={colors.icon} />
        </Pressable>
        <Pressable onPress={() => setAccountSheet(true)} hitSlop={8} style={styles.iconButton}>
          <Ionicons name="person-circle-outline" size={25} color={colors.icon} />
        </Pressable>
      </View>

      <SearchField value={search} onChange={handleSearchChange} />
      <FilterChips stats={statsVM} filter={filter} onChange={handleFilterChange} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.green} />
        </View>
      ) : (
        <FlatList
          data={conversationVMs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetchConvs}
              colors={[colors.green]}
              tintColor={colors.green}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>Aucune conversation</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.green} />
              </View>
            ) : null
          }
          contentContainerStyle={
            conversationVMs.length === 0 ? styles.emptyContent : { paddingBottom: insets.bottom + 12 }
          }
          initialNumToRender={12}
          windowSize={9}
          removeClippedSubviews
        />
      )}

      {broadcastSheet ? <BroadcastSheet onClose={() => setBroadcastSheet(false)} /> : null}

      <Sheet open={senderSheet} onClose={() => setSenderSheet(false)} title="Expéditeur" scroll>
        {senders.length === 0 ? (
          <Text style={styles.sheetHint}>Aucun expéditeur WhatsApp configuré.</Text>
        ) : (
          senders.map((s) => (
            <SheetOption
              key={s.id}
              icon="logo-whatsapp"
              label={s.senderName}
              selected={s.id === selectedSenderId}
              onPress={() => {
                setSenderSheet(false);
                setSelectedSenderId(s.id);
              }}
            />
          ))
        )}
      </Sheet>

      <Sheet
        open={accountSheet}
        onClose={() => setAccountSheet(false)}
        title={user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Compte"}
      >
        <Text style={styles.sheetHint}>
          {user?.email ?? "—"}
          {user?.companyName ? ` · ${user.companyName}` : ""}
        </Text>
        <SheetSeparator />
        <SheetOption icon="log-out-outline" label="Se déconnecter" danger onPress={handleLogout} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
  },
  headerTitles: { flex: 1, minWidth: 0 },
  title: { fontSize: 21, fontWeight: "700", color: colors.text },
  senderChip: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  senderText: { fontSize: 12, color: colors.muted, maxWidth: 200 },
  iconButton: { padding: 7 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 76 },
  center: { paddingVertical: 48, alignItems: "center", justifyContent: "center" },
  emptyContent: { flexGrow: 1 },
  empty: { color: colors.muted, fontSize: 13.5 },
  footer: { paddingVertical: 16 },
  sheetHint: { paddingHorizontal: 18, paddingBottom: 6, fontSize: 13, color: colors.muted },
});
