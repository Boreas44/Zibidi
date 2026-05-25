"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OtpCodeInput } from "@/components/otp-code-input"
import {
  signInAction,
  startSignUpAction,
  verifySignUpOtpAction,
  resendSignUpOtpAction,
} from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import { Mail } from "lucide-react"

interface AuthPanelProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "signin" | "signup"
}

type SignUpStep = "form" | "otp"

export function AuthPanel({
  isOpen,
  onClose,
  defaultMode = "signin",
}: AuthPanelProps) {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode)
  const [signUpStep, setSignUpStep] = useState<SignUpStep>("form")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [otp, setOtp] = useState("")

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      setSignUpStep("form")
      setOtp("")
    }
  }, [isOpen, defaultMode])

  const resetAll = () => {
    setEmail("")
    setPassword("")
    setDisplayName("")
    setOtp("")
    setSignUpStep("form")
  }

  const handleClose = () => {
    resetAll()
    onClose()
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await signInAction({ email, password })
      if (result.success) {
        toast.success(result.message ?? "Welcome back")
        resetAll()
        onClose()
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await startSignUpAction({ email, password, displayName })
      if (result.success) {
        if (result.requiresOtp) {
          setSignUpStep("otp")
          toast.success(result.message ?? "Check your email for the code")
        } else {
          toast.success(result.message ?? "Account created")
          resetAll()
          onClose()
          router.refresh()
        }
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code")
      return
    }
    setIsLoading(true)
    try {
      const result = await verifySignUpOtpAction({
        email,
        token: otp,
        password,
        displayName,
      })
      if (result.success) {
        toast.success(result.message ?? "Verified!")
        resetAll()
        onClose()
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    try {
      const result = await resendSignUpOtpAction({ email })
      if (result.success) {
        toast.success(result.message ?? "Code sent")
        setOtp("")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not resend code.")
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (next: "signin" | "signup") => {
    setMode(next)
    setSignUpStep("form")
    setOtp("")
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
      direction="right"
    >
      <DrawerContent className="flex h-full max-h-none flex-col rounded-none border-l border-border bg-card data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader className="border-b border-border text-left">
          <DrawerTitle className="text-[20px] font-semibold">
            {mode === "signup"
              ? signUpStep === "otp"
                ? "Verify your email"
                : "Create account"
              : "Sign in"}
          </DrawerTitle>
          <DrawerDescription className="text-[13px]">
            {mode === "signup" && signUpStep === "otp"
              ? `We sent a 6-digit code to ${email}`
              : mode === "signup"
                ? "Register with email verification — no stock photos."
                : "Sign in with your email and password."}
          </DrawerDescription>
        </DrawerHeader>

        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="flex flex-1 flex-col overflow-y-auto p-4">
            <ModeTabs mode={mode} onSwitch={switchMode} />
            <AuthFields
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              displayName={displayName}
              setDisplayName={setDisplayName}
              showName={false}
              passwordLabel="Password"
            />
            <DrawerFooter className="mt-auto border-t border-border px-0 pb-0">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Please wait…" : "Sign in"}
              </Button>
            </DrawerFooter>
          </form>
        )}

        {mode === "signup" && signUpStep === "form" && (
          <form
            onSubmit={handleStartSignUp}
            className="flex flex-1 flex-col overflow-y-auto p-4"
          >
            <ModeTabs mode={mode} onSwitch={switchMode} />
            <AuthFields
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              displayName={displayName}
              setDisplayName={setDisplayName}
              showName
              passwordLabel="Password (min. 6)"
            />
            <DrawerFooter className="mt-auto flex-col gap-2 border-t border-border px-0 pb-0">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending code…" : "Send verification code"}
              </Button>
            </DrawerFooter>
          </form>
        )}

        {mode === "signup" && signUpStep === "otp" && (
          <form
            onSubmit={handleVerifyOtp}
            className="flex flex-1 flex-col overflow-y-auto p-4"
          >
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-ios-fill-secondary p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>

            <OtpCodeInput value={otp} onChange={setOtp} disabled={isLoading} />

            <DrawerFooter className="mt-8 flex-col gap-2 border-t border-border px-0 pb-0 pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying…" : "Verify & create account"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={isLoading}
                onClick={handleResendOtp}
              >
                Resend code
              </Button>
              <Button
                type="button"
                variant="ios"
                className="w-full"
                disabled={isLoading}
                onClick={() => setSignUpStep("form")}
              >
                Change email
              </Button>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  )
}

function ModeTabs({
  mode,
  onSwitch,
}: {
  mode: "signin" | "signup"
  onSwitch: (m: "signin" | "signup") => void
}) {
  return (
    <div className="mb-4 flex rounded-xl bg-ios-fill p-1">
      <button
        type="button"
        onClick={() => onSwitch("signin")}
        className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition-smooth ${
          mode === "signin"
            ? "bg-accent text-foreground shadow-sm"
            : "text-muted-foreground"
        }`}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => onSwitch("signup")}
        className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition-smooth ${
          mode === "signup"
            ? "bg-accent text-foreground shadow-sm"
            : "text-muted-foreground"
        }`}
      >
        Sign up
      </button>
    </div>
  )
}

function AuthFields({
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  showName,
  passwordLabel,
}: {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  displayName: string
  setDisplayName: (v: string) => void
  showName: boolean
  passwordLabel: string
}) {
  return (
    <>
      {showName && (
        <div className="mb-4">
          <Label htmlFor="auth-name" className="text-[13px] text-muted-foreground">
            Display name
          </Label>
          <Input
            id="auth-name"
            variant="ios"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="mt-1"
            autoComplete="name"
            required
          />
        </div>
      )}
      <div className="mb-4">
        <Label htmlFor="auth-email" className="text-[13px] text-muted-foreground">
          Email
        </Label>
        <Input
          id="auth-email"
          variant="ios"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1"
          autoComplete="email"
          required
        />
      </div>
      <div className="mb-6">
        <Label htmlFor="auth-password" className="text-[13px] text-muted-foreground">
          {passwordLabel}
        </Label>
        <Input
          id="auth-password"
          variant="ios"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1"
          autoComplete={showName ? "new-password" : "current-password"}
          required
          minLength={6}
        />
      </div>
    </>
  )
}
