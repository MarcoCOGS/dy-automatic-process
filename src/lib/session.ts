'use server';

import { auth } from '@/auth';

// import prisma from './prisma';

export async function getSession() {
  const session = await auth();
  // console.log('aca session', session)

  const userId = session?.user?.id;
  const orgId = session?.user?.orgId;

  if (!userId || !orgId) {
    return undefined;
  }

  const user = { id: 1, firstName: 'Moon', lastName: 'Global', email: 'n8nmoong@hotmail.com', organizationsUsers: [{ organizationId: 1, roleId: 1 }] };

  // const user = await prisma.user.findUnique({
  //   where: {
  //     id: parseInt(userId),
  //   },
  //   include: {
  //     organizationsUsers: {
  //       where: {
  //         organizationId: parseInt(orgId),
  //       },
  //     },
  //   },
  // });
  // console.log('acaaaaa')
  if (!user) {
    // console.log('aca ddd')
    return null;
  }
  // console.log('aca 1',  {
  //   user: { id: user.id },
  //   organization: { id: user.organizationsUsers[0].organizationId },
  //   role: { id: user.organizationsUsers[0].roleId },
  // })
  return {
    user: { id: user.id },
    organization: { id: user.organizationsUsers[0].organizationId },
    role: { id: user.organizationsUsers[0].roleId },
  };
}
