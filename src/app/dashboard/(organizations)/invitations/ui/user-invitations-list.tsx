// import { DateTime } from 'luxon';

import { translation } from '@/app/i18n';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import prisma from '@/lib/prisma';

export default async function UserInvitationsList({ organizationId }: { organizationId: number }) {
  const { t } = await translation('es', 'invitations');
  console.log(organizationId)
  // const invitations = await prisma.invitation.findMany({
  //   where: {
  //     organizationId,
  //     acceptedAt: null,
  //     expiresAt: {
  //       gt: new Date(),
  //     },
  //   },
  //   include: {
  //     author: true,
  //   },
  //   orderBy: {
  //     createdAt: 'desc',
  //   },
  // });

  return (
    <>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('userInvitationsList.table.header.email')}</TableHead>
              <TableHead>{t('userInvitationsList.table.header.invitedBy')}</TableHead>
              <TableHead>{t('userInvitationsList.table.header.createdAt')}</TableHead>
              <TableHead>{t('userInvitationsList.table.header.expiresAt')}</TableHead>
            </TableRow>
          </TableHeader>
          {/* <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>{invitation.author.fullName}</TableCell>
                <TableCell>
                  {DateTime.fromJSDate(invitation.createdAt)
                    .setZone('America/Lima')
                    .toLocaleString(DateTime.DATETIME_MED)}
                </TableCell>
                <TableCell>
                  {DateTime.fromJSDate(invitation.expiresAt)
                    .setZone('America/Lima')
                    .toLocaleString(DateTime.DATETIME_MED)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody> */}
        </Table>
      </div>
      {/* <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='space-x-2'>
          <Button variant='outline'>Previous</Button>
          <Button variant='outline'>Next</Button>
        </div>
      </div> */}
    </>
  );
}
