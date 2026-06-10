import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { getInitials, avatarColor } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { isSystemUser } from "@/lib/auth";
import type {
  SearchUserResponse,
  UserStatus,
} from "@/shared/api/generated/types.gen";

const statusVariant = (code?: string | null) => {
  const c = (code ?? "").toLowerCase();
  if (c === "active") return "success" as const;
  if (c === "suspended" || c === "locked") return "error" as const;
  if (c === "inactive" || c === "pending") return "warning" as const;
  return "neutral" as const;
};

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SearchUserResponse | null;
  isLoading: boolean;
  statuses: UserStatus[];
  onChangeStatus: (id: string, newStatus: string) => void;
  isPending: boolean;
}

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

export function UserDetailModal({
  isOpen,
  onClose,
  user,
  isLoading,
  statuses,
  onChangeStatus,
  isPending,
}: UserDetailModalProps) {
  const [nextStatus, setNextStatus] = useState("");

  useEffect(() => {
    if (isOpen) setNextStatus(user?.status ?? "");
  }, [isOpen, user?.status]);

  const statusLabelFor = (code?: string | null) =>
    statuses.find((s) => s.code === code)?.displayName ?? code ?? "—";

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Profil utilisateur"
      subtitle={user ? `${user.firstName ?? ""} ${user.lastName ?? ""}` : ""}
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      }
    >
      {!user ? (
        <p className="text-[13px] text-[#8BAFC0]">Aucun utilisateur.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {/* En-tête identité */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0"
              style={{ background: avatarColor(user.firstName ?? "U") }}
            >
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#0D2137]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[12.5px] text-[#4A7A94] truncate">
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant={isSystemUser(user.userType) ? "purple" : "info"}>
                  {user.userType ?? "—"}
                </Badge>
                <Badge variant={statusVariant(user.status)} dot>
                  {statusLabelFor(user.status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="grid grid-cols-2 gap-4 border-t border-[#E5E7EB] pt-4">
            <Field label="Téléphone" value={user.phoneNumber} />
            <Field label="Profil / Rôle" value={user.profileName} />
            <Field label="Company" value={user.companyName} />
            <Field label="Email company" value={user.companyEmail} />
            <Field label="Rejoint le" value={formatDate(user.createdAt)} />
            <Field
              label="Dernière modification"
              value={user.updatedAt ? formatDate(user.updatedAt) : "—"}
            />
            <Field label="Créé par" value={user.createdBy} />
            {isLoading && (
              <p className="text-[12px] text-[#8BAFC0]">Actualisation…</p>
            )}
          </div>

          {/* Changement de statut */}
          <div className="border-t border-[#E5E7EB] pt-4">
            <div className="flex items-center gap-1.5 mb-3">
              <ShieldCheck size={14} className="text-[#2E8FAD]" />
              <p className="text-[13px] font-medium text-[#0D2137]">
                Changer le statut
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  options={[
                    { value: "", label: "— Sélectionner —" },
                    ...statuses.map((s) => ({
                      value: s.code ?? "",
                      label: s.displayName ?? s.code ?? "",
                    })),
                  ]}
                />
              </div>
              <Button
                variant="primary"
                loading={isPending}
                disabled={!nextStatus || nextStatus === user.status}
                onClick={() =>
                  user.id && onChangeStatus(user.id, nextStatus)
                }
              >
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
