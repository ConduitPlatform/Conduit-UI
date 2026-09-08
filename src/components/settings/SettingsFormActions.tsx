import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SettingsFormActionsProps {
  edit: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  shortcutLabel?: string;
  dirty?: boolean;
  submitLabel?: string;
}

export function SettingsFormActions({
  edit,
  isSaving = false,
  onEdit,
  onCancel,
  shortcutLabel,
  dirty,
  submitLabel = 'Submit',
}: SettingsFormActionsProps) {
  const showShortcut = Boolean(edit && dirty && shortcutLabel && !isSaving);
  const submitDisabled = isSaving || dirty === false;

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
          <TooltipProvider delayDuration={250}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  disabled={submitDisabled}
                  aria-keyshortcuts={showShortcut ? shortcutLabel : undefined}
                >
                  {isSaving ? 'Saving…' : submitLabel}
                  {showShortcut ? (
                    <kbd className="ml-1.5 rounded border border-primary-foreground/30 bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-[10px] tracking-wide">
                      {shortcutLabel}
                    </kbd>
                  ) : null}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {dirty === false
                    ? 'No unsaved changes'
                    : showShortcut
                      ? `Save settings ${shortcutLabel}`
                      : submitLabel}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <Button type="button" onClick={onEdit} disabled={isSaving}>
          Edit
        </Button>
      )}
    </div>
  );
}
