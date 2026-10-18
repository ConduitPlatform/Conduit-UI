'use client';
import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

/** One setting per row: label and explanation on the left, switch on the right. */
export function RealmSwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
  children,
}: Readonly<{
  id: string;
  label: string;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  /** Rendered under the description (e.g. a credentials hint). */
  children?: ReactNode;
}>) {
  return (
    <div
      className={cn(
        'flex flex-row items-start justify-between gap-4',
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
