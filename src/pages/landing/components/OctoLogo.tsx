interface OctoLogoProps {
  size?: number;
}

export function OctoLogo({ size = 20 }: OctoLogoProps) {
  return <img width={size} height={size} src="/logo.png" alt="OmniChannel" />;
}
