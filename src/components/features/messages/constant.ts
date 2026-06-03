export const chMeta: Record<string, { name: string; c: string; bg: string }> = {
  sms: { name: "SMS", c: "#2E8FAD", bg: "#E8F4F8" },
  email: { name: "Email", c: "#1B5E82", bg: "#EEF4FB" },
  whatsapp: { name: "WhatsApp", c: "#25D366", bg: "#F0FFF4" },
  push: { name: "Push", c: "#E8541A", bg: "#FFF0EA" },
};

export const statusMeta: Record<
  string,
  { cls: string; dot: string; label: string }
> = {
  delivered: {
    cls: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
    dot: "var(--ok)",
    label: "Livré",
  },
  sent: {
    cls: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
    dot: "var(--ok)",
    label: "Livré",
  },
  received: {
    cls: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
    dot: "var(--ok)",
    label: "Reçu",
  },
  opened: {
    cls: "bg-[#E8F4F8] text-[#1B5E82] border-[#6AB8D4]/30",
    dot: "var(--t)",
    label: "Ouvert",
  },
  failed: {
    cls: "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]",
    dot: "var(--er)",
    label: "Échoué",
  },
  pending: {
    cls: "bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]",
    dot: "var(--wa)",
    label: "En attente",
  },
  clicked: {
    cls: "bg-[#EDE9FE] text-[#7C3AED] border-[#C4B5FD]",
    dot: "#7C3AED",
    label: "Cliqué",
  },
  read: {
    cls: "bg-[#EDE9FE] text-[#7C3AED] border-[#C4B5FD]",
    dot: "#7C3AED",
    label: "Lu",
  },
  default: {
    cls: "bg-[#F0F2F4] text-[#4A7A94] border-[#E5E7EB]",
    dot: "var(--t3)",
    label: "Inconnu",
  },
};
