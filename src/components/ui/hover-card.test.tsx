import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card';

afterEach(() => {
  cleanup();
});

describe('HoverCard', () => {
  it('portals content so sidebar flyouts are not trapped in the rail stacking context', () => {
    const { container } = render(
      <div className="fixed z-10" data-testid="sidebar">
        <HoverCard open>
          <HoverCardTrigger>Settings</HoverCardTrigger>
          <HoverCardContent>General</HoverCardContent>
        </HoverCard>
      </div>
    );

    const flyout = screen.getByText('General');
    expect(flyout).toBeInTheDocument();
    expect(container).not.toContainElement(flyout);
    expect(document.body).toContainElement(flyout);
  });
});
