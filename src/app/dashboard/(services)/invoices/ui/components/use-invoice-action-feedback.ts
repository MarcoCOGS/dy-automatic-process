'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type InvoiceActionState = {
  ok: boolean;
  error?: string;
  unauthorized?: boolean;
};

export function useInvoiceActionFeedback(state: InvoiceActionState, onSuccess: () => void) {
  useEffect(() => {
    if (state.ok) {
      onSuccess();
      return;
    }

    if (state.unauthorized) {
      toast('Sesion expirada', {
        description: state.error ?? 'Vuelve a iniciar sesion para continuar.',
      });
      void signOut({ redirectTo: '/login?session=expired' });
      return;
    }

    if (state.error) {
      toast('Error interno, contacte al administrador', {
        description: state.error,
      });
    }
  }, [onSuccess, state]);
}
