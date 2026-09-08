'use client';

import { ChevronDown } from 'lucide-react';
import { InputField } from '@/components/ui/form-inputs/InputField';
import SwitchField from '@/components/ui/form-inputs/SwitchField';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { HostsField } from '@/components/embeddings/settings/hosts-field';
import { SETTINGS_LIMITS } from '@/lib/models/embeddings/settings-form';

type AdvancedSettingsProps = {
  disabled: boolean;
};

export function AdvancedSettings({ disabled }: AdvancedSettingsProps) {
  return (
    <Collapsible className="rounded-lg border border-border/60 bg-card">
      <CollapsibleTrigger
        type="button"
        className="flex min-h-8 w-full cursor-pointer items-center justify-between gap-3 px-3 py-3 text-left text-sm font-medium hover:bg-accent/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&[data-state=open]>svg]:rotate-180"
      >
        Advanced limits
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border/60 px-3 pb-3 pt-3">
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-[13px] font-medium tracking-wide text-muted-foreground">
              Queue
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                fieldName="queue.concurrency"
                label="Concurrency"
                type="number"
                min={SETTINGS_LIMITS.concurrency.min}
                max={SETTINGS_LIMITS.concurrency.max}
                step={1}
                inputMode="numeric"
                disabled={disabled}
                description="Generation worker concurrency."
              />
              <InputField
                fieldName="queue.attempts"
                label="Attempts"
                type="number"
                min={SETTINGS_LIMITS.attempts.min}
                max={SETTINGS_LIMITS.attempts.max}
                step={1}
                inputMode="numeric"
                disabled={disabled}
                description="Retries for a failed generation job."
              />
              <InputField
                fieldName="queue.maxBatchSize"
                label="Max batch size"
                type="number"
                min={SETTINGS_LIMITS.maxBatchSize.min}
                max={SETTINGS_LIMITS.maxBatchSize.max}
                step={1}
                inputMode="numeric"
                disabled={disabled}
                description="Jobs accepted from one enqueue or backfill request."
              />
              <InputField
                fieldName="queue.drainTimeoutMs"
                label="Drain timeout (ms)"
                type="number"
                min={SETTINGS_LIMITS.drainTimeoutMs.min}
                max={SETTINGS_LIMITS.drainTimeoutMs.max}
                step={1}
                inputMode="numeric"
                disabled={disabled}
                description="How long a backfill may wait for generation jobs."
              />
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-[13px] font-medium tracking-wide text-muted-foreground">
              Security
            </h3>
            <div className="space-y-1.5">
              <SwitchField
                fieldName="security.requireGrpcKey"
                label="Require gRPC key"
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Always enforced when the server runs in production.
              </p>
            </div>
            <HostsField
              name="security.sourceFieldAllowlist"
              label="Source field allowlist"
              disabled={disabled}
              placeholder="Add a field name and press Enter"
              description="Operator-approved source fields, including names that would otherwise be rejected."
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-[13px] font-medium tracking-wide text-muted-foreground">
              Input and event limits
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                fieldName="security.maxMutationEventIds"
                label="Max mutation event ids"
                type="number"
                min={SETTINGS_LIMITS.maxMutationEventIds.min}
                max={SETTINGS_LIMITS.maxMutationEventIds.max}
                step={1}
                inputMode="numeric"
                disabled={disabled}
                description="Document ids accepted from one mutation payload."
              />
              <InputField
                fieldName="security.embedTimeoutMs"
                label="Embed timeout (ms)"
                type="number"
                min={SETTINGS_LIMITS.embedTimeoutMs.min}
                max={SETTINGS_LIMITS.embedTimeoutMs.max}
                step={1}
                inputMode="numeric"
                disabled={disabled}
                description="Provider request timeout."
              />
              <InputField
                fieldName="security.maxEmbedInputBytes"
                label="Max input bytes"
                type="number"
                min={SETTINGS_LIMITS.maxEmbedInputBytes.min}
                max={SETTINGS_LIMITS.maxEmbedInputBytes.max}
                step={1}
                inputMode="numeric"
                disabled={disabled}
                description="Maximum embedding input payload size."
              />
              <InputField
                fieldName="security.maxEmbedResponseBytes"
                label="Max response bytes"
                type="number"
                min={SETTINGS_LIMITS.maxEmbedResponseBytes.min}
                max={SETTINGS_LIMITS.maxEmbedResponseBytes.max}
                step={1}
                inputMode="numeric"
                disabled={disabled}
                description="Maximum provider response size."
              />
            </div>
          </section>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
