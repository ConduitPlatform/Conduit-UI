import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

afterEach(() => {
  cleanup();
});

describe('Tooltip', () => {
  it('portals content so account labels are not trapped in the rail stacking context', () => {
    const { container } = render(
      <TooltipProvider delayDuration={0}>
        <div className="fixed z-10" data-testid="sidebar">
          <Tooltip open>
            <TooltipTrigger>J</TooltipTrigger>
            <TooltipContent>jordan</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );

    const label = screen.getByRole('tooltip', { name: 'jordan' });
    expect(label).toBeInTheDocument();
    expect(container).not.toContainElement(label);
    expect(document.body).toContainElement(label);
  });
});
