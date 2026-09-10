'use client';

import Link from 'next/link';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NewSourceMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="min-h-8 gap-2">
          <Plus className="size-4" />
          New
          <ChevronDown className="size-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuItem asChild className="min-h-8">
          <Link href="/embeddings/configs/new">Database schema</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="min-h-8">
          <Link href="/embeddings/sources/new?kind=conduit-storage">
            Conduit Storage
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="min-h-8">
          <Link href="/embeddings/sources/new?kind=external">
            External / custom
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
