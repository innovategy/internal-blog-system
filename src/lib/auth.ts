import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { JWT } from "next-auth/jwt";

// Extend the default session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      username?: string;
      organizationId?: string;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    username?: string;
    organizationId?: string;
  }
}

// Define types for JWT
interface ExtendedJWT extends JWT {
  organizationId?: string;
  username?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          return null;
        }

        // Ensure we're working with valid string inputs for bcrypt
        const passwordToCompare = credentials.password || "";
        const hashedPassword = user.password;
        
        // Compare the password with the hash
        const isPasswordValid = await compare(passwordToCompare, hashedPassword);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          username: user.username,
          organizationId: user.organizationId
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        
        // Cast token to our extended type for proper type checking
        const extendedToken = token as ExtendedJWT;
        
        if (extendedToken.organizationId) {
          session.user.organizationId = extendedToken.organizationId;
        }
        if (extendedToken.username) {
          session.user.username = extendedToken.username;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Cast token to our extended type
        const extendedToken = token as ExtendedJWT;
        
        // Safely assign values from user
        if (user.organizationId) {
          extendedToken.organizationId = user.organizationId as string;
        }
        if (user.username) {
          extendedToken.username = user.username as string;
        }
        
        return extendedToken;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
});
