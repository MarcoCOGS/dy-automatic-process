'use server';

import _ from 'lodash';
import { DateTime } from 'luxon';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { translation } from '@/app/i18n';
import mail from '@/lib/mail';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import { ServerConfig } from '@/lib/server-config';

export type RequestPasswordResetState = {
  errors?: {
    email?: string[];
  };
  message?: string | null;
  timestamp?: string;
  success?: boolean;
  rawData?: {
    email: string;
  };
};

const RequestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'form.email.errors.required')
    .max(50, 'form.email.errors.max')
    .email('form.email.errors.format'),
});

export async function requestPasswordReset(
  prevState: RequestPasswordResetState,
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const { t } = await translation('es', 'request-password-reset');

  const rawData = {
    email: formData.get('email') as string,
  };

  const validatedFields = RequestPasswordResetSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: _.mapValues(validatedFields.error.flatten().fieldErrors, (x) => x?.map((y) => t(y))),
      message: t('messages.emptyFields'),
      timestamp: DateTime.now().toISO(),
      rawData,
    };
  }

  const { email } = validatedFields.data;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      const token = randomUUID();
      const actionUrl = `${ServerConfig.appUrl}/confirm-password-reset/${token}`;

      await redis.set(token, user.id, 'EX', 60 * 60);

      await mail.send({
        to: email,
        from: ServerConfig.sendGridDefaultFrom,
        subject: `Reset your ${ServerConfig.appName} password`,
        html: `
        <html>
          <head></head>
          <body>
            <p>Hello,</p>
            <p>Click on the button below to reset your password.</p>
            <p>
              <a class="btn" href="${actionUrl}" target="_blank" rel="noopener">Reset password</a>
            </p>
            <p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>
            <p>
              Thanks,<br/>
              ${ServerConfig.appName} team
            </p>
          </body>
        </html>
        `,
      });
    }

    return {
      success: true,
      message: t('messages.success', { email }),
    };
  } catch (error) {
    console.log(error);

    return {
      message: t('messages.unknownError'),
      timestamp: DateTime.now().toISO(),
    };
  }
}
