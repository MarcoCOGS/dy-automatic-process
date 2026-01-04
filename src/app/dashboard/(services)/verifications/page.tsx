import { translation } from '@/app/i18n';
import { ability } from '@/lib/abilities';
import { getSession } from '@/lib/session';

import { DownloadVerifications } from './ui/buttons';
import RequestVerifications from './ui/request-verifications';
import VerificationList from './ui/verification-list';

export default async function Page() {
  const { t } = await translation('es', 'verifications');

  const session = await getSession();

  if (!session) {
    return <div>Empty</div>;
  }

  const abilities = await ability(session.role.id);

  return (
    <div className='h-full flex-1 flex-col space-y-8 p-8 md:flex'>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{t('verificationList.title')}</h2>
          <p className='text-muted-foreground'>{t('verificationList.description')}</p>
        </div>
        <div className='flex items-center space-x-2'>{/* <UserNav /> */}</div>
      </div>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex space-x-2'>
            {abilities.can('create-many', 'verifications') && <RequestVerifications />}
            {abilities.can('download', 'verifications') && <DownloadVerifications />}
          </div>
        </div>
        <VerificationList userId={session.user.id} roleId={session.role.id} organizationId={session.organization.id} />
      </div>
    </div>
  );
}
