import { Smartphone, Monitor, LogOut, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelative } from "@/lib/date";
import { useDevicesViewModel } from "@/hooks/useDevicesViewModel";
import { useSession } from "@/hooks/useSession";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";
import { ChangePasswordCard } from "@/components/features/settings/ChangePasswordCard";

export function DevicesPage() {
  const vm = useDevicesViewModel();
  const { logoutAll, isLoggingOut } = useSession();

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              Sécurité
            </h1>
            <p className="text-[12.5px] text-[#4A7A94] mt-1">
              Mot de passe, sessions et appareils connectés.
            </p>
          </div>

          <ChangePasswordCard />

          <div className="mt-8 mb-4 flex max-w-[760px] items-end justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#0D2137]">
                Appareils & sessions
              </h2>
              <p className="text-[12px] text-[#8BAFC0] mt-0.5">
                Gérez les appareils connectés à votre compte.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={logoutAll}
              loading={isLoggingOut}
            >
              <LogOut size={13} />
              Déconnecter tout
            </Button>
          </div>

          {vm.isLoading ? (
            <PageLoader />
          ) : vm.devices.length === 0 ? (
            <EmptyState
              icon={<Monitor size={32} />}
              title="Aucun appareil"
              description="Aucune session active n'a été trouvée."
            />
          ) : (
            <div className="max-w-[760px] flex flex-col gap-2">
              {vm.devices.map((d) => {
                const isMobile = (d.platform ?? "")
                  .toLowerCase()
                  .match(/android|ios|mobile/);
                return (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 p-4 bg-white border border-[#E5E7EB] rounded-[12px]"
                  >
                    <div className="w-10 h-10 rounded-md bg-[#E8F4F8] flex items-center justify-center text-[#2E8FAD] shrink-0">
                      {isMobile ? (
                        <Smartphone size={18} />
                      ) : (
                        <Monitor size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-[#0D2137]">
                          {d.deviceName || d.platform || "Appareil inconnu"}
                        </p>
                        {d.isCurrent && (
                          <Badge variant="success" dot>
                            Cet appareil
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#8BAFC0] mt-0.5">
                        {[d.city, d.country].filter(Boolean).join(", ") || "—"}
                        {" · "}
                        {d.lastSeenAt
                          ? `Vu ${formatRelative(d.lastSeenAt)}`
                          : "—"}
                      </p>
                    </div>
                    {!d.isCurrent && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => d.id && vm.revoke(d.id)}
                        loading={vm.isRevoking}
                      >
                        <Trash2 size={12} />
                        Révoquer
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
