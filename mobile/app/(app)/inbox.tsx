import {
  LogOut,
  MessageCircle,
  MessageSquarePlus,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logout as logoutRequest } from "@/api/endpoints";
import { BroadcastSheet } from "@/components/inbox/BroadcastSheet";
import { ConversationFiltersSheet } from "@/components/inbox/ConversationFiltersSheet";
import { ConversationRow } from "@/components/inbox/ConversationRow";
import { FilterChips } from "@/components/inbox/FilterChips";
import { SearchField } from "@/components/inbox/SearchField";
import { IconButton } from "@/components/shared/IconButton";
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
    filters,
    activeFilterCount,
    senders,
    users,
    selectedSenderId,
    setSelectedSenderId,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    handleFilterChange,
    handleFiltersChange,
    resetFilters,
    handleSearchChange,
    handleEndReached,
    refetchConvs,
  } = useInboxViewModel();

  const [senderSheet, setSenderSheet] = useState(false);
  const [accountSheet, setAccountSheet] = useState(false);
  const [broadcastSheet, setBroadcastSheet] = useState(false);
  const [filtersSheet, setFiltersSheet] = useState(false);

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
        <View style={styles.brand}>
          <Image
            source={require("../../assets/logo-whatsapp.png")}
            style={styles.logo}
            accessibilityLabel="WhatsApp"
          />
          <Text style={styles.brandText}>Omni WhatsApp</Text>
        </View>
        <IconButton
          icon={MessageSquarePlus}
          label="Diffusion de template"
          onPress={() => setBroadcastSheet(true)}
        />
        <IconButton icon={RefreshCw} label="Actualiser" onPress={() => refetchConvs()} />
        <IconButton icon={UserCheck} label="Compte" onPress={() => setAccountSheet(true)} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchFlex}>
          <SearchField value={search} onChange={handleSearchChange} />
        </View>
        <Pressable
          accessibilityLabel="Filtres"
          onPress={() => setFiltersSheet(true)}
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
        >
          <SlidersHorizontal
            size={18}
            color={activeFilterCount > 0 ? colors.teal : colors.icon}
          />
          {activeFilterCount > 0 ? (
            // Un nombre nu ne dit rien à un lecteur d'écran — et c'est aussi ce
            // qui permet aux flows e2e de repérer un filtre resté actif.
            <View
              style={styles.filterBadge}
              accessibilityLabel={`${activeFilterCount} filtre${
                activeFilterCount > 1 ? "s" : ""
              } actif${activeFilterCount > 1 ? "s" : ""}`}
            >
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
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
          // Sans ça, juste après une saisie dans la recherche, le premier appui
          // sur une ligne est avalé pour refermer le clavier au lieu d'ouvrir
          // la discussion.
          keyboardShouldPersistTaps="handled"
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
            conversationVMs.length === 0
              ? styles.emptyContent
              : { paddingHorizontal: 8, paddingBottom: insets.bottom + 12 }
          }
          initialNumToRender={12}
          windowSize={9}
          removeClippedSubviews
        />
      )}

      {broadcastSheet ? <BroadcastSheet onClose={() => setBroadcastSheet(false)} /> : null}

      <ConversationFiltersSheet
        open={filtersSheet}
        onClose={() => setFiltersSheet(false)}
        filters={filters}
        users={users}
        activeCount={activeFilterCount}
        onChange={handleFiltersChange}
        onReset={resetFilters}
      />

      <Sheet open={senderSheet} onClose={() => setSenderSheet(false)} title="Expéditeur" scroll>
        {senders.length === 0 ? (
          <Text style={styles.sheetHint}>Aucun expéditeur WhatsApp configuré.</Text>
        ) : (
          senders.map((s) => (
            <SheetOption
              key={s.id}
              icon={MessageCircle}
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
        <SheetOption
          icon={MessageCircle}
          label="Expéditeur"
          hint={activeSender?.senderName ?? "Aucun expéditeur configuré"}
          onPress={() => {
            setAccountSheet(false);
            setSenderSheet(true);
          }}
        />
        <SheetOption icon={LogOut} label="Se déconnecter" danger onPress={handleLogout} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: "row", alignItems: "center", paddingRight: 12 },
  searchFlex: { flex: 1, minWidth: 0 },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: { backgroundColor: colors.active },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { fontSize: 10, fontWeight: "500", color: colors.white },
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: colors.header,
  },
  brand: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 },
  logo: { width: 48, height: 48 },
  brandText: { fontSize: 24, fontWeight: "600", color: colors.greenSend },
  center: { paddingVertical: 48, alignItems: "center", justifyContent: "center" },
  emptyContent: { flexGrow: 1 },
  empty: { color: colors.muted, fontSize: 13.5 },
  footer: { paddingVertical: 16 },
  sheetHint: { paddingHorizontal: 18, paddingBottom: 6, fontSize: 13, color: colors.muted },
});
