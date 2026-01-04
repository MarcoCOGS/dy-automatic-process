import Link from 'next/link';

export default function PageMessage(message: string, href = '/') {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-transparent p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link href={href} className='flex items-center gap-2 self-center font-medium'>
          {message}
        </Link>
      </div>
    </div>
  );
}
