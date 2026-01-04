'use client';

import type { Ref } from 'react';

import { logout } from '@/app/dashboard/actions';

export default function Logout({ ref }: { ref: Ref<HTMLFormElement> }) {
  return <form ref={ref} action={logout} />;
}
