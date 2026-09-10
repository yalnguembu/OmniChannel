/**
 * Palette WhatsApp — reprise à l'identique des variables `--color-wa-*` du web
 * (src/index.css) pour que les deux clients aient exactement le même rendu.
 */
export const colors = {
  sidebar: '#ffffff',
  header: '#ffffff',
  inputBg: '#f0f0ec',
  hover: '#ebe9e3',
  active: '#e7e4dc',
  chatBg: '#efeae2',
  bubbleIn: '#ffffff',
  bubbleOut: '#d9fdd3',
  green: '#25d366',
  greenSend: '#00a884',
  teal: '#128c7e',
  tealDark: '#075e54',
  text: '#111b21',
  muted: '#6f6e69',
  icon: '#595755',
  border: '#e5e0d9',
  tickRead: '#53bdeb',
  danger: '#e53935',
  white: '#ffffff',
  overlay: 'rgba(0,0,0,0.5)',
  status: {
    OPEN: '#1aa260',
    PENDING: '#d97706',
    RESOLVED: '#1d4ed8',
    CLOSED: '#6b7280',
  } as Record<string, string>,
  statusBg: {
    OPEN: '#e6f4ed',
    PENDING: '#fef3c7',
    RESOLVED: '#dbeafe',
    CLOSED: '#f3f4f6',
  } as Record<string, string>,
};

export const radius = { sm: 6, md: 8, lg: 12, pill: 999 };

/** Libellés FR des statuts de conversation (mêmes valeurs que le web). */
export const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Ouverte',
  PENDING: 'En attente',
  RESOLVED: 'Résolue',
  CLOSED: 'Fermée',
};
