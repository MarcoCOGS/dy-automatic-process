'use client';

import type { Organization } from '@prisma/client';
import { FileCheck2, FlaskConical, GalleryVerticalEnd, Link, MailPlus, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';

// import { useTranslation } from '@/app/i18n/client';
import { NavProjects } from '@/components/custom/nav-projects';
import { NavUser } from '@/components/custom/nav-user';
import { TeamSwitcher } from '@/components/custom/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

export function AppSidebar({
  organizations,
  activeOrganizationId,
}: {
  organizations: Organization[];
  activeOrganizationId: number;
}) {
  // const { t } = useTranslation('es');
  const { data: session } = useSession();

  const teams = organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
  }));

  const services = [
    {
      name: 'Procesar Partidas',
      url: '/dashboard/verifications',
      icon: FileCheck2,
    },
    {
      name: 'Historial',
      url: '/dashboard/url-shortener',
      icon: Link,
    },
    {
      name: 'Demo',
      url: '/dashboard/demo',
      icon: FlaskConical,
    },
  ];

  const projects = [
    {
      name: 'Usuarios',
      url: '/dashboard/users',
      icon: Users,
    },
    {
      name: 'Invitaciones',
      url: '/dashboard/invitations',
      icon: MailPlus,
    },
  ];

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <TeamSwitcher teams={teams} activeTeamId={activeOrganizationId} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects title='Servicios' projects={services} />
        <NavProjects title='Organización' projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: session?.user?.name ?? '', email: session?.user?.email ?? '', avatar: '' }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
