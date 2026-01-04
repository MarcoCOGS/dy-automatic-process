import _ from 'lodash';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// import prisma from '@/lib/prisma';

import { authConfig } from './auth.config';

declare module 'next-auth' {
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    orgId?: string;
  }
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      // address: string;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
      orgId?: string;
    } & DefaultSession['user'];
  }
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        console.log(credentials)
        // const user = await prisma.user.findUniqueOrThrow({
        //   where: {
        //     email: credentials.email as string,
        //   },
        //   include: {
        //     organizationsUsers: true,
        //   },
        // });

        const user = { id: 1, firstName: 'Moon', lastName: 'Global', email: 'n8nmoong@hotmail.com', organizationsUsers: [{ organizationId: 1 }] };

        return {
          id: user.id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          orgId: user.organizationsUsers[0].organizationId.toString(),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, trigger, user, session }) {
      if (trigger === 'update') {
        if (_.has(session, 'organizationId')) {
          token.orgId = (session.organizationId as number).toString();
        }
      }

      if (user) {
        token.id = user.id;
        token.orgId = user.orgId;
      }

      return token;
    },
    session({ session, token }) {
      console.log('aca t', token)
      session.user.id = token.id as string;
      session.user.orgId = String(token.orgId ?? '1');
      console.log('aca acasession ', session)
      return session;
    },
  },
});
