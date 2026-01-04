'use client';

import { Loader2, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { P, match } from 'ts-pattern';

import { useTranslation } from '@/app/i18n/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { RequestPasswordResetState, requestPasswordReset } from './actions';

export default function Page() {
  const { t } = useTranslation('es', 'request-password-reset');
  const initialState: RequestPasswordResetState = { errors: {}, message: null };
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  useEffect(() => {
    if (state.timestamp) {
      toast('Uh oh! Something went wrong.', {
        description: state.message,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timestamp, toast]);

  return (
    <>
      <div className='grid gap-2 text-center'>
        <h1 className='text-3xl font-bold'>{t('title')}</h1>
        <p className='text-balance text-muted-foreground'>{t('description')}</p>
      </div>
      {match(state)
        .with({ success: P.nonNullable }, () => (
          <Alert variant={state.success ? 'default' : 'destructive'}>
            <AlertDescription className='text-center'>{state.message}</AlertDescription>
          </Alert>
        ))
        .otherwise(() => (
          <form action={formAction} className='grid gap-4'>
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='email'>{t('form.email.label')}</Label>
              </div>
              <Input
                id='email'
                name='email'
                type='text'
                placeholder={t('form.email.placeholder')}
                autoComplete='off'
                autoFocus={false}
                maxLength={50}
                disabled={pending}
                className={state.errors?.email ? 'border-destructive' : ''}
                defaultValue={state.rawData?.email}
              />
              {state.errors?.email?.map((error, index) => (
                <p key={index} className='text-[0.8rem] font-medium text-destructive'>
                  {error}
                </p>
              ))}
            </div>
            <Button disabled={pending} type='submit'>
              {pending && <Loader2 className='h-5 w-5 animate-spin' />}
              <SendIcon className='h-5 w-5' />
              {t('form.submit')}
            </Button>
          </form>
        ))}
      <Button variant='link' asChild>
        <Link href='/login'>{t('links.backToLogin')}</Link>
      </Button>
    </>
  );
}
