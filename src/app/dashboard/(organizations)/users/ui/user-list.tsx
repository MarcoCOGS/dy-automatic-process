import { translation } from '@/app/i18n';
// import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import prisma from '@/lib/prisma';

export default async function ViewUsers({ organizationId }: { organizationId: number }) {
  const { t } = await translation('es', 'users');
  console.log(organizationId)
  // const users = await prisma.user.findMany({
  //   where: {
  //     organizationsUsers: {
  //       some: {
  //         organizationId,
  //       },
  //     },
  //   },
  //   select: {
  //     id: true,
  //     email: true,
  //     firstName: true,
  //     lastName: true,
  //     organizationsUsers: {
  //       select: {
  //         state: true,
  //       },
  //     },
  //   },
  // });

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('userList.table.header.email')}</TableHead>
            <TableHead>{t('userList.table.header.firstName')}</TableHead>
            <TableHead>{t('userList.table.header.lastName')}</TableHead>
            <TableHead>{t('userList.table.header.state')}</TableHead>
          </TableRow>
        </TableHeader>
        {/* <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>
                <Badge variant='secondary'>{t(`userStates.${user.organizationsUsers[0].state}`)}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody> */}
      </Table>
    </div>
  );
}
