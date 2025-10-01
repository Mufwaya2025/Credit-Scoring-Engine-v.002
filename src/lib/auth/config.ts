import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import CredentialsProvider from "next-auth/providers/credentials"
import { z } from "zod"

// Define validation schema for credentials
const CredentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const validatedFields = CredentialsSchema.parse(credentials)
          
          // For demo purposes, we'll accept any email/password combination
          // In a real application, you would verify against your database
          const { email, password } = validatedFields
          
          // Check if user exists or create a new one
          let user = await prisma.user.findUnique({
            where: { email }
          })
          
          if (!user) {
            // Create new user for demo
            user = await prisma.user.create({
              data: {
                email,
                name: email.split('@')[0], // Use email prefix as name
                role: email.includes('admin') ? 'admin' : 'user'
              }
            })
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
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
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  }
}