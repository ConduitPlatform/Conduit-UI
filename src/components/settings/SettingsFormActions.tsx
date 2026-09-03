import { Button } from '@/components/ui/button';

interface SettingsFormActionsProps {
  edit: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export function SettingsFormActions({
  edit,
  isSaving = false,
  onEdit,
  onCancel,
}: SettingsFormActionsProps) {
  return (
    <div className="w-full py-4 flex justify-end">
      {edit ? (
        <div className="flex gap-2">
          <Button
            type="button"
            className="border-border-strong"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Submit'}
          </Button>
        </div>
      ) : (
        <Button type="button" onClick={onEdit} disabled={isSaving}>
          Edit
        </Button>
      )}
    </div>
  );
}
