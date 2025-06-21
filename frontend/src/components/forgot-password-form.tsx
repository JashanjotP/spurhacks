'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'
import { Brain, MailCheck } from 'lucide-react'

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <MailCheck className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-emerald-200">
          Check Your Email
        </h1>
        <p className="text-balance text-slate-400 max-w-sm">
          We've sent a password reset link to your email address. Please check your inbox and spam folder.
        </p>
        <Button asChild className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Link href="/auth/login">Back to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
          Forgot Password
        </h1>
        <p className="text-balance text-slate-400">
          No worries, we'll send you reset instructions.
        </p>
      </div>
      <Card className="border-0 bg-slate-900/70 backdrop-blur-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send reset instructions'}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-slate-400">
              Remember your password?{' '}
              <Link href="/auth/login" className="font-semibold text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
