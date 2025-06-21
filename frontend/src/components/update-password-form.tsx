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
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Brain } from 'lucide-react'

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200">
          Update Your Password
        </h1>
        <p className="text-balance text-slate-400">
          Enter your new password to secure your account.
        </p>
      </div>
      <Card className="border-0 bg-slate-900/70 backdrop-blur-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-300">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
