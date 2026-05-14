'use server';

import _ from 'lodash';
import { DateTime } from 'luxon';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { z } from 'zod';

import { translation } from '@/app/i18n';
import { signIn } from '@/auth';

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

  try {
    await signIn('credentials', validatedFields.data);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError && error.type === 'CredentialsSignin') {
      return {
        message: t('messages.incorrectCredentials'),
        timestamp: DateTime.now().toISO(),
      };
    }

    return {
      message: t('messages.unknownError'),
      timestamp: DateTime.now().toISO(),
    };
  }

  return {};
}
