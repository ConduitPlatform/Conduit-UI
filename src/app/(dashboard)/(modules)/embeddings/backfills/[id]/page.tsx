import { notFound } from 'next/navigation';
import { BackfillDetail } from '@/components/embeddings/backfills/backfill-detail';
import { getBackfill } from '@/lib/api/embeddings';
import { BackfillRun, isEmbeddingsNotFound } from '@/lib/models/embeddings';

export default async function EmbeddingBackfillDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let run: BackfillRun;
  try {
    run = await getBackfill(id);
  } catch (error) {
    if (isEmbeddingsNotFound(error)) notFound();
    throw error;
  }

  return <BackfillDetail run={run} />;
}
