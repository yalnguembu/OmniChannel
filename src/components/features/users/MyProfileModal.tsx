import { LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getApiUserMeOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { CurrentUserWithPermissionsResult } from "@/shared/api/generated/types.gen";
import { getInitials, avatarColor } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { isSystemUser } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";

const statusVariant = (code?: string | null) => {
  const c = (code ?? "").toLowerCase();
  if (c === "active") return "success" as const;
  if (c === "suspended" || c === "locked") return "error" as const;
  if (c === "inactive" || c === "pending") return "warning" as const;
  return "neutral" as const;
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[#8BAFC0]">
        {label}
      </p>
      <p className="text-[13px] text-[#0D2137] mt-0.5">{value || "—"}</p>
    </div>
  );
}

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyProfileModal({ isOpen, onClose }: MyProfileModalProps) {
  const { logout, isLoggingOut } = useSession();

  const { data: me, isLoading } = useQuery({
    ...getApiUserMeOptions(),
    select: (res: any) => res?.data as CurrentUserWithPermissionsResult,
    enabled: isOpen,
  });

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Mon profil"
      subtitle={me ? `${me.firstName ?? ""} ${me.lastName ?? ""}` : ""}
      size="md"
      footer={
        <>
          <Button
            variant="danger"
            onClick={logout}
            loading={isLoggingOut}
          >
            <LogOut size={13} />
            Se déconnecter
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </>
      }
    >
      {!me ? (
        <p className="text-[13px] text-[#8BAFC0]">
          {isLoading ? "Chargement…" : "Profil indisponible."}
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* En-tête identité */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0"
              style={{ background: avatarColor(me.firstName ?? "U") }}
            >
              {getInitials(me.firstName, me.lastName)}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#0D2137]">
                {me.firstName} {me.lastName}
              </p>
              <p className="text-[12.5px] text-[#4A7A94] truncate">
                {me.email}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={isSystemUser(me.userType) ? "purple" : "info"}>
                  {me.userType ?? "—"}
                </Badge>
                <Badge variant={statusVariant(me.status)} dot>
                  {me.status ?? "—"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="grid grid-cols-2 gap-4 border-t border-[#E5E7EB] pt-4">
            <Field label="Profil / Rôle" value={me.profileName} />
            <Field label="Company" value={me.companyName} />
            <Field
              label="Dernière connexion"
              value={me.lastLoginAt ? formatDate(me.lastLoginAt) : "—"}
            />
            <Field label="Membre depuis" value={formatDate(me.createdAt)} />
            <Field label="Identifiant public" value={me.publicId} />
            <Field
              label="Permissions"
              value={`${me.permissions?.length ?? 0} autorisation(s)`}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
