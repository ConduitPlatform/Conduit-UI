export const Stats = ({
  stats,
}: {
  stats: { name: string; value: string; unit?: string }[];
}) => {
  return (
    <div className="bg-background border-primary border rounded">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-px bg-white/5 grid-cols-4">
          {stats.map(stat => (
            <div key={stat.name} className="px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-sm font-medium leading-6 text-foreground">
                {stat.name}
              </p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </span>
                {stat.unit ? (
                  <span className="text-sm text-foreground-muted">
                    {stat.unit}
                  </span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
