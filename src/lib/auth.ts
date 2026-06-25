import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-secret',
    }),
    CredentialsProvider({
      name: 'Demo Admin',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@talenan.local" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple demo credentials: admin@talenan.local / admin123
        if (credentials?.email === 'admin@talenan.local' && credentials?.password === 'admin123') {
          return {
            id: 'demo-admin-id',
            name: 'Demo HR Admin',
            email: 'admin@talenan.local',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };
        }
        
        // Also look up in DB if User is populated
        if (credentials?.email) {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          if (user) {
            return {
              id: user.id,
              name: user.name || 'HR Admin',
              email: user.email,
              image: user.image
            };
          }
        }
        
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.name = token.name;
        session.user.email = token.email;
        // Add custom fields if needed
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // Auto-register user into database if using Google
      if (account?.provider === 'google' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || profile?.name || 'Google User',
              image: user.image || profile?.image || null,
            }
          });
        }
      }
      return true;
    }
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
