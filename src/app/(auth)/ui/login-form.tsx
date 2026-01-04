'use client';

import { Loader2 } from 'lucide-react';
import Form from 'next/form';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { useTranslation } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { LoginState, login } from '../login/actions';

export default function LoginForm() {
  const { t } = useTranslation('es', 'login');
  const initialState: LoginState = {
    errors: {},
    message: null,
  };
  const [state, formAction, pending] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

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
      <Form action={formAction} className='grid gap-4'>
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='email'>{t('form.email.label')}</Label>
          </div>
          <Input
            id='email'
            name='email'
            type='email'
            placeholder={t('form.email.placeholder')}
            autoComplete='off'
            autoFocus={true}
            maxLength={100}
            disabled={pending}
            tabIndex={1}
            className={state.errors?.email ? 'border-destructive' : ''}
            defaultValue={state.rawData?.email}
          />
          {state.errors?.email?.map((error, index) => (
            <p key={index} className='text-[0.8rem] font-medium text-destructive'>
              {error}
            </p>
          ))}
        </div>
        <div className='grid gap-2'>
          <div className='flex items-center'>
            <Label htmlFor='password'>{t('form.password.label')}</Label>
            <Link tabIndex={4} href='/request-password-reset' className='ml-auto inline-block text-sm underline'>
              {t('links.requestPasswordReset')}
            </Link>
          </div>
          <Input
            id='password'
            name='password'
            type='password'
            placeholder={t('form.password.placeholder')}
            autoComplete='off'
            autoFocus={false}
            maxLength={32}
            disabled={pending}
            tabIndex={2}
            className={state.errors?.password ? 'border-destructive' : ''}
            defaultValue={state.rawData?.password}
          />
          {state.errors?.password?.map((error, index) => (
            <p key={index} className='text-[0.8rem] font-medium text-destructive'>
              {error}
            </p>
          ))}
        </div>
        <input type='hidden' name='redirectTo' value={callbackUrl} />
        <Button disabled={pending} type='submit' tabIndex={3}>
          {pending && <Loader2 className='h-5 w-5 animate-spin' />}
          {t('form.submit')}
        </Button>
      </Form>
    </>
  );
}
