import type { ResourceDefinition } from '@/lib/models/authorization';

/** Authorization resource name for teams (matches Conduit defaults). */
export const TEAM_RESOURCE_NAME = 'Team';

function relationSubjectTypes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string') {
    return [value];
  }
  return [];
}

/**
 * Relation names on the Team resource that a User may hold (same rules as
 * authorization RelationsController.createRelation for subject User, object Team).
 */
export function teamMemberRolesAllowedForUser(
  definition: ResourceDefinition | null | undefined
): string[] {
  if (!definition?.relations) return [];
  const roles: string[] = [];
  for (const [relationName, subjectTypes] of Object.entries(
    definition.relations
  )) {
    const subjects = relationSubjectTypes(subjectTypes);
    if (subjects.includes('User') || subjects.includes('*')) {
      roles.push(relationName);
    }
  }
  return roles.sort((a, b) => a.localeCompare(b));
}
