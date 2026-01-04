import { Suspense } from 'react';

import InviteUserForm from '../ui/invite-user-form';

export default function Page() {
  return (
    <Suspense>
      <InviteUserForm />
    </Suspense>
  );
}
