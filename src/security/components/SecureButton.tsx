import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Action } from '../types';
import { useSecurity } from '../SecurityProvider';
import { Button } from "@/components/ui/Button";

interface SecureButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  perform: Action;
  resource?: string;
  hide?: boolean;
  children: ReactNode;
}

export const SecureButton = ({
  perform,
  resource,
  hide = false,
  children,
  ...props
}: SecureButtonProps) => {
  const { can } = useSecurity();

  if (!can(perform, resource)) {
    return hide ? null : (
      <Button disabled title="Permissions insuffisantes" {...props}>
        {children}
      </Button>
    );
  }

  return <Button {...props}>{children}</Button>;
};