import RelationsList from '@/components/authorization/relations/relations-list';
import {
  deleteRelation,
  getRelations,
  getResourceDefinitions,
} from '@/lib/api/authorization';

export default async function RelationsPage() {
  const { relations, count } = await getRelations();
  const { resources } = await getResourceDefinitions({ skip: 0, limit: 1000 });

  const fetchRelations = async (
    page: number,
    opts?: {
      search?: string;
      subjectType?: string;
      resourceType?: string;
    }
  ) => {
    'use server';
    const { relations, count } = await getRelations({
      skip: (page - 1) * 10,
      limit: 10,
      search: opts?.search,
      subjectType: opts?.subjectType,
      resourceType: opts?.resourceType,
    });
    return { relations: relations ?? [], count };
  };

  const _deleteRelation = async (relationId: string) => {
    'use server';
    await deleteRelation(relationId);
  };

  return (
    <RelationsList
      relations={relations ?? []}
      count={count ?? 0}
      resources={resources}
      fetchRelationsAction={fetchRelations}
      deleteRelationAction={_deleteRelation}
    />
  );
}
