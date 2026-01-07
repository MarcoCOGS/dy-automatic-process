// import { OrganizationUserStates } from '@prisma/client';
// import { DateTime } from 'luxon';

import PageMessage from '@/components/custom/page-message';
import prisma from '@/lib/prisma';

import RegisterUserForm from '../ui/register-user-form';

export default async function Page() {
  // const { token } = await props.params;

  // const foundInvitation = await prisma.invitation.findUnique({
  //   where: {
  //     token,
  //   },
  // });

  // if (
  //   !foundInvitation ||
  //   DateTime.fromJSDate(foundInvitation.expiresAt) < DateTime.now() ||
  //   foundInvitation.acceptedAt
  // ) {
  //   return PageMessage('Invalid invitation');
  // }

  const foundUser = await prisma.user.findUnique({
    where: {
      email: 'foundInvitation.email',
    },
  });

  if (foundUser) {
    // const isUserAlreadyInOrg = await prisma.organizationUser.findUnique({
    //   where: {
    //     organizationId_userId: {
    //       organizationId: foundInvitation.organizationId,
    //       userId: foundUser.id,
    //     },
    //   },
    // });

    // if (isUserAlreadyInOrg) {
    //   return PageMessage('User already registered', '/login');
    // }

    // const role = await prisma.role.findUniqueOrThrow({
    //   where: {
    //     name: 'partner',
    //   },
    // });

    // await prisma.$transaction([
    //   prisma.organizationUser.create({
    //     data: {
    //       organizationId: foundInvitation.organizationId,
    //       userId: foundUser.id,
    //       roleId: role.id,
    //       state: OrganizationUserStates.ACTIVE,
    //     },
    //   }),
    //   prisma.invitation.update({
    //     where: {
    //       id: foundInvitation.id,
    //     },
    //     data: {
    //       acceptedAt: new Date(),
    //     },
    //   }),
    // ]);

    return PageMessage('Invitation accepted', '/login');
  }

  return <RegisterUserForm />;
}
