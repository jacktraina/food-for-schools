"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react"
import { usePostMutation } from "@/hooks/use-api"

interface PasswordResetCodeRequest {
  email: string
}

interface PasswordResetRequest {
  email: string
  code: string
  newPassword: string
}

interface ApiResponse {
  message: string
}

export function ForgotPasswordForm() {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request')
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const requestCodeMutation = usePostMutation<PasswordResetCodeRequest, ApiResponse>(
    '/users/request-password-reset-code'
  )

  const resetPasswordMutation = usePostMutation<PasswordResetRequest, ApiResponse>(
    '/users/reset-password'
  )

  const validatePassword = (password: string): string => {
    if (password.length < 8) return "Password must be at least 8 characters long"
    if (password.length > 64) return "Password must not exceed 64 characters"
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "Password must include at least one lowercase letter"
    if (!/[0-9]/.test(password)) return "Password must include at least one digit"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must include at least one special character"
    return ""
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await requestCodeMutation.mutateAsync({ email })
      setStep('reset')
    } catch (error) {
      console.error('Request code error:', error)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    const passwordValidationError = validatePassword(newPassword)
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    try {
      await resetPasswordMutation.mutateAsync({
        email,
        code,
        newPassword
      })
      setStep('success')
    } catch (error) {
      console.error('Reset password error:', error)
    }
  }

  if (step === 'success') {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-800">
          Your password has been successfully reset. You can now log in with your new password.
        </AlertDescription>
      </Alert>
    )
  }

  if (step === 'reset') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep('request')}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            We&apos;ve sent a reset code to <span className="font-medium">{email}</span>. 
            Please check your email and enter the code below along with your new password.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Reset Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter the code from your email"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {passwordError && (
            <div className="text-sm text-red-500">{passwordError}</div>
          )}

          {resetPasswordMutation.error && (
            <div className="text-sm text-red-500">
              {resetPasswordMutation.error.response?.data?.message || 'An error occurred. Please try again.'}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleRequestCode} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {requestCodeMutation.error && (
        <div className="text-sm text-red-500">
          {requestCodeMutation.error.response?.data?.message || 'An error occurred. Please try again.'}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={requestCodeMutation.isPending}
      >
        {requestCodeMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send reset instructions"
        )}
      </Button>
    </form>
  )
}
