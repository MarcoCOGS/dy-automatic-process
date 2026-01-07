// import { UserStates } from '@prisma/client';
import Link from 'next/link';

import { translation } from '@/app/i18n';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
// import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

export type PageProps = Readonly<{
  params: Promise<{
    token: string;
  }>;
}>;

export default async function Page(props: PageProps) {
  const { t } = await translation('es', 'confirm-verification');
  const { token } = await props.params;

  let result: 'success' | 'failure' = 'failure';

  try {
    const userId = await redis.get(token);

    if (!userId) {
      throw new Error('Invalid token');
    }

    // await prisma.user.update({
    //   where: {
    //     id: parseInt(userId),
    //   },
    //   data: {
    //     state: UserStates.ACTIVE,
    //   },
    // });

    result = 'success';
  } catch (error) {
    console.log({ error: (error as Error).message });
  }

  return (
    <>
      <div className='grid gap-2 text-center'>
        <h1 className='text-3xl font-bold'>{t('title')}</h1>
        {/* <p className='text-balance text-muted-foreground'>{t('description')}</p> */}
      </div>
      <div className='grid gap-4'>
        <Alert variant={result === 'success' ? 'default' : 'destructive'}>
          <AlertDescription className='text-center'>{t(`messages.${result}`)}</AlertDescription>
        </Alert>
        <Button variant='link' asChild>
          <Link href='/login'>{t('links.backToLogin')}</Link>
        </Button>
      </div>
    </>
  );
}
