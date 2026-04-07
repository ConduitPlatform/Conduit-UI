'use client';

import { useState, useEffect } from 'react';

type OS = 'mac' | 'windows' | 'linux';

export function useOS(): OS {
  const [os, setOS] = useState<OS>('mac');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) {
      setOS('mac');
    } else if (ua.includes('win')) {
      setOS('windows');
    } else {
      setOS('linux');
    }
  }, []);

  return os;
}

export function useModKey(): string {
  const os = useOS();
  return os === 'mac' ? '⌘' : 'Ctrl';
}
