"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
          <CardDescription>
            There was an error during the authentication process.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">
            Please check your credentials and try again.
          </p>
          <Button asChild>
            <Link href="/auth/signin">Return to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
