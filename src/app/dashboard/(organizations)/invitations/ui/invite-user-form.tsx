'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslation } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { tryCatch } from '@/lib/try-catch';

import { inviteUser } from '../invite-user/actions';

const formSchema = z.object({
  email: z.string().email(),
});

export default function InviteUserForm() {
  const { t } = useTranslation('es', 'invitations');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit({ email }: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const response = await tryCatch(inviteUser(email));

      if (response.error) {
        toast('Uh oh! Something went wrong.', {
          description: response.error.message,
        });
      } else {
        toast('Notice', {
          description: response.data.message,
        });

        form.reset();
      }
    });
  }

  return (
    <div className='h-full flex-1 flex-col space-y-8 p-8 md:flex'>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{t('inviteUserForm.title')}</h2>
          <p className='text-muted-foreground'>{t('inviteUserForm.description')}</p>
        </div>
      </div>
      <div className='space-y-4'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inviteUserForm.form.email.label')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('inviteUserForm.form.email.placeholder')} autoComplete='off' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='space-x-2'>
              <Button disabled={isPending} type='submit'>
                {isPending && <Loader2 className='h-5 w-5 animate-spin' />}
                {t('inviteUserForm.form.submit')}
              </Button>
              <Button variant='secondary' asChild>
                <Link href='/dashboard/invitations'>{t('buttons.back')}</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
