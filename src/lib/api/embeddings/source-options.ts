import { getTeam, getTeams } from '@/lib/api/authentication';
import { getContainers } from '@/lib/api/storage';
import { parseTeamPartitionSubject } from '@/lib/models/embeddings/source';

export type TeamOption = {
  id: string;
  name: string;
};

export type ContainerOption = {
  id: string;
  name: string;
};

export type SelectorLoadResult<T> = {
  items: T[];
  total: number;
  truncated: boolean;
  error?: string;
};

const PAGE_SIZE = 100;

export async function loadTeamOptions(
  lockedPartition?: string
): Promise<SelectorLoadResult<TeamOption>> {
  try {
    const first = await getTeams(0, PAGE_SIZE);
    const items = first.teams.map(team => ({
      id: team._id,
      name: team.name,
    }));
    const lockedId = lockedPartition
      ? parseTeamPartitionSubject(lockedPartition)
      : undefined;
    if (lockedId && !items.some(team => team.id === lockedId)) {
      try {
        const team = await getTeam(lockedId);
        items.unshift({ id: team._id, name: team.name });
      } catch {
        items.unshift({ id: lockedId, name: lockedId });
      }
    }
    return {
      items,
      total: first.count,
      truncated: items.length < first.count,
    };
  } catch {
    return {
      items: [],
      total: 0,
      truncated: false,
      error:
        'Teams could not be loaded. Creation is blocked until the team list is available.',
    };
  }
}

export async function loadContainerOptions(
  lockedName?: string
): Promise<SelectorLoadResult<ContainerOption>> {
  try {
    const first = await getContainers({ skip: 0, limit: PAGE_SIZE });
    const items = first.containers.map(container => ({
      id: container._id,
      name: container.name,
    }));
    if (lockedName && !items.some(item => item.name === lockedName)) {
      items.unshift({ id: lockedName, name: lockedName });
    }
    return {
      items,
      total: first.containersCount,
      truncated: items.length < first.containersCount,
    };
  } catch {
    return {
      items: [],
      total: 0,
      truncated: false,
      error:
        'Containers could not be loaded. Creation is blocked until the container list is available.',
    };
  }
}
