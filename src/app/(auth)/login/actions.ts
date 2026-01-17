'use server';

enum UserStates {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DELETED = 'deleted',
  DISABLED = 'disabled',
  NOT_VERIFIED = 'not_verified',
}
// import argon2 from 'argon2';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { z } from 'zod';

import { translation } from '@/app/i18n';
import { signIn } from '@/auth';
// import prisma from '@/lib/prisma';

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    redirectTo?: string[];
  };
  message?: string | null;
  timestamp?: string;
  rawData?: {
    email: string;
    password: string;
    redirectTo: string;
  };
};

const LoginSchema = z.object({
  email: z.string().min(2, 'form.email.errors.required').max(100, 'form.email.errors.max'),
  password: z.string().min(2, 'form.password.errors.required').max(32, 'form.password.errors.max'),
  redirectTo: z.string(),
});

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const { t } = await translation('es', 'login');

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    redirectTo: formData.get('redirectTo') as string,
  };

  const validatedFields = LoginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: _.mapValues(validatedFields.error.flatten().fieldErrors, (x) => x?.map((y) => t(y))),
      message: t('messages.emptyFields'),
      timestamp: DateTime.now().toISO(),
      rawData,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    // const user = await prisma.user.findUnique({
    const user: {state: UserStates, lockedAt: Date | null, failedAttempts: number, reason: null } | null = password === 'n8nmoong' && email === 'n8nmoonglobal@gmail.com'
    ? {state: UserStates.ACTIVE, failedAttempts: 0, reason: null, lockedAt: null} : null;

    if (!user) {
      return {
        message: t('messages.incorrectCredentials'),
        timestamp: DateTime.now().toISO(),
      };
    }

    if (user.state === UserStates.NOT_VERIFIED) {
      return {
        message: t('messages.userNotVerified'),
        timestamp: DateTime.now().toISO(),
      };
    }

    if (user.state === UserStates.DISABLED) {
      return {
        message: t('messages.userDisabled'),
        timestamp: DateTime.now().toISO(),
      };
    }

    // if (user.state === UserStates.LOCKED) {
    //   const lockDuration = Math.trunc(DateTime.fromJSDate(user.lockedAt!).diffNow('minutes').minutes);

    //   if (lockDuration > 0) {
    //     return {
    //       message: t('messages.userLocked', { lockDuration }),
    //       timestamp: DateTime.now().toISO(),
    //     };
    //   } else {
    //     await prisma.user.update({
    //       where: {
    //         id: user.id,
    //       },
    //       data: {
    //         state: UserStates.ACTIVE,
    //         failedAttempts: 0,
    //         reason: null,
    //         lockedAt: null,
    //       },
    //     });
    //   }
    // }

    // const passwordMatch = await argon2.verify(user.password, password);

    // if (!passwordMatch) {
    //   const { failedAttempts } = await prisma.user.update({
    //     where: {
    //       id: user.id,
    //     },
    //     data: {
    //       failedAttempts: {
    //         increment: 1,
    //       },
    //     },
    //     select: {
    //       failedAttempts: true,
    //     },
    //   });

    //   if (failedAttempts >= 3) {
    //     await prisma.user.update({
    //       where: {
    //         id: user.id,
    //       },
    //       data: {
    //         state: UserStates.LOCKED,
    //         reason: 'TOO_MANY_ATTEMPTS',
    //         lockedAt: DateTime.now().plus({ minutes: 15 }).toJSDate(),
    //       },
    //     });

    //     return {
    //       message: t('messages.tooManyAttempts'),
    //       timestamp: DateTime.now().toISO(),
    //     };
    //   }

    //   return {
    //     message: t('messages.incorrectCredentials'),
    //     timestamp: DateTime.now().toISO(),
    //   };
    // }

    // await prisma.user.update({
    //   where: {
    //     id: user.id,
    //   },
    //   data: {
    //     failedAttempts: 0,
    //   },
    // });

    await signIn('credentials', validatedFields.data);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.log(error);

    return {
      message: t('messages.unknownError'),
      timestamp: DateTime.now().toISO(),
    };
  }

  return {};
}
