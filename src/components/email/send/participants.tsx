'use client';

export const Participant = ({ fullName }: { fullName?: string }) => {
  return (
    <div className="flex space-x-2 items-center py-1.5 px-2.5 rounded-l-3xl rounded-r-3xl bg-muted">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-warning p-2 text-background">
        {fullName?.slice(0, 1).toUpperCase()}
      </div>
      <p className="text-base text-foreground">{fullName}</p>
    </div>
  );
};
