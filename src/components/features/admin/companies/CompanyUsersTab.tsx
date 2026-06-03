import { UsersManager } from "@/components/features/users/UsersManager";

interface CompanyUsersTabProps {
  companyId: string;
}

/**
 * Admin view of a single company's users — full management (list, invite,
 * status change) scoped to this company via UsersManager.
 */
export function CompanyUsersTab({ companyId }: CompanyUsersTabProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-5">
      <UsersManager
        scope="company"
        companyId={companyId}
        embedded
        title="Utilisateurs de la company"
        subtitle="Gérez les membres rattachés à cette company"
      />
    </div>
  );
}
