import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PaymentService } from "@/shared/api/services";
import { getApiPaymentMethodDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { formatCurrency } from "@/lib/currency";

const MIN_AMOUNT = 10000;

export function RechargeWalletModal({
  isOpen,
  onClose,
  balance,
  currency,
}: {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  currency: string;
}) {
  const qc = useQueryClient();
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [phone, setPhone] = useState("");

  const amount = Number(rechargeAmount);
  const isValid = amount >= MIN_AMOUNT && !!paymentMethodId;

  // Fetch configured payment methods
  const { data: methodsData } = useQuery({
    ...getApiPaymentMethodDropdownOptions(),
    select: (res: any) =>
      (res?.data ?? []) as { id: string; name: string; type?: string }[],
    enabled: isOpen,
  });
  const paymentMethods = methodsData ?? [];

  const close = () => {
    setRechargeAmount("");
    setPhone("");
    setPaymentMethodId("");
    onClose();
  };

  const rechargeMutation = useMutation({
    mutationFn: () =>
      PaymentService.create({
        amount,
        currency,
        paymentMethodId: paymentMethodId || undefined,
        metadata: phone ? JSON.stringify({ phoneNumber: phone }) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Demande de rechargement enregistrée");
      close();
    },
    onError: () => toast.error("Erreur lors du rechargement"),
  });

  return (
    <Modal
      open={isOpen}
      onClose={close}
      title="Recharger le wallet"
      subtitle={`Solde actuel : ${formatCurrency(balance, currency)}`}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Annuler
          </Button>
          <Button
            variant="primary"
            disabled={!isValid}
            loading={rechargeMutation.isPending}
            onClick={() => rechargeMutation.mutate()}
          >
            Confirmer le rechargement
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Input
            label="Montant à recharger *"
            type="number"
            placeholder="ex : 100 000"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
            hint={`Minimum : ${formatCurrency(MIN_AMOUNT, currency)}`}
          />
          <div className="flex gap-2 mt-2">
            {[50000, 100000, 200000, 500000].map((v) => (
              <button
                key={v}
                onClick={() => setRechargeAmount(String(v))}
                className="text-[12px] px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F0F2F4] text-[#4A7A94] transition-all cursor-pointer"
              >
                {(v / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {paymentMethods.length > 0 ? (
          <Select
            label="Méthode de paiement *"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            options={[
              { value: "", label: "Sélectionner une méthode" },
              ...paymentMethods.map((m) => ({
                value: m.id,
                label: m.name ?? m.type ?? m.id,
              })),
            ]}
          />
        ) : (
          <div className="text-[12.5px] text-[#8BAFC0] bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px] p-3">
            Aucune méthode de paiement configurée.{" "}
            <a href="/billing/payment-methods" className="text-[#2E8FAD] underline">
              Ajouter une méthode
            </a>
          </div>
        )}

        <Input
          label="Numéro de téléphone (optionnel)"
          placeholder="+224 620 123 456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="bg-[#F7F8F9] border border-[#E5E7EB] rounded-[10px] p-3.5">
          <div className="flex justify-between text-[12.5px] mb-2">
            <span className="text-[#8BAFC0]">Montant</span>
            <span className="font-medium">
              {rechargeAmount ? formatCurrency(amount, currency) : "—"}
            </span>
          </div>
          <div className="flex justify-between text-[12.5px] mb-2">
            <span className="text-[#8BAFC0]">Frais</span>
            <span className="text-[#8BAFC0]">{formatCurrency(0, currency)}</span>
          </div>
          <div className="flex justify-between text-[13px] font-semibold pt-2 border-t border-[#E5E7EB]">
            <span>Total</span>
            <span>
              {rechargeAmount ? formatCurrency(amount, currency) : "—"}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
