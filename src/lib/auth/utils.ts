import { getServerSession } from "next-auth"
import { authOptions } from "./config"

/**
 * Get the current server session
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions)
}

/**
 * Get the current user from the server session
 */
export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated() {
  const session = await getCurrentSession()
  return !!session
}

/**
 * Check if the current user has admin role
 */
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return user
}