import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, ArrowDownToLine, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  postApiIntegrationSyncLogSearchOptions,
  postApiIntegrationSyncLogSearchQueryKey,
  postApiIntegrationSyncPullMutation,
  postApiIntegrationSyncClientsMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  DataTable,
  Pagination,
  type Column,
} from "@/components/data-table/DataTable";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { IntegrationSyncLogDto } from "@/shared/api/types";

import { IntegrationsTabs } from "./IntegrationsTabs";

export function SyncLogsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading } = useQuery({
    ...postApiIntegrationSyncLogSearchOptions({
      body: { pageNumber: page, pageSize },
    }),
    select: (res: any) => {
      const items = (res?.data?.items ?? []) as IntegrationSyncLogDto[];
      return {
        items,
        total: (res?.data?.totalCount ?? items.length) as number,
      };
    },
  });

  const pullMutation = useMutation({
    ...postApiIntegrationSyncPullMutation(),
    onSuccess: () => {
      toast.success("Sync pull lancé — les données seront mises à jour sous peu");
      qc.invalidateQueries({
        queryKey: postApiIntegrationSyncLogSearchQueryKey(),
      });
    },
    onError: () => toast.error("Erreur lors du sync pull"),
  });

  const pushMutation = useMutation({
    ...postApiIntegrationSyncClientsMutation(),
    onSuccess: () => {
      toast.success("Sync clients lancé — les contacts seront synchronisés sous peu");
      qc.invalidateQueries({
        queryKey: postApiIntegrationSyncLogSearchQueryKey(),
      });
    },
    onError: () => toast.error("Erreur lors du sync clients"),
  });

  const logs = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns: Column<IntegrationSyncLogDto>[] = [
    {
      key: "status",
      label: "",
      width: "36px",
      render: (l) => (
        <div
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center border",
            l.status === "success"
              ? "bg-[#DCFCE7] border-[#86EFAC]"
              : l.status === "error"
                ? "bg-[#FEE2E2] border-[#FCA5A5]"
                : "bg-[#FEF3C7] border-[#FCD34D]",
          )}
        >
          {l.status === "success" ? (
            <CheckCircle2 size={12} className="text-[#16A34A]" />
          ) : (
            <XCircle size={12} className="text-[#DC2626]" />
          )}
        </div>
      ),
    },
    {
      key: "startedAt",
      label: "Date",
      width: "160px",
      render: (l) => (
        <span className="text-[12.5px] text-[#8BAFC0]">
          {l.startedAt
            ? formatDateTime(l.startedAt)
            : formatDateTime(l.createdAt)}
        </span>
      ),
    },
    {
      key: "integrationId",
      label: "Connecteur",
      width: "160px",
      render: (l) => (
        <span className="font-medium text-[#2E8FAD] truncate">
          {l.integrationId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: "syncType",
      label: "Type",
      render: (l) => <span className="text-[12.5px]">{l.syncType}</span>,
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (l) => (
        <Badge
          variant={
            l.status === "success"
              ? "success"
              : l.status === "error"
                ? "error"
                : "warning"
          }
        >
          {l.status === "success"
            ? "Succès"
            : l.status === "error"
              ? "Erreur"
              : "En cours"}
        </Badge>
      ),
    },
    {
      key: "recordsProcessed",
      label: "Traités",
      width: "100px",
      render: (l) => (
        <span className="text-[12.5px]">
          {l.recordsProcessed?.toLocaleString("fr") ?? "—"}
        </span>
      ),
    },
    {
      key: "recordsFailed",
      label: "Erreurs",
      width: "100px",
      render: (l) => (
        <span
          className={cn(
            "text-[12.5px] font-medium",
            (l.recordsFailed ?? 0) > 0 ? "text-[#DC2626]" : "text-[#8BAFC0]",
          )}
        >
          {l.recordsFailed ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-7">
      <div className="mb-2">
        <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
          Intégrations
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">
          Connecteurs, webhooks, API Keys & logs
        </p>
      </div>
      <IntegrationsTabs />
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#4A7A94]">
          {total.toLocaleString("fr")} logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={pushMutation.isPending}
            onClick={() => pushMutation.mutate({})}
          >
            <RefreshCw size={13} />
            Sync clients
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={pullMutation.isPending}
            onClick={() => pullMutation.mutate({})}
          >
            <ArrowDownToLine size={13} />
            Sync pull
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        getRowId={(l) => l.id}
        emptyTitle="Aucun log de synchronisation"
      />
      <Pagination
        total={total}
        pageSize={pageSize}
        page={page}
        onChange={setPage}
      />
    </div>
  );
}
