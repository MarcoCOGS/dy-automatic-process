import { ReactNode } from 'react';

export type LayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function Layout({ children }: LayoutProps) {
  return (
    <div className='w-full lg:grid lg:min-h-[600px] lg:grid-cols-1 xl:min-h-[800px]'>
      <div className='flex items-center justify-center py-12'>
        <div className='mx-auto grid w-[350px] gap-6'>{children}</div>
      </div>
    </div>
  );
}
