import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { postApiCompanySearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { putApiCompany, deleteApiCompanyById } from "@/shared/api/generated/sdk.gen";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import type { CompanyDto } from "@/shared/api/types";
import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";
import { CompanyDangerZoneCard } from "@/components/features/settings/CompanyDangerZoneCard";

type DangerAction = "suspend" | "deleteData" | "closeAccount";

const ACTION_META: Record<
  DangerAction,
  { title: string; confirmLabel: string; description: string }
> = {
  suspend: {
    title: "Suspendre la company",
    confirmLabel: "Suspendre",
    description:
      "Toutes vos campagnes et messages seront mis en pause. Vos données sont conservées et la company pourra être réactivée.",
  },
  deleteData: {
    title: "Supprimer toutes les données",
    confirmLabel: "Supprimer",
    description:
      "Tous vos contacts, messages et campagnes seront définitivement supprimés. Cette action est irréversible.",
  },
  closeAccount: {
    title: "Fermer le compte",
    confirmLabel: "Fermer le compte",
    description:
      "Votre compte et toutes vos données seront supprimés. Vous serez immédiatement déconnecté.",
  },
};

export function DangerZonePage() {
  const logout = useAuthStore((s) => s.logout);
  const [pending, setPending] = useState<DangerAction | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const { data: company } = useQuery({
    ...postApiCompanySearchOptions({ body: { pageNumber: 1, pageSize: 1 } }),
    select: (res: any) =>
      (res?.data?.items?.[0] ?? undefined) as CompanyDto | undefined,
  });

  const closeModal = () => {
    setPending(null);
    setConfirmText("");
  };

  const actionMutation = useMutation({
    mutationFn: async (action: DangerAction) => {
      if (!company?.id) throw new Error("Company introuvable");
      if (action === "suspend") {
        // Explicit pick of UpdateCompanyRequest fields — no audit/computed columns
        return putApiCompany({
          body: {
            id: company.id,
            name: company.name,
            legalName: company.legalName,
            taxNumber: company.taxNumber,
            countryId: company.countryId,
            status: "suspended",
            email: company.email,
            phone: company.phone,
            website: company.website,
            address: company.address,
            city: company.city,
            postalCode: company.postalCode,
            country: company.country,
            billingMode: company.billingMode,
            timezone: company.timezone,
          } as any,
        });
      }
      if (action === "closeAccount") {
        return deleteApiCompanyById({ path: { id: company.id } });
      }
      // No dedicated "delete all data" endpoint — must go through support.
      throw new Error("SUPPORT_REQUIRED");
    },
    onSuccess: (_res, action) => {
      if (action === "suspend") toast.success("Company suspendue");
      if (action === "closeAccount") {
        toast.success("Compte fermé");
        logout();
        window.location.href = "/login";
      }
      closeModal();
    },
    onError: (err: any) => {
      if (err?.message === "SUPPORT_REQUIRED") {
        toast.info(
          "La suppression complète des données doit être confirmée par le support. Une demande a été enregistrée.",
        );
        closeModal();
        return;
      }
      toast.error("Erreur lors de l'opération");
    },
  });

  const meta = pending ? ACTION_META[pending] : null;
  const canConfirm = confirmText.trim().toUpperCase() === "CONFIRMER";

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              Zone de danger
            </h1>
            <p className="text-[12.5px] text-[#4A7A94] mt-1">
              Actions irréversibles et critiques pour votre compte
            </p>
          </div>

          <div className="max-w-[760px]">
            <CompanyDangerZoneCard
              onSuspend={() => setPending("suspend")}
              onDeleteData={() => setPending("deleteData")}
              onCloseAccount={() => setPending("closeAccount")}
            />
          </div>

          <Modal
            open={!!pending}
            onClose={closeModal}
            title={meta?.title ?? ""}
            size="sm"
            footer={
              <>
                <Button variant="secondary" onClick={closeModal}>
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  disabled={!canConfirm}
                  loading={actionMutation.isPending}
                  onClick={() => pending && actionMutation.mutate(pending)}
                >
                  {meta?.confirmLabel}
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-md">
                <p className="text-[13px] text-[#DC2626]">{meta?.description}</p>
              </div>
              <Input
                label='Tapez "CONFIRMER" pour continuer'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="CONFIRMER"
              />
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
