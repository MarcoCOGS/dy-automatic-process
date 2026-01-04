'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheckIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/app/i18n/client';
import PasswordChecklist from '@/components/custom/password-checklist';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { tryCatch } from '@/lib/try-catch';

import { registerUser } from '../[token]/actions';

export default function RegisterUserForm() {
  const { t } = useTranslation('es', 'invitations');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { token } = useParams<{ token: string }>();

  const formSchema = z
    .object({
      firstName: z
        .string()
        .min(1, t('registerUserForm.form.firstName.errors.required'))
        .max(100, t('registerUserForm.form.firstName.errors.max')),
      lastName: z
        .string()
        .min(1, t('registerUserForm.form.lastName.errors.required'))
        .max(100, t('registerUserForm.form.lastName.errors.max')),
      password: z
        .string()
        .min(8, t('registerUserForm.form.password.errors.required'))
        .max(36, t('registerUserForm.form.password.errors.max'))
        .regex(
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{8,32}$/,
          t('registerUserForm.form.password.errors.format'),
        ),
      confirmPassword: z
        .string()
        .min(8, t('registerUserForm.form.confirmPassword.errors.required'))
        .max(36, t('registerUserForm.form.confirmPassword.errors.max')),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: t('registerUserForm.form.confirmPassword.errors.notMatch'),
          path: ['confirmPassword'],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');
  const confirmPassword = form.watch('confirmPassword');

  function onSubmit(data: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const response = await tryCatch(
        registerUser({
          ...data,
          token,
        }),
      );

      if (response.error) {
        toast('Uh oh! Something went wrong.', {
          description: response.error.message,
        });
      } else {
        toast('Notice', {
          description: response.data.message,
        });

        router.push('/dashboard');
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className='grid gap-2 text-center'>
        <h1 className='text-3xl font-bold'>{t('registerUserForm.title')}</h1>
        <p className='text-balance text-muted-foreground'>{t('registerUserForm.description')}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('registerUserForm.form.firstName.label')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('registerUserForm.form.firstName.placeholder')} autoComplete='off' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('registerUserForm.form.lastName.label')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('registerUserForm.form.lastName.placeholder')} autoComplete='off' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('registerUserForm.form.password.label')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('registerUserForm.form.password.placeholder')}
                    autoComplete='off'
                    type='password'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('registerUserForm.form.confirmPassword.label')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('registerUserForm.form.confirmPassword.placeholder')}
                    autoComplete='off'
                    type='password'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <PasswordChecklist
            rules={['minLength', 'maxLength', 'capital', 'lowercase', 'number', 'specialChar', 'match']}
            minLength={8}
            maxLength={32}
            value={password}
            valueAgain={confirmPassword}
            messages={{
              minLength: t('registerUserForm.form.password.checklist.minLength'),
              maxLength: t('registerUserForm.form.password.checklist.maxLength'),
              capital: t('registerUserForm.form.password.checklist.capital'),
              lowercase: t('registerUserForm.form.password.checklist.lowercase'),
              number: t('registerUserForm.form.password.checklist.number'),
              specialChar: t('registerUserForm.form.password.checklist.specialChar'),
              match: t('registerUserForm.form.password.checklist.match'),
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
          <Button disabled={isPending} type='submit' className='w-full'>
            {isPending && <Loader2 className='h-5 w-5 animate-spin' />}
            {t('registerUserForm.form.submit')}
          </Button>
          <Button variant='link' asChild className='w-full'>
            <Link href='/login'>{t('links.backToLogin')}</Link>
          </Button>
        </form>
      </Form>
    </>
  );
}
