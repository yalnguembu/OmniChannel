import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { postApiClientSegmentMessagesByIdMutation } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SegmentMessageResponse } from "@/shared/api/generated/types.gen";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { fmt } from "@/lib/utils";

/**
 * Renders the personalized message each segment member would receive from a
 * template (POST /api/ClientSegment/messages/{id} → per-member {phone, message}).
 * A preview tool — no message is actually sent.
 */
export function SegmentMessagesPreviewModal({
  open,
  onClose,
  segmentId,
  segmentName,
}: {
  open: boolean;
  onClose: () => void;
  segmentId: string;
  segmentName?: string;
}) {
  const [template, setTemplate] = useState("");
  const [rows, setRows] = useState<SegmentMessageResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [touched, setTouched] = useState(false);

  const mutation = useMutation({
    ...postApiClientSegmentMessagesByIdMutation(),
    onSuccess: (res) => {
      const data = res?.data;
      setRows([...(data?.items ?? [])]);
      setTotal(data?.totalCount ?? 0);
      setTouched(true);
    },
    onError: () => toast.error("Erreur lors de la génération de l'aperçu"),
  });

  const generate = () => {
    if (!template.trim()) return;
    mutation.mutate({
      path: { id: segmentId },
      body: { template },
      query: { pageNumber: 1, pageSize: 50 },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aperçu des messages"
      subtitle={
        segmentName
          ? `Rendu personnalisé pour « ${segmentName} »`
          : "Rendu personnalisé par membre"
      }
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <Textarea
            label="Modèle de message"
            placeholder="Ex : Bonjour {{firstName}}, votre offre expire le {{date_fin}}…"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            rows={3}
          />
          <p className="mt-1 text-[11.5px] text-[#8BAFC0]">
            Les variables du modèle sont remplacées par les données de chaque
            client du segment. Aucun message n'est envoyé — il s'agit d'un aperçu.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={generate}
          loading={mutation.isPending}
          disabled={!template.trim()}
        >
          <Sparkles size={14} /> Générer l'aperçu
        </Button>

        {touched && (
          <div>
            <p className="mb-2 text-[12.5px] text-[#4A7A94]">
              <strong className="text-[#2E8FAD]">{fmt(total)}</strong> message(s)
              {rows.length < total ? ` · ${rows.length} affichés` : ""}
            </p>
            {rows.length === 0 ? (
              <p className="py-6 text-center text-[13px] italic text-[#8BAFC0]">
                Aucun membre à prévisualiser.
              </p>
            ) : (
              <div className="max-h-[320px] overflow-y-auto rounded-[12px] border border-[#E5E7EB]">
                <table className="w-full text-[12.5px]">
                  <thead className="sticky top-0 bg-[#F7F8F9] text-[#8BAFC0]">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Téléphone</th>
                      <th className="px-3 py-2 text-left font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {rows.map((r, i) => (
                      <tr key={r.clientId ?? i}>
                        <td className="whitespace-nowrap px-3 py-2 align-top text-[#0D2137]">
                          {r.phone || "—"}
                        </td>
                        <td className="whitespace-pre-wrap px-3 py-2 align-top text-[#4A7A94]">
                          {r.message || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
