import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (credentials?.password === process.env.ADMIN_PASSWORD) {
          return { id: '1', name: 'Admin' };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/admin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/** Renvoie une réponse 401 si aucune session admin n'est active, sinon null. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  return null;
}
