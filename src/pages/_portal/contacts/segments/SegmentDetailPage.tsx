import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, RefreshCw, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  getApiClientSegmentByIdOptions,
  getApiClientSegmentByIdQueryKey,
  postApiClientSegmentMemberSearchQueryKey,
  postApiClientSegmentRecalculateByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ContactTable } from "@/components/features/contacts/ContactTable";
import { ContactDetailPanel } from "@/components/features/contacts/ContactDetailPanel";
import { ContactModal } from "@/components/features/contacts/ContactModal";
import { formatDate, formatRelative } from "@/lib/date";
import { fmt } from "@/lib/utils";
import { staggerContainer } from "@/lib/animations";
import { mapToSegmentModel } from "@/models/client.model";
import { useContactViewModel } from "@/hooks/useContactViewModel";
import { SegmentMessagesPreviewModal } from "@/components/features/contacts/SegmentMessagesPreviewModal";

export function SegmentDetailPage({
  segmentId,
  productId,
}: {
  segmentId: string;
  productId: string;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);

  // Same clients list as the main contacts page, scoped to this segment.
  const vm = useContactViewModel(productId, segmentId);

  const recalculateMutation = useMutation({
    ...postApiClientSegmentRecalculateByIdMutation(),
    onSuccess: () => {
      toast.success("Recalcul lancé — les membres seront mis à jour sous peu");
      qc.invalidateQueries({
        queryKey: getApiClientSegmentByIdQueryKey({ path: { id: segmentId } }),
      });
      qc.invalidateQueries({
        queryKey: postApiClientSegmentMemberSearchQueryKey(),
      });
    },
    onError: () => toast.error("Erreur lors du recalcul du segment"),
  });

  const { data: segment, isLoading } = useQuery({
    ...getApiClientSegmentByIdOptions({ path: { id: segmentId } }),
    select: (res) => (res?.data ? mapToSegmentModel(res.data) : null),
  });

  if (isLoading) return <PageLoader />;
  if (!segment)
    return (
      <div className="p-7">
        <p className="text-[13px] text-[#8BAFC0]">Segment introuvable</p>
      </div>
    );

  return (
    <div className="p-7">
      <button
        onClick={() =>
          navigate({
            to: "/$productId/contacts/segments",
            params: { productId },
          })
        }
        className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft size={13} />
        Segments
      </button>

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#E8F4F8] flex items-center justify-center">
            <Users size={22} className="text-[#2E8FAD]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
                {segment.name}
              </h1>
              {segment.isDynamic && <Badge variant="purple">Dynamique</Badge>}
            </div>
            <p className="text-[12.5px] text-[#8BAFC0] mt-1">
              {fmt(segment.clientCount)} contacts ·{" "}
              {segment.lastCalculatedAt
                ? `Recalculé ${formatRelative(segment.lastCalculatedAt)}`
                : "Jamais recalculé"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            loading={recalculateMutation.isPending}
            onClick={() => recalculateMutation.mutate({ path: { id: segmentId } })}
          >
            <RefreshCw size={13} />
            Recalculer
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(true)}>
            <MessageSquare size={13} />
            Aperçu messages
          </Button>
          {segment.productId && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate({
                  to: "/$productId/campaigns",
                  params: { productId: segment.productId as string },
                  search: { create: true },
                })
              }
            >
              Créer une campagne
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Contacts", value: fmt(segment.clientCount) },
          {
            label: "Type",
            value: segment.isDynamic ? "Dynamique" : "Statique",
          },
          { label: "Créé le", value: formatDate(segment.createdAt) },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#E5E7EB] rounded-md px-4 py-3.5"
          >
            <p className="text-[11px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1.5">
              {kpi.label}
            </p>
            <p className="text-[20px] font-semibold text-[#0D2137] leading-none tracking-tight">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Members — same clients list as the main contacts page */}
      <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
        <AnimatePresence mode="wait">
          {vm.isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24"
            >
              <PageLoader />
            </motion.div>
          ) : vm.contacts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-16"
            >
              <EmptyState
                icon={<Users size={32} />}
                title="Aucun membre"
                description="Ce segment ne contient pas encore de contacts"
              />
            </motion.div>
          ) : (
            <motion.div
              key="table"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <ContactTable
                contacts={vm.contacts}
                loading={vm.isLoading}
                onView={(c) => vm.setActiveContact(c)}
                onEdit={(c) => vm.handleEdit(c)}
                onDelete={vm.handleDelete}
                activeRowId={vm.activeContact?.id}
                pagination={{
                  page: vm.page,
                  pageSize: vm.pageSize,
                  total: vm.totalCount,
                  onPageChange: vm.setPage,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ContactDetailPanel
        contact={vm.activeContact}
        activeTab={vm.detailTab}
        onTabChange={vm.setDetailTab}
        onClose={() => vm.setActiveContact(null)}
        onEdit={(c) => vm.handleEdit(c)}
        onDelete={vm.handleDelete}
      />

      <ContactModal
        open={vm.isModalOpen}
        onClose={() => {
          vm.setIsModalOpen(false);
          vm.setEditingContact(null);
        }}
        editing={vm.editingContact}
        onSubmit={vm.handleSubmit}
        loading={vm.isActionPending}
        productId={productId}
      />

      <SegmentMessagesPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        segmentId={segmentId}
        segmentName={segment.name}
      />
    </div>
  );
}
