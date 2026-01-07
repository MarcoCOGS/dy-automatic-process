import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    result: {
      user: {
        fullName: {
          needs: {
            firstName: true as never,
            lastName: true as never,
          },
          compute(user: { firstName: string; lastName: string }) {
            return user.firstName + ' ' + user.lastName;
          },
        },
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
