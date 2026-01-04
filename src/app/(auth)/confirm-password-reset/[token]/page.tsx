'use client';

import { CircleCheckIcon, Loader2, RotateCcwIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { P, match } from 'ts-pattern';

import { useTranslation } from '@/app/i18n/client';
import PasswordChecklist from '@/components/custom/password-checklist';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { ConfirmPasswordResetState, confirmPasswordReset } from './../actions';

export default function Page() {
  const { t } = useTranslation('es', 'confirm-password-reset');
  const initialState: ConfirmPasswordResetState = { errors: {}, message: null };
  const [state, formAction, pending] = useActionState(confirmPasswordReset, initialState);
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
            <input type='hidden' name='token' value={token} />
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='password'>{t('form.password.label')}</Label>
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
                className={state.errors?.password ? 'border-destructive' : ''}
                defaultValue={state.rawData?.password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {state.errors?.password?.map((error, index) => (
                <p key={index} className='text-[0.8rem] font-medium text-destructive'>
                  {error}
                </p>
              ))}
            </div>
            <div className='grid gap-2'>
              <div className='flex items-center'>
                <Label htmlFor='confirmPassword'>{t('form.confirmPassword.label')}</Label>
              </div>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                placeholder={t('form.confirmPassword.placeholder')}
                autoComplete='off'
                autoFocus={false}
                maxLength={32}
                disabled={pending}
                className={state.errors?.confirmPassword ? 'border-destructive' : ''}
                defaultValue={state.rawData?.confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {state.errors?.confirmPassword?.map((error, index) => (
                <p key={index} className='text-[0.8rem] font-medium text-destructive'>
                  {error}
                </p>
              ))}
            </div>
            <PasswordChecklist
              rules={['minLength', 'maxLength', 'capital', 'lowercase', 'number', 'specialChar', 'match']}
              minLength={8}
              maxLength={32}
              value={password}
              valueAgain={confirmPassword}
              messages={{
                minLength: t('form.password.checklist.minLength'),
                maxLength: t('form.password.checklist.maxLength'),
                capital: t('form.password.checklist.capital'),
                lowercase: t('form.password.checklist.lowercase'),
                number: t('form.password.checklist.number'),
                specialChar: t('form.password.checklist.specialChar'),
                match: t('form.password.checklist.match'),
              }}
              iconComponents={{
                ValidIcon: (
                  <div className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-green-500 dark:text-green-200'>
                    <CircleCheckIcon className='h-5 w-5' />
                  </div>
                ),
                InvalidIcon: (
                  <div className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 dark:text-gray-200'>
                    <CircleCheckIcon className='h-5 w-5' />
                  </div>
                ),
              }}
            />
            <Button disabled={pending} type='submit'>
              {pending && <Loader2 className='h-5 w-5 animate-spin' />}
              <RotateCcwIcon className='h-5 w-5' />
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
