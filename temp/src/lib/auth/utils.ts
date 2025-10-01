import { getServerSession } from "next-auth"
import { authOptions } from "./config"

/**
 * Get the current session on the server side
 */
export async function getAuthSession() {
  return await getServerSession(authOptions)
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated() {
  const session = await getAuthSession()
  return !!session
}

/**
 * Check if the current user has admin role
 */
export async function isAdmin() {
  const session = await getAuthSession()
  return session?.user?.role === "admin"
}

/**
 * Require authentication for API routes
 * Returns an error response if not authenticated
 */
export async function requireAuth() {
  const session = await getAuthSession()
  
  if (!session) {
    return {
      error: "Authentication required",
      status: 401
    }
  }
  
  return { session }
}

/**
 * Require admin role for API routes
 * Returns an error response if not admin
 */
export async function requireAdmin() {
  const auth = await requireAuth()
  
  if (auth.error) {
    return auth
  }
  
  if (auth.session.user.role !== "admin") {
    return {
      error: "Admin access required",
      status: 403
    }
  }
  
  return { session: auth.session }
}
