'use server';

// import { DateTime } from 'luxon';
// import { randomUUID } from 'node:crypto';

// import mail from '@/lib/mail';
import prisma from '@/lib/prisma';
// import { ServerConfig } from '@/lib/server-config';
import { getSession } from '@/lib/session';

export async function inviteUser(email: string): Promise<{ success: boolean; message: string }> {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      message: 'You must be logged in to invite a user.',
    };
  }

  const foundUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (foundUser) {
    // const isUserAlreadyInOrg = await prisma.organizationUser.findUnique({
    //   where: {
    //     organizationId_userId: {
    //       organizationId: session.organization.id,
    //       userId: foundUser.id,
    //     },
    //   },
    // });

    // if (isUserAlreadyInOrg) {
    //   return {
    //     success: false,
    //     message: 'User already registered',
    //   };
    // }
  }

  // const foundInvitation = await prisma.invitation.findFirst({
  //   where: {
  //     email,
  //     organizationId: session.organization.id,
  //     acceptedAt: null,
  //     expiresAt: {
  //       gt: new Date(),
  //     },
  //   },
  // });

  // if (foundInvitation) {
  //   return {
  //     success: false,
  //     message: 'An invitation already exists for this email.',
  //   };
  // }

  // const token = randomUUID();

  // const invitation = await prisma.invitation.create({
  //   data: {
  //     email: email.toLowerCase(),
  //     organizationId: session.organization.id,
  //     authorId: session.user.id,
  //     token,
  //     expiresAt: DateTime.now().plus({ days: 7 }).endOf('day').toJSDate(),
  //   },
  //   include: {
  //     organization: true,
  //   },
  // });

  // const actionUrl = `${ServerConfig.appUrl}/invite/${token}`;

  // await mail.send({
  //   to: email,
  //   from: ServerConfig.sendGridDefaultFrom,
  //   subject: `You've been invited to join ${invitation.organization.name}`,
  //   html: `
  //   <html>
  //     <head></head>
  //     <body>
  //       <p>Hello, you have been invited to join ${invitation.organization.name}.</p>
  //       <p>Click on the button below accept your invitation.</p>
  //       <p>
  //         <a class="btn" href="${actionUrl}" target="_blank" rel="noopener">Accept invitation</a>
  //       </p>
  //       <p>
  //         Thanks,<br/>
  //         ${ServerConfig.appName} team
  //       </p>
  //     </body>
  //   </html>
  //   `,
  // });

  return {
    success: true,
    message: 'Invitation Sent!',
  };
}
