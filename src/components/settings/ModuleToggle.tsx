import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
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
  const switchId = `module-toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={switchId} className="cursor-pointer text-2xl font-medium">
        {label}
      </Label>
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : null}
      <Switch
        id={switchId}
        checked={checked}
        disabled={isSaving}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}
