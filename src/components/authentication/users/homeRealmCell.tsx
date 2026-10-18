import { realmLabel } from '@/lib/authentication/realmMembers';

/** Slug pill for a realm home user, "Global" for users without a home realm. */
export function HomeRealmCell({
  homeRealm,
  realmSlugs,
}: Readonly<{
  homeRealm?: string | null;
  realmSlugs?: ReadonlyMap<string, string>;
}>) {
  if (!homeRealm) {
    return <span className="text-muted-foreground">Global</span>;
  }
  return (
    <span
      className="inline-flex items-center rounded-full bg-callout-info-muted px-2.5 py-0.5 font-mono text-xs font-medium text-callout-info-foreground"
      title="Home realm"
    >
      {realmLabel(homeRealm, realmSlugs)}
    </span>
  );
}
