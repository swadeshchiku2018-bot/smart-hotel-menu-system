import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET || "fallback-dev-secret-key-12345",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        // Find user by name (treating as username) or email
        let user = await (prisma as any).user.findFirst({
          where: { 
            OR: [
              { email: credentials.username },
              { name: credentials.username }
            ]
          }
        });

        // Initialize default admin if no admin exists 
        if (!user && credentials.username === 'admin') {
          const adminCount = await (prisma as any).user.count({ where: { role: 'ADMIN' }});
          if (adminCount === 0) {
            const hashedPwd = bcrypt.hashSync('admin', 10);
            user = await (prisma as any).user.create({
              data: {
                name: 'admin',
                role: 'ADMIN',
                hashedPassword: hashedPwd
              }
            });
          }
        }

        if (!user || !user.hashedPassword) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword);
        
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: '/auth/login',
  }
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authOptions.providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
