'use server';

import { defineAbility } from '@casl/ability';

// import prisma from './prisma';

export const ability = async (roleId: number) => {
  // const records = await prisma.role.findMany({
  //   where: {
  //     id: roleId,
  //   },
  //   include: {
  //     rolesPermissions: {
  //       include: {
  //         permission: {
  //           include: {
  //             object: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // });
  const records = [
    {
      id: 1,
      rolesPermissions: [
        {
          id: 1,
          permission: {
            id: 1,
            action: 'create-many',
            object: {
              id: 1,
              name: 'verifications',
            },
          },
        },
        {
          id: 2,
          permission: {
            id: 1,
            action: 'download',
            object: {
              id: 1,
              name: 'verifications',
            },
          },
        },
      ],
    }]

  return defineAbility((can) => {
    records.forEach((record) => {
      record.rolesPermissions.forEach((rolePermission) => {
        can(rolePermission.permission.action, rolePermission.permission.object.name);
      });
    });
  });
};
