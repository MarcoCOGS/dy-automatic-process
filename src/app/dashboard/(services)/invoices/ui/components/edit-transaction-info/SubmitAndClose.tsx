'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useCallback } from 'react';

import { Button } from '@/components/ui/button';

import { updateTransactionInfoAction } from '../../../[code]/actions';
import { useInvoiceActionFeedback } from '../use-invoice-action-feedback';

export function SubmitAndClose({ code }: { code: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateTransactionInfoAction.bind(null, code), { ok: false });
  const closeModal = useCallback(() => router.back(), [router]);

  useInvoiceActionFeedback(state, closeModal);

  return (
    <div className='flex justify-end gap-3 pt-4'>
      <Button type='button' variant='secondary' onClick={() => router.back()} disabled={pending}>
        Cancelar
      </Button>

      <Button type='submit' className='w-[116px]' formAction={formAction} disabled={pending}>
        {pending ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  );
}
