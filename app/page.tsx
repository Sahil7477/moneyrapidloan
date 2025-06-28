"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Phone, Shield } from "lucide-react"

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
    confirmationResult?: ConfirmationResult
  }
}

type AuthStep = "phone" | "otp"

interface FormErrors {
  name?: string
  phone?: string
  otp?: string
  general?: string
}

export default function PhoneAuth() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<AuthStep>("phone")
  const [timer, setTimer] = useState(60)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (step === "otp" && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [step, timer])

  const validatePhoneForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!phone.startsWith("+")) {
      newErrors.phone = "Phone must start with + and country code (e.g., +1234567890)"
    } else if (phone.length < 10) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOTP = (): boolean => {
    const newErrors: FormErrors = {}

    if (!otp.trim()) {
      newErrors.otp = "OTP is required"
    } else if (otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const setupRecaptcha = (): void => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          console.log("reCAPTCHA solved")
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired")
        },
      })
    }
  }

  const handleSendOTP = async (): Promise<void> => {
    if (!validatePhoneForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      setupRecaptcha()
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier!)

      window.confirmationResult = confirmation
      setStep("otp")
      setTimer(60)
      console.log("OTP sent successfully")
    } catch (err: unknown) {
  if (err instanceof Error) {
    alert("OTP send failed: " + err.message);
  } else {
    alert("OTP send failed");
  }
}finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (): Promise<void> => {
    if (!validateOTP()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await window.confirmationResult!.confirm(otp)
      console.log("User verified:", result.user)

      // Store user data
      localStorage.setItem("userName", name)
      localStorage.setItem("userPhone", phone)

      // Navigate to dashboard
      router.push("/dashboard")
    } catch (err: unknown) {
  if (err instanceof Error) {
    alert("Invalid OTP: " + err.message);
  } else {
    alert("Invalid OTP");
  }
}finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = (): void => {
    setTimer(60)
    handleSendOTP()
  }

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            {step === "phone" ? (
              <Phone className="h-6 w-6 text-blue-600" />
            ) : (
              <Shield className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "phone" ? "Phone Verification" : "Enter Verification Code"}
          </CardTitle>
          <CardDescription>
            {step === "phone" ? "We'll send you a verification code via SMS" : `We sent a 6-digit code to ${phone}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errors.general && (
            <Alert variant="destructive">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {step === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                <p className="text-xs text-gray-500">Include country code (e.g., +1 for US, +91 for India)</p>
              </div>

              <Button onClick={handleSendOTP} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
                {errors.otp && <p className="text-sm text-red-600">{errors.otp}</p>}
              </div>

              <Button onClick={handleVerifyOTP} className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500">Resend code in {formatTimer(timer)}</p>
                ) : (
                  <Button onClick={handleResendOTP} variant="ghost" className="text-sm" disabled={isLoading}>
                    Resend verification code
                  </Button>
                )}
              </div>

              <Button
                onClick={() => {
                  setStep("phone")
                  setOtp("")
                  setErrors({})
                }}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Change Phone Number
              </Button>
            </div>
          )}

          <div id="recaptcha-container" />
        </CardContent>
      </Card>
    </div>
  )
}
