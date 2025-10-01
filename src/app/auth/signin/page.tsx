"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        // Get session to check if sign in was successful
        const session = await getSession()
        if (session) {
          router.push("/")
          router.refresh()
        } else {
          setError("Sign in failed")
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (userType: 'admin' | 'user') => {
    const demoEmail = userType === 'admin' ? 'admin@arc-credit.com' : 'user@arc-credit.com'
    const demoPassword = 'password123'
    
    setEmail(demoEmail)
    setPassword(demoPassword)
    
    // Auto-submit the form
    setTimeout(() => {
      const form = document.getElementById('signin-form') as HTMLFormElement
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ARC Credit Engine Pro
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access the credit scoring system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="signin-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Demo Accounts:
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                className="w-full justify-start"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Admin Demo</span>
                  <span className="text-xs text-muted-foreground">admin@arc-credit.com</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('user')}
                className="w-full justify-start"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">User Demo</span>
                  <span className="text-xs text-muted-foreground">user@arc-credit.com</span>
                </div>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Password: password123
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}