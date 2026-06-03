import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";
import { UsersManager } from "@/components/features/users/UsersManager";

export default function SettingsUsersPage() {
  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <UsersManager
            scope="company"
            title="Utilisateurs"
            subtitle="Gérez les membres de votre équipe et leurs accès"
          />
        </div>
      </div>
    </div>
  );
}
