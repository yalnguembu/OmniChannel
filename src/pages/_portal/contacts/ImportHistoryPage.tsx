import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, FileText, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  postApiClientImportSearchOptions,
  postApiClientImportSearchQueryKey,
  getApiClientImportDetailByIdOptions,
  deleteApiClientImportByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SearchClientImportResponse } from "@/shared/api/generated/types.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Pagination, type Column } from "@/components/data-table/DataTable";
import { fmt } from "@/lib/utils";
import { formatDate } from "@/lib/date";

function importStatusVariant(s?: string | null) {
  const v = (s ?? "").toLowerCase();
  if (/(complet|success|done|termin)/.test(v)) return "success" as const;
  if (/(fail|error|échou|echou)/.test(v)) return "error" as const;
  if (/(process|pending|cours|queue|run)/.test(v)) return "info" as const;
  return "neutral" as const;
}

export function ImportHistoryPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const pageSize = 15;

  const { data, isLoading } = useQuery({
    ...postApiClientImportSearchOptions({
      body: { pageNumber: page, pageSize, searchTerm: search || undefined },
    }),
    select: (res) => ({
      items: [...(res?.data?.items ?? [])] as SearchClientImportResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
  });
  const imports = data?.items ?? [];
  const total = data?.total ?? 0;

  const deleteMutation = useMutation({
    ...deleteApiClientImportByIdMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiClientImportSearchQueryKey() });
      toast.success("Import supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const columns: Column<SearchClientImportResponse>[] = [
    {
      key: "fileName",
      label: "Fichier",
      render: (r) => (
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-[#8BAFC0]" />
          <span className="font-medium text-[#0D2137]">{r.fileName || "—"}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Statut",
      width: "130px",
      render: (r) => (
        <Badge variant={importStatusVariant(r.status)} dot>
          {r.status || "—"}
        </Badge>
      ),
    },
    {
      key: "rows",
      label: "Lignes",
      render: (r) => (
        <span className="text-[12px] text-[#4A7A94]">
          {fmt(r.totalRows ?? 0)} total ·{" "}
          <span className="text-[#16A34A]">{fmt(r.successfulRows ?? 0)} ok</span>
          {(r.failedRows ?? 0) > 0 && (
            <>
              {" "}
              · <span className="text-[#DC2626]">{fmt(r.failedRows ?? 0)} échec</span>
            </>
          )}
        </span>
      ),
    },
    {
      key: "productName",
      label: "Produit",
      render: (r) => (
        <span className="text-[12px] text-[#4A7A94]">{r.productName || "—"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Créé le",
      width: "140px",
      render: (r) => (
        <span className="text-[12px] text-[#8BAFC0]">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "90px",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setDetailId(r.id ?? null)}
            title="Détails"
            className="rounded-lg p-2 text-[#8BAFC0] transition-all hover:bg-[#E8F4F8] hover:text-[#2E8FAD]"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => r.id && deleteMutation.mutate({ path: { id: r.id } })}
            title="Supprimer"
            className="rounded-lg p-2 text-[#8BAFC0] transition-all hover:bg-[#FEE2E2] hover:text-[#DC2626]"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-7">
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="mb-5 flex cursor-pointer items-center gap-2 text-[12.5px] text-[#8BAFC0] transition-colors hover:text-[#0D2137]"
      >
        <ArrowLeft size={13} />
        Contacts
      </button>

      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[#0D2137]">
            Historique des imports
          </h1>
          <p className="mt-1 text-[12.5px] text-[#4A7A94]">
            {total} import{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <SearchInput
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            containerClassName="w-52"
          />
          <Button variant="primary" onClick={() => navigate({ to: "/contacts/import" })}>
            <Upload size={13} /> Nouvel import
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white">
        <DataTable
          columns={columns}
          data={imports}
          loading={isLoading}
          getRowId={(r) => r.id ?? ""}
          emptyTitle="Aucun import"
          emptyDescription="Les imports de contacts apparaîtront ici."
        />
      </div>
      <Pagination total={total} pageSize={pageSize} page={page} onChange={setPage} />

      <ImportDetailModal
        importId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

function ImportDetailModal({
  importId,
  onClose,
}: {
  importId: string | null;
  onClose: () => void;
}) {
  const { data: detail } = useQuery({
    ...getApiClientImportDetailByIdOptions({ path: { id: importId ?? "" } }),
    select: (res) => res?.data as SearchClientImportResponse | undefined,
    enabled: !!importId,
  });

  let mapping: Record<string, unknown> | null = null;
  try {
    mapping = detail?.mappingConfiguration
      ? (JSON.parse(detail.mappingConfiguration) as Record<string, unknown>)
      : null;
  } catch {
    mapping = null;
  }

  const rows: { k: string; v: ReactNode }[] = detail
    ? [
        { k: "Fichier", v: detail.fileName || "—" },
        { k: "Statut", v: <Badge variant={importStatusVariant(detail.status)}>{detail.status || "—"}</Badge> },
        { k: "Produit", v: detail.productName || "—" },
        { k: "Lignes totales", v: fmt(detail.totalRows ?? 0) },
        { k: "Réussies", v: fmt(detail.successfulRows ?? 0) },
        { k: "Échouées", v: fmt(detail.failedRows ?? 0) },
        { k: "Doublons", v: fmt(detail.duplicateRows ?? 0) },
        { k: "Démarré", v: detail.startedAt ? formatDate(detail.startedAt) : "—" },
        { k: "Terminé", v: detail.completedAt ? formatDate(detail.completedAt) : "—" },
      ]
    : [];

  return (
    <Modal
      open={!!importId}
      onClose={onClose}
      title="Détail de l'import"
      subtitle={detail?.fileName ?? undefined}
      size="md"
    >
      {!detail ? (
        <p className="py-8 text-center text-[13px] text-[#8BAFC0]">Chargement…</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[12px] border border-[#E5E7EB]">
            {rows.map((r) => (
              <div
                key={r.k}
                className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5 last:border-0"
              >
                <span className="text-[12px] text-[#8BAFC0]">{r.k}</span>
                <span className="text-[12.5px] font-medium text-[#0D2137]">{r.v}</span>
              </div>
            ))}
          </div>

          {mapping && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8BAFC0]">
                Mapping des colonnes
              </p>
              <div className="rounded-md bg-[#F7F8F9] p-3 text-[12px] text-[#4A7A94]">
                {Object.entries(mapping).map(([col, field]) => (
                  <div key={col} className="flex justify-between py-0.5">
                    <code className="text-[#2E8FAD]">{col}</code>
                    <span>→ {String(field)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.errorLog && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#DC2626]">
                Journal d'erreurs
              </p>
              <pre className="max-h-[160px] overflow-auto whitespace-pre-wrap rounded-md bg-[#FEF2F2] p-3 text-[11.5px] text-[#B91C1C]">
                {detail.errorLog}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
