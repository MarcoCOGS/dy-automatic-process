'use client';

import { UserPlus } from 'lucide-react';
import Link from 'next/link';

import { useTranslation } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';

export function InviteUser() {
  const { t } = useTranslation('es', 'invitations');

  return (
    <Button variant='outline' asChild>
      <Link href='/dashboard/invitations/invite-user'>
        <UserPlus />
        {t('buttons.inviteUser')}
      </Link>
    </Button>
  );
}
