import { Suspense } from 'react';

import LoginForm from '@/app/(auth)/ui/login-form';

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
