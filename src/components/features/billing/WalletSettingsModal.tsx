import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export function WalletSettingsModal({ isOpen, onClose, wallet }: { isOpen: boolean, onClose: () => void, wallet?: any }) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Paramètres wallet"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast.info(
                "Les seuils du wallet sont gérés par la plateforme — contactez le support pour les modifier.",
              );
              onClose();
            }}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Solde minimum (alerte de blocage)"
          type="number"
          defaultValue={wallet?.minimumBalance ?? 200000}
          hint="En dessous de ce seuil, le wallet sera automatiquement bloqué."
        />
        <Input
          label="Seuil d'alerte (notification email)"
          type="number"
          defaultValue={wallet?.lowBalanceThreshold ?? 150000}
          hint="Une notification sera envoyée quand le solde atteint ce seuil."
        />
      </div>
    </Modal>
  );
}
