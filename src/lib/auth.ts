import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export function hasRole(session: any, roles: string[]) {
  const role = session?.user?.role as string | undefined;
  return !!role && roles.includes(role);
}
