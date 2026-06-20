import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ModuleToggleProps {
  label: string;
  checked: boolean;
  isSaving?: boolean;
  onCheckedChange: () => void;
}

export function ModuleToggle({
  label,
  checked,
  isSaving = false,
  onCheckedChange,
}: ModuleToggleProps) {
  return (
    <div className="flex gap-2 items-center">
      <p className="text-2xl font-medium">{label}</p>
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : null}
      <Switch
        checked={checked}
        disabled={isSaving}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
