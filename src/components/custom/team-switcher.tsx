'use client';

import { ChevronsUpDown, Plus } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useTransition } from 'react';

import { useTranslation } from '@/app/i18n/client';
import { Backdrop } from '@/components/ui/backdrop';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

export function TeamSwitcher({
  teams,
  activeTeamId,
}: {
  teams: {
    id: number;
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
  activeTeamId: number;
}) {
  const { t } = useTranslation('es');
  const { isMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const activeTeam = teams.find((team) => team.id === activeTeamId)!;
  const { update: sessionUpdate } = useSession();

  function handleChange(teamId: number) {
    if (activeTeamId === teamId) return;

    startTransition(async () => {
      await sessionUpdate({
        organizationId: teamId,
      });

      router.push('/dashboard');
      router.refresh();
    });
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <activeTeam.logo className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{activeTeam.name}</span>
                  <span className='truncate text-xs'>{activeTeam.plan}</span>
                </div>
                <ChevronsUpDown className='ml-auto' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              align='start'
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className='text-xs text-muted-foreground'>{t('organization')}</DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem key={team.name} onClick={() => handleChange(team.id)} className='gap-2 p-2'>
                  <div className='flex size-6 items-center justify-center rounded-sm border'>
                    <team.logo className='size-4 shrink-0' />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className='gap-2 p-2'>
                <div className='flex size-6 items-center justify-center rounded-md border bg-background'>
                  <Plus className='size-4' />
                </div>
                <div className='font-medium text-muted-foreground'>{t('addOrganization')}</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <Backdrop open={isPending} variant='blur'>
        <div className='animate-pulse'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      </Backdrop>
    </>
  );
}
