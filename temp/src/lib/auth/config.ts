import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For demo purposes, we'll use a hardcoded admin user
        // In production, this should query the database
        const adminEmail = process.env.ADMIN_EMAIL || "admin@arc-credit.com"
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

        // Validate credentials against environment variables
        if (credentials.email === adminEmail) {
          const isPasswordValid = await bcrypt.compare(credentials.password, adminPassword)
          if (isPasswordValid) {
            return {
              id: "1",
              email: adminEmail,
              name: "Administrator",
              role: "admin"
            }
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here"
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}
