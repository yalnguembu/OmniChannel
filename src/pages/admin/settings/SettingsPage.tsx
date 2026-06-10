import { cn } from "@/lib/utils";
import { useAdminSettingsViewModel } from "@/hooks/admin/useAdminSettingsViewModel";
import { SettingsSection } from "@/components/features/admin/settings/SettingsSection";
import { SecureSettingsSection } from "@/components/features/admin/settings/SecureSettingsSection";
import { CountriesSection } from "@/components/features/admin/settings/CountriesSection";
import { CurrenciesSection } from "@/components/features/admin/settings/CurrenciesSection";
import { ProfilesSection } from "@/components/features/admin/settings/ProfilesSection";
import { UsersManager } from "@/components/features/users/UsersManager";

const TABS = [
  { id: "settings", label: "Settings globaux" },
  { id: "secure", label: "Settings sécurisés" },
  { id: "countries", label: "Pays" },
  { id: "currencies", label: "Devises" },
  { id: "users", label: "Users système" },
  { id: "profiles", label: "Profils utilisateurs" },
];

export default function SettingsPage() {
  const vm = useAdminSettingsViewModel();

  return (
    <div className="p-7">
      <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight mb-1">
        Paramètres système
      </h1>
      <p className="text-[12.5px] text-[#4A7A94] mb-4">
        Configuration globale de la plateforme
      </p>

      <div className="flex border-b border-[#E5E7EB] mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => vm.setActiveTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-[13px] border-b-2 border-transparent transition-all cursor-pointer whitespace-nowrap",
              vm.activeTab === t.id
                ? "text-[#1B5E82] font-medium border-[#2E8FAD]"
                : "text-[#4A7A94] hover:text-[#0D2137]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {vm.activeTab === "settings" && <SettingsSection vm={vm} />}
      {vm.activeTab === "secure" && <SecureSettingsSection vm={vm} />}
      {vm.activeTab === "users" && (
        <UsersManager
          scope="system"
          title="Utilisateurs système"
          subtitle="Comptes administrateurs de la plateforme"
        />
      )}
      {vm.activeTab === "countries" && <CountriesSection vm={vm} />}
      {vm.activeTab === "currencies" && <CurrenciesSection vm={vm} />}
      {vm.activeTab === "profiles" && <ProfilesSection vm={vm} />}
    </div>
  );
}
