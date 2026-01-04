'use server';

import { OrganizationUserStates, UserStates } from '@prisma/client';
import argon2 from 'argon2';
import { DateTime } from 'luxon';

import prisma from '@/lib/prisma';

type Data = {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

export async function registerUser(data: Data) {
  const foundInvitation = await prisma.invitation.findUnique({
    where: {
      token: data.token,
    },
  });

  if (
    !foundInvitation ||
    DateTime.fromJSDate(foundInvitation.expiresAt) < DateTime.now() ||
    foundInvitation.acceptedAt
  ) {
    return {
      success: false,
      message: 'Invalid invitation',
    };
  }

  const foundUser = await prisma.user.findUnique({
    where: {
      email: foundInvitation.email,
    },
  });

  if (foundUser) {
    return {
      success: false,
      message: 'Invalid invitation',
    };
  } else {
    const role = await prisma.role.findUniqueOrThrow({
      where: {
        name: 'partner',
      },
    });

    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: foundInvitation.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: await argon2.hash(data.password),
          state: UserStates.ACTIVE,
          organizationsUsers: {
            create: {
              organizationId: foundInvitation.organizationId,
              roleId: role.id,
              state: OrganizationUserStates.ACTIVE,
            },
          },
        },
      }),
      prisma.invitation.update({
        where: {
          id: foundInvitation.id,
        },
        data: {
          acceptedAt: new Date(),
        },
      }),
    ]);
  }

  return {
    success: true,
    message: 'Invitation Accepted',
  };
}
