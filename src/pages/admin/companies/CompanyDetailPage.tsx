import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Pencil, KeyRound, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { PageLoader } from "@/components/feedback/PageLoader";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { useAdminCompanyDetailViewModel } from "@/hooks/admin/useAdminCompanyDetailViewModel";
import { CompanyDetailHeader } from "@/components/features/admin/companies/CompanyDetailHeader";
import { CompanyFormModal } from "@/components/features/admin/companies/CompanyFormModal";
import { CompanyInfoTab } from "@/components/features/admin/companies/CompanyInfoTab";
import { CompanySubscriptionTab } from "@/components/features/admin/companies/CompanySubscriptionTab";
import { CompanyWalletTab } from "@/components/features/admin/companies/CompanyWalletTab";
import { CompanyUsersTab } from "@/components/features/admin/companies/CompanyUsersTab";

const TABS = [
  { id: "info", label: "Informations" },
  { id: "subscription", label: "Abonnement" },
  { id: "wallet", label: "Wallet" },
  { id: "users", label: "Utilisateurs" },
];

export default function CompanyDetailPage() {
  const { companyId } = useParams({ from: "/admin/companies/$companyId" });
  const navigate = useNavigate();
  const vm = useAdminCompanyDetailViewModel(companyId, {
    onDeleted: () => navigate({ to: "/admin/companies" }),
  });

  if (vm.isLoading) return <PageLoader />;

  if (!vm.company) {
    return (
      <div className="p-7">
        <p className="text-[13px] text-[#8BAFC0]">Company introuvable.</p>
      </div>
    );
  }

  return (
    <div className="p-7">
      <button
        onClick={() => navigate({ to: "/admin/companies" })}
        className="flex items-center gap-1.5 text-[12.5px] text-[#4A7A94] hover:text-[#0D2137] transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft size={14} />
        Retour aux companies
      </button>

      <CompanyDetailHeader
        company={vm.company}
        actions={
          <Can perform={ACTION.COMPANY_WRITE}>
            <div className="flex items-center gap-2 mr-1 pr-3 border-r border-[#E5E7EB]">
              <span className="text-[12.5px] text-[#4A7A94]">Sandbox</span>
              <Toggle
                checked={!!vm.company.isSandbox}
                onChange={vm.handleToggleSandbox}
                disabled={vm.isUpdatePending}
              />
            </div>
            <Button variant="secondary" size="sm" onClick={vm.handleOpenEdit}>
              <Pencil size={13} />
              Modifier
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={vm.handleRegenerateApiKey}
              loading={vm.isRegeneratePending}
            >
              <KeyRound size={13} />
              Régénérer la clé API
            </Button>
            <Button variant="danger" size="sm" onClick={vm.handleOpenDelete}>
              <Trash2 size={13} />
              Supprimer
            </Button>
          </Can>
        }
      />

      <div className="flex border-b border-[#E5E7EB] mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => vm.setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-[13px] border-b-2 border-transparent transition-all cursor-pointer",
              vm.tab === t.id
                ? "text-[#1B5E82] font-medium !border-[#2E8FAD]"
                : "text-[#4A7A94] hover:text-[#0D2137]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {vm.tab === "info" && <CompanyInfoTab company={vm.company} />}
      {vm.tab === "subscription" && (
        <CompanySubscriptionTab subscription={vm.subscription} />
      )}
      {vm.tab === "wallet" && (
        <CompanyWalletTab wallet={vm.wallet} transactions={vm.transactions} />
      )}
      {vm.tab === "users" && <CompanyUsersTab companyId={companyId} />}

      <CompanyFormModal
        isOpen={vm.isEditOpen}
        onClose={vm.handleCloseEdit}
        countries={vm.countries}
        editing={vm.company}
        onSubmit={vm.handleUpdate}
        isPending={vm.isUpdatePending}
      />

      <Modal
        open={vm.isDeleteOpen}
        onClose={vm.handleCloseDelete}
        title="Supprimer la company"
        subtitle={vm.company.name ?? ""}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={vm.handleCloseDelete}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={vm.handleConfirmDelete}
              loading={vm.isDeletePending}
            >
              Supprimer définitivement
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-[#4A7A94]">
          Cette action est irréversible. La company «{" "}
          <span className="font-medium text-[#0D2137]">{vm.company.name}</span> »
          et ses données associées seront supprimées.
        </p>
      </Modal>
    </div>
  );
}
