import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Loader2 className="w-10 h-10 animate-spin" />
    </span>
  );
}
