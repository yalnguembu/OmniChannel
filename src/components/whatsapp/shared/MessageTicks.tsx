import React from 'react';
import { Check, CheckCheck, AlertCircle } from 'lucide-react';

interface MessageTicksProps {
  status: string;
}

export const MessageTicks: React.FC<MessageTicksProps> = ({ status }) => {
  const s = status.toUpperCase();

  if (s === 'FAILED' || s === 'BOUNCED') {
    return <AlertCircle className="size-3.5 text-destructive" strokeWidth={2.5} />;
  }
  if (s === 'READ') {
    return <CheckCheck className="size-4 text-wa-tick-read" strokeWidth={2.5} />;
  }
  if (s === 'DELIVERED') {
    return <CheckCheck className="size-4 text-wa-muted" strokeWidth={2.5} />;
  }
  // SENT, QUEUED, PENDING, SENDING
  return <Check className="size-4 text-wa-muted" strokeWidth={2.5} />;
};
