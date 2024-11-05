'use client';

export const Participant = ({ fullName }: { fullName: string }) => {
  return (
    <div className="flex space-x-2 items-center py-1.5 px-2.5 rounded-l-3xl rounded-r-3xl bg-muted">
      <div className="flex items-center justify-center w-8 h-8 p-2 rounded-full bg-amber-500">
        {fullName.slice(0, 1).toUpperCase()}
      </div>
      <p className="text-base text-foreground">{fullName}</p>
    </div>
  );
};
