import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, RefreshCw } from "lucide-react";
import { ClientSegmentService, ClientService } from "@/shared/api/services";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { PageLoader } from "@/components/feedback/PageLoader";
import { formatDate, formatRelative } from "@/lib/date";
import { fmt, getInitials, avatarColor, statusLabel } from "@/lib/utils";
import type { ClientDto } from "@/api/generated/types";

export function SegmentDetailPage({ segmentId }: { segmentId: string }) {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["segment", segmentId],
    queryFn: () => ClientSegmentService.getDetail(segmentId) as any,
  });

  const { data: membersData } = useQuery({
    queryKey: ["segment-members", segmentId],
    queryFn: () =>
      ClientService.search({ segmentId, pageNumber: 1, pageSize: 20 }) as any,
  });

  const segment = data?.data;
  const members: ClientDto[] = membersData?.data?.items ?? [];

  if (isLoading) return <PageLoader />;
  if (!segment)
    return (
      <div className="p-7">
        <p className="text-[13px] text-[#8BAFC0]">Segment introuvable</p>
      </div>
    );

  const columns: Column<ClientDto>[] = [
    {
      key: "name",
      label: "Contact",
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
            style={{ background: avatarColor(c.firstName ?? "U") }}
          >
            {getInitials(c.firstName, c.lastName)}
          </div>
          <span className="font-medium">
            {c.firstName} {c.lastName}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (c) => <span className="text-[#4A7A94]">{c.email ?? "—"}</span>,
    },
    {
      key: "phone",
      label: "Téléphone",
      render: (c) => <span className="text-[#4A7A94]">{c.phone ?? "—"}</span>,
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (c) => (
        <Badge variant={c.status === "active" ? "success" : "neutral"} dot>
          {statusLabel(c.status)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-7">
      <button
        onClick={() => navigate({ to: "/contacts/segments" })}
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
          <Button variant="ghost" size="sm">
            <RefreshCw size={13} />
            Recalculer
          </Button>
          <Button variant="primary" size="sm">
            Créer une campagne
          </Button>
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
            className="bg-white border border-[#E5E7EB] rounded-[10px] px-4 py-3.5"
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

      <Card>
        <CardHeader title={`Membres (${members.length})`} />
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            data={members}
            getRowId={(c) => c.id}
            emptyTitle="Aucun membre"
            emptyDescription="Ce segment ne contient pas encore de contacts"
          />
        </CardBody>
      </Card>
    </div>
  );
}
