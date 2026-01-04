'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { generateSignedGetUrl } from '../lib/api';

export default function OpenFile({ label, fileKey, bucket }: { label: string; fileKey: string; bucket: string }) {
  const [pending, setPending] = useState(false);

  async function openFile() {
    setPending(true);

    try {
      const signedGetUrl = await generateSignedGetUrl({ key: fileKey, bucket });

      window.open(signedGetUrl.url, '_blank');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className='grid gap-2'>
      <Button type='button' variant='outline' disabled={pending} onClick={() => openFile()}>
        {pending && <Loader2 className='h-5 w-5 animate-spin' />}
        {label}
      </Button>
    </div>
  );
}
