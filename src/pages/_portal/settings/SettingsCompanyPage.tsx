import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CompanyService } from "@/shared/api/services";
import { PageLoader } from "@/components/feedback/PageLoader";
import type { CompanyDto } from "@/api/generated/types";
import { fadeInUp } from "@/lib/animations";

import { SettingsSidebar } from "@/components/features/settings/SettingsSidebar";
import { CompanyIdentityCard } from "@/components/features/settings/CompanyIdentityCard";
import { CompanyPreferencesCard } from "@/components/features/settings/CompanyPreferencesCard";
import { CompanyEditModal } from "@/components/features/settings/CompanyEditModal";

export function SettingsCompanyPage() {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["company"],
    queryFn: () => CompanyService.search({ pageNumber: 1, pageSize: 1 }),
  });

  const company: CompanyDto | undefined = data?.data?.items?.[0];

  const updateMutation = useMutation({
    mutationFn: (body: Partial<CompanyDto>) => CompanyService.update(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company"] });
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

          <motion.div {...fadeInUp} className="max-w-[760px]">
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
            onSubmit={(data) => updateMutation.mutate(data as any)}
          />
        </div>
      </div>
    </div>
  );
}
