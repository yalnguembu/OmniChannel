import type { Action } from '../types';
import { useSecurity } from '../SecurityProvider';
import { Input, type InputProps } from '@/components/ui/Input'

interface SecureInputProps extends InputProps {
  perform: Action;
  resource?: string;
  hide?: boolean;
}
export const InputButton = ({
  perform,
  resource,
  hide = false,
  ...props
}: SecureInputProps) => {
  const { can } = useSecurity();

  
    if (!can(perform, resource)) {
      return hide ? null : <Input {...props} disabled readOnly />;
    }
  
    return <Input {...props} />;
  };