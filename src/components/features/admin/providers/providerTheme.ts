export interface ProviderTheme {
  bg: string;
  color: string;
  stripe: string;
}

const COLORS: Record<string, ProviderTheme> = {
  TWILIO: { bg: "#FFF0F0", color: "#F22F46", stripe: "linear-gradient(90deg,#F22F46,#FF7B85)" },
  SENDGRID: { bg: "#EFF6FF", color: "#1A82E2", stripe: "linear-gradient(90deg,#1A82E2,#5DB3F7)" },
  VONAGE: { bg: "#F5F0FF", color: "#7C5EE0", stripe: "linear-gradient(90deg,#7C5EE0,#A78BFA)" },
  MAILGUN: { bg: "#FFF0F0", color: "#FA2A2A", stripe: "linear-gradient(90deg,#FA2A2A,#FCA5A5)" },
  MESSAGEBIRD: { bg: "#FFF4F0", color: "#FF6B35", stripe: "linear-gradient(90deg,#FF6B35,#FDBA74)" },
  INFOBIP: { bg: "#FFF0F5", color: "#FF0066", stripe: "linear-gradient(90deg,#FF0066,#FDA4AF)" },
  PLIVO: { bg: "#F0FAFF", color: "#00AEEF", stripe: "linear-gradient(90deg,#00AEEF,#6AB8D4)" },
  AWS: { bg: "#FFF8F0", color: "#FF9900", stripe: "linear-gradient(90deg,#FF9900,#FCD34D)" },
};

const FALLBACK: ProviderTheme = {
  bg: "#E8F4F8",
  color: "#2E8FAD",
  stripe: "linear-gradient(90deg,#2E8FAD,#6AB8D4)",
};

export function getProviderTheme(code?: string | null): ProviderTheme {
  if (!code) return FALLBACK;
  return COLORS[code.toUpperCase()] ?? FALLBACK;
}
