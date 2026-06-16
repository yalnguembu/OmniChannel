import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  postApiCompanySearchOptions,
  postApiCompanySearchQueryKey,
  putApiCompanyMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { PageLoader } from "@/components/feedback/PageLoader";
import type { CompanyDto } from "@/shared/api/types";
import { fadeInUp } from "@/lib/animations";

import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";
import { CompanyIdentityCard } from "@/components/features/settings/CompanyIdentityCard";
import { CompanyPreferencesCard } from "@/components/features/settings/CompanyPreferencesCard";
import { CompanyEditModal } from "@/components/features/settings/CompanyEditModal";

export function SettingsCompanyPage() {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: company, isLoading } = useQuery({
    ...postApiCompanySearchOptions({ body: { pageNumber: 1, pageSize: 1 } }),
    select: (res: any) =>
      (res?.data?.items?.[0] ?? undefined) as CompanyDto | undefined,
  });

  const updateMutation = useMutation({
    ...putApiCompanyMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiCompanySearchQueryKey() });
      setEditOpen(false);
      toast.success("Profil mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex h-screen bg-white">
      <SettingsSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-7">
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              Profil company
            </h1>
            <p className="text-[12.5px] text-[#4A7A94] mt-1">
              Informations légales et configuration de base de votre organisation.
            </p>
          </div>

          <motion.div {...fadeInUp} className="max-w-6xl">
        {/* Identity */}
        <CompanyIdentityCard
          company={company}
          onEditClick={() => setEditOpen(true)}
        />

        {/* Preferences */}
        <CompanyPreferencesCard
          company={company}
          onEditClick={() => setEditOpen(true)}
        />
          </motion.div>

          {/* Edit Modal */}
          <CompanyEditModal
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            company={company}
            isPending={updateMutation.isPending}
            onSubmit={(data) => updateMutation.mutate({ body: data as any })}
          />
        </div>
      </div>
    </div>
  );
}
