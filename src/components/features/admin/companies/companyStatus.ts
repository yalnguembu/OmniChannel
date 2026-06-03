export const STRIPES: Record<string, string> = {
  active: "linear-gradient(90deg,#2E8FAD,#6AB8D4)",
  suspended: "linear-gradient(90deg,#DC2626,#FCA5A5)",
  pending: "linear-gradient(90deg,#D97706,#FCD34D)",
  inactive: "linear-gradient(90deg,#DDE4EA,#E5E7EB)",
};

export const STATUS_V: Record<
  string,
  "success" | "error" | "warning" | "neutral"
> = {
  active: "success",
  suspended: "error",
  pending: "warning",
  inactive: "neutral",
};
