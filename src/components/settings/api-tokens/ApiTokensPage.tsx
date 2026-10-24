'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ApiToken, CreateTokenResponse } from '@/lib/models/api-tokens';
import { CreateTokenDialog } from './CreateTokenDialog';
import { TokenCreatedDialog } from './TokenCreatedDialog';
import { RevokeTokenDialog } from './RevokeTokenDialog';
import moment from 'moment';

interface ApiTokensPageProps {
  initialTokens: ApiToken[];
}

export function ApiTokensPage({ initialTokens }: ApiTokensPageProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createdToken, setCreatedToken] = useState<CreateTokenResponse | null>(
    null
  );
  const [tokenToRevoke, setTokenToRevoke] = useState<ApiToken | null>(null);

  const handleTokenCreated = (token: CreateTokenResponse) => {
    setCreateDialogOpen(false);
    setCreatedToken(token);
  };

  const handleSuccessDialogClose = () => {
    setCreatedToken(null);
    router.refresh();
  };

  const handleRevokeSuccess = () => {
    setTokenToRevoke(null);
    router.refresh();
  };

  const formatLastUsed = (lastUsedAt: string | null) => {
    if (!lastUsedAt) return 'Never used';
    return `Last used ${moment(lastUsedAt).fromNow()}`;
  };

  const formatExpiration = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never expires';
    const expDate = moment(expiresAt);
    if (expDate.isBefore(moment())) {
      return `Expired ${expDate.fromNow()}`;
    }
    return `Expires ${expDate.format('MMM D, YYYY')}`;
  };

  return (
    <div className="container flex mx-auto py-16 main-scrollbar items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            <p className="text-2xl font-medium">API Tokens</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Token
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Create long-lived API tokens for programmatic access to Conduit.
            These tokens can be used for MCP integrations, CI/CD pipelines, and
            scripts.
          </p>

          {initialTokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No API tokens</p>
              <p className="text-sm text-muted-foreground">
                Create a token to get started with programmatic access.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {initialTokens.map(token => (
                <div
                  key={token._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{token.name}</p>
                    <p className="text-sm font-mono text-muted-foreground">
                      {token.tokenPrefix}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatExpiration(token.expiresAt)} &bull;{' '}
                      {formatLastUsed(token.lastUsedAt)}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setTokenToRevoke(token)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTokenDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleTokenCreated}
      />

      <TokenCreatedDialog
        token={createdToken}
        onClose={handleSuccessDialogClose}
      />

      <RevokeTokenDialog
        token={tokenToRevoke}
        onOpenChange={open => !open && setTokenToRevoke(null)}
        onSuccess={handleRevokeSuccess}
      />
    </div>
  );
}
