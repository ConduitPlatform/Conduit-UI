const UNITS: [string, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
  ['second', 1000],
  ['ms', 1],
];

/** Human-readable duration of a millisecond value, e.g. `1 day 2 hours`. Empty if invalid. */
export function formatDuration(ms: unknown): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return '';
  let rest = Math.trunc(ms);
  const parts: string[] = [];
  for (const [name, size] of UNITS) {
    const count = Math.floor(rest / size);
    if (count === 0) continue;
    rest -= count * size;
    parts.push(
      name === 'ms'
        ? `${count} ms`
        : `${count} ${name}${count === 1 ? '' : 's'}`
    );
  }
  return parts.join(' ');
}
