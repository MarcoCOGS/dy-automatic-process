'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { nextDebugLog } from '@/lib/next-debug-log';

export function BackendRequestError({
  title = 'Error interno, contacte al administrador',
  description,
}: {
  title?: string;
  description: string;
}) {
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;

    nextDebugLog('backend-error-ui', 'backend-request-error:show', {
      title,
      description,
    });

    toast(title, {
      description,
    });
  }, [description, title]);

  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export function UnauthorizedSessionHandler() {
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    nextDebugLog('backend-error-ui', 'unauthorized-session:show-and-signout', {
      redirectTo: '/login?session=expired',
    });

    toast('Sesion expirada', {
      description: 'Vuelve a iniciar sesion para continuar.',
    });

    const timeoutId = window.setTimeout(() => {
      void signOut({ redirectTo: '/login?session=expired' });
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <Alert variant='destructive'>
      <Loader2 className='h-4 w-4 animate-spin' />
      <AlertTitle>Sesion expirada</AlertTitle>
      <AlertDescription>Cerrando sesion y regresando al inicio...</AlertDescription>
    </Alert>
  );
}
