import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { getUsers } from '@/lib/data';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const demoPassword = process.env.DEMO_PASSWORD || 'demo';
        if (credentials.password !== demoPassword) return null;

        const users = await getUsers();
        const usernameLc = credentials.username.trim().toLowerCase();
        const match = users.find(
          (u) => u.id.toLowerCase() === usernameLc || u.name.toLowerCase() === usernameLc
        );
        if (!match) return null;

        return {
          id: match.id,
          name: match.name,
          role: match.role as any,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
