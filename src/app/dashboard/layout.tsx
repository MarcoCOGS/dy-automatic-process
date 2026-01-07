import { SessionProvider } from 'next-auth/react';
import { ReactNode, Suspense } from 'react';

// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from '@/components/ui/breadcrumb';
import { AppSidebar } from '@/components/custom/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
// import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export type LayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function Layout({ children }: LayoutProps) {
  const session = await getSession();
  // console.log('aca' , session)
  if (!session) {
    return <div>Empty</div>;
  }

  // const organizationsUsers = await prisma.organizationUser.findMany({
  //   where: {
  //     userId: session.user.id,
  //   },
  //   include: {
  //     organization: true,
  //   },
  // });

  const organizations = [{ id: '1', name: 'moon', createdAt: new Date(), updatedAt: new Date() }];

  return (
    <SessionProvider>
      <SidebarProvider>
        <AppSidebar organizations={organizations} activeOrganizationId={session.organization.id} />
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
            <div className='flex items-center gap-2 px-4'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              {/* <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className='hidden md:block'>
                    <BreadcrumbLink href='#'>Building Your Application</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className='hidden md:block' />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb> */}
            </div>
          </header>
          <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
            {/* <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
              <div className='aspect-video rounded-xl bg-muted/50' />
              <div className='aspect-video rounded-xl bg-muted/50' />
              <div className='aspect-video rounded-xl bg-muted/50' />
            </div>
            <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' /> */}
            <div>
              <Suspense>{children}</Suspense>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
