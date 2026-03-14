import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

/**
 * NextAuth Configuration: FreeInvoice
 * Author: Senior AI Engineering Collaborator
 * Features: Google OAuth, Prisma Session Storage, Custom Session Data.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "MOCK_ID",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MOCK_SECRET",
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        // Inject custom fields into the session for UI gating
        (session.user as any).id = user.id;
        (session.user as any).subscriptionType = (user as any).subscriptionType;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
