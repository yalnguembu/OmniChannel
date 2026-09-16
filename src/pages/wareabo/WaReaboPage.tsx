import React from "react";
import { WhatsAppPage } from "@/pages/whatsapp/WhatsAppPage";
import { ReaboEntityProvider } from "@/components/reabo/ReaboEntityContext";

interface WaReaboPageProps {
  senderId?: string;
}

/**
 * The WhatsApp inbox with the ReaboCanal layer on top — route `/wareabo`.
 *
 * It is the same inbox, not a copy: same conversations, same store, same chat.
 * The only difference is the provider wrapped around it, which is what switches
 * the Reabo additions on — the connection pill in the sidebar header, the
 * subscription section in the details panel, and decoder numbers becoming
 * actionable in the thread.
 *
 * Keeping it to a provider rather than a duplicated page means `/wa` stays
 * exactly as it was, and every fix to the chat benefits both routes. It is also
 * what will make the Reabo layer liftable into its own project later: the seam
 * is already drawn.
 */
export const WaReaboPage: React.FC<WaReaboPageProps> = ({ senderId }) => (
  <ReaboEntityProvider>
    <WhatsAppPage senderId={senderId} />
  </ReaboEntityProvider>
);
