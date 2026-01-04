'use server';

import argon2 from 'argon2';
import _ from 'lodash';
import { DateTime } from 'luxon';
import { z } from 'zod';

import { translation } from '@/app/i18n';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

export type ConfirmPasswordResetState = {
  errors?: {
    token?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  timestamp?: string;
  success?: boolean;
  rawData?: {
    password: string;
    confirmPassword: string;
  };
};

const ConfirmPasswordResetSchema = z
  .object({
    token: z.string().min(1, 'form.token.errors.required'),
    password: z
      .string()
      .min(1, 'form.password.errors.required')
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{8,32}$/, 'form.password.errors.format'),
    confirmPassword: z.string().min(1, 'form.confirmPassword.errors.required'),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'form.confirmPassword.errors.notMatch',
        path: ['confirmPassword'],
      });
    }
  });

export async function confirmPasswordReset(
  prevState: ConfirmPasswordResetState,
  formData: FormData,
): Promise<ConfirmPasswordResetState> {
  const { t } = await translation('es', 'confirm-password-reset');

  const rawData = {
    token: formData.get('token') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const validatedFields = ConfirmPasswordResetSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: _.mapValues(validatedFields.error.flatten().fieldErrors, (x) => x?.map((y) => t(y))),
      message: t('messages.emptyFields'),
      timestamp: DateTime.now().toISO(),
      rawData,
    };
  }

  const { token, password } = validatedFields.data;

  try {
    const userId = await redis.get(token);

    if (!userId) {
      return {
        success: false,
        message: t('messages.invalidToken'),
      };
    }

    await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: {
        password: await argon2.hash(password),
      },
    });

    await redis.del(token);

    return {
      success: true,
      message: t('messages.success'),
    };
  } catch (error) {
    console.log(error);

    return {
      message: t('messages.unknownError'),
      timestamp: DateTime.now().toISO(),
    };
  }
}
