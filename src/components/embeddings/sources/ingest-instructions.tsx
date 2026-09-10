'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  externalIngestGuidance,
  type EmbeddingSource,
} from '@/lib/models/embeddings/source';

type IngestInstructionsProps = {
  source: EmbeddingSource;
};

export function IngestInstructions({ source }: IngestInstructionsProps) {
  const guidance = externalIngestGuidance(source._id);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trusted ingest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Send text chunks or precomputed vectors from a trusted server. The
          admin UI does not upload documents.
        </p>
        <dl className="grid gap-3">
          <div>
            <dt className="text-xs text-muted-foreground">Create or replace</dt>
            <dd className="break-all font-mono text-xs">
              {guidance.restCreatePath}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Delete</dt>
            <dd className="break-all font-mono text-xs">
              {guidance.restDeletePath}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">gRPC</dt>
            <dd className="font-mono text-xs">
              {guidance.grpcSync} / {guidance.grpcDelete}
            </dd>
          </div>
        </dl>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {guidance.notes.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="text-muted-foreground">
          Chunk vectors must be finite and exactly {source.dimensions}{' '}
          dimensions for {source.provider}/{source.model}.
        </p>
      </CardContent>
    </Card>
  );
}
