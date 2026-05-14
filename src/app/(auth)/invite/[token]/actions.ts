'use server';

// import { OrganizationUserStates, UserStates } from '@prisma/client';
// import argon2 from 'argon2';
// import { DateTime } from 'luxon';
import { findUserByEmail } from '@/lib/backend-api';

type Data = {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

export async function registerUser(data: Data) {
  if (data) {
    console.log('');
  }
  // const foundInvitation = await prisma.invitation.findUnique({
  //   where: {
  //     token: data.token,
  //   },
  // });

  // if (
  //   !foundInvitation ||
  //   DateTime.fromJSDate(foundInvitation.expiresAt) < DateTime.now() ||
  //   foundInvitation.acceptedAt
  // ) {
  //   return {
  //     success: false,
  //     message: 'Invalid invitation',
  //   };
  // }

  const foundUser = await findUserByEmail('foundInvitation.email');

  if (foundUser) {
    return {
      success: false,
      message: 'Invalid invitation',
    };
  } else {
    // const role = await prisma.role.findUniqueOrThrow({
    //   where: {
    //     name: 'partner',
    //   },
    // });
    // Invitation persistence is handled by the NestJS backend.
  }

  return {
    success: true,
    message: 'Invitation Accepted',
  };
}
