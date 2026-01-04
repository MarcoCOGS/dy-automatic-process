import { translation } from '@/app/i18n';
import { getSession } from '@/lib/session';

import UserList from './ui/user-list';

export default async function Page() {
  const { t } = await translation('es', 'users');

  const session = await getSession();

  if (!session) {
    return <div>Empty</div>;
  }

  return (
    <div className='h-full flex-1 flex-col space-y-8 p-8 md:flex'>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{t('userList.title')}</h2>
          <p className='text-muted-foreground'>{t('userList.description')}</p>
        </div>
        <div className='flex items-center space-x-2'>{/* <UserNav /> */}</div>
      </div>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex space-x-2'>{/* Empty */}</div>
        </div>
        <UserList organizationId={session.organization.id} />
      </div>
    </div>
  );
}
