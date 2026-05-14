'use client';

import { Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { generateSignedGetUrlAction } from '../actions';

export default function OpenFile({ label, fileKey, bucket }: { label: string; fileKey: string; bucket: string }) {
  const [pending, setPending] = useState(false);

  async function openFile() {
    setPending(true);

    try {
      const response = await generateSignedGetUrlAction({ key: fileKey, bucket });

      if (response.unauthorized) {
        toast('Sesion expirada', {
          description: response.message,
        });
        void signOut({ redirectTo: '/login?session=expired' });
        return;
      }

      if (!response.success || !response.url) {
        toast('Error interno, contacte al administrador', {
          description: response.message,
        });
        return;
      }

      window.open(response.url, '_blank');
    } catch (error) {
      toast('Error interno, contacte al administrador', {
        description: error instanceof Error ? error.message : 'Error al abrir el archivo.',
      });
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
