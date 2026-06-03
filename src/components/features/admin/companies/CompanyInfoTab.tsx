import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { formatDate } from "@/lib/date";
import { statusLabel } from "@/lib/utils";
import type { CompanyDto } from "@/shared/api/generated/types.gen";

interface CompanyInfoTabProps {
  company: CompanyDto;
}

export function CompanyInfoTab({ company }: CompanyInfoTabProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader title="Informations générales" />
        <CardBody className="p-0">
          {[
            { k: "Nom", v: company.name },
            { k: "Raison sociale", v: company.legalName ?? "—" },
            { k: "Email", v: company.email ?? "—" },
            { k: "Téléphone", v: company.phone ?? "—" },
            { k: "Site web", v: company.website ?? "—" },
            { k: "Pays", v: company.country ?? "—" },
            { k: "Ville", v: company.city ?? "—" },
            { k: "Adresse", v: company.address ?? "—" },
            { k: "N° fiscal", v: company.taxNumber ?? "—" },
            { k: "Créée le", v: formatDate(company.createdAt) },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-start justify-between px-5 py-2.5 border-b border-[#E5E7EB] last:border-b-0"
            >
              <span className="text-[12px] text-[#8BAFC0] shrink-0">
                {row.k}
              </span>
              <span className="text-[13px] text-[#0D2137] text-right ml-4 break-all">
                {row.v}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Configuration" />
        <CardBody className="p-0">
          {[
            { k: "Fuseau", v: company.timezone ?? "—" },
            { k: "Langue", v: company.defaultLanguage ?? "—" },
            { k: "Facturation", v: company.billingMode ?? "—" },
            { k: "Sandbox", v: company.isSandbox ? "Oui" : "Non" },
            { k: "Statut", v: statusLabel(company.status ?? "") },
          ].map((row) => (
            <div
              key={row.k}
              className="flex items-start justify-between px-5 py-2.5 border-b border-[#E5E7EB] last:border-b-0"
            >
              <span className="text-[12px] text-[#8BAFC0] shrink-0">
                {row.k}
              </span>
              <span className="text-[13px] text-[#0D2137] text-right ml-4">
                {row.v}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
