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
import { LayoutGroup, motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AuthPanelProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "signin" | "signup"
}

type SignUpStep = "form" | "otp"

const AUTH_SPRING = "cubic-bezier(0.32, 0.72, 0, 1)"
const AUTH_SLIDE_MS = 320

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
    if (next === mode || isLoading) return
    setMode(next)
    setSignUpStep("form")
    setOtp("")
  }

  const headerKey =
    signUpStep === "otp"
      ? "otp"
      : mode === "signup"
        ? "signup"
        : "signin"

  const headerCopy = {
    otp: {
      title: "Verify your email",
      description: `We sent a 6-digit code to ${email}`,
    },
    signup: {
      title: "Create account",
      description: "Register with email verification — no stock photos.",
    },
    signin: {
      title: "Sign in",
      description: "Sign in with your email and password.",
    },
  }[headerKey]

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
          <div className="relative min-h-[3.25rem] overflow-hidden">
            <div
              key={headerKey}
              className="auth-header-enter"
              style={{ animationDuration: `${AUTH_SLIDE_MS}ms` }}
            >
              <DrawerTitle className="text-[20px] font-semibold">
                {headerCopy.title}
              </DrawerTitle>
              <DrawerDescription className="text-[13px]">
                {headerCopy.description}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Sign in / Sign up — sliding panels */}
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col transition-[opacity,transform] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              signUpStep === "otp"
                ? "pointer-events-none absolute inset-0 -translate-x-6 opacity-0"
                : "relative translate-x-0 opacity-100"
            )}
            style={{ transitionDuration: `${AUTH_SLIDE_MS}ms` }}
            aria-hidden={signUpStep === "otp"}
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
              <ModeTabs mode={mode} onSwitch={switchMode} disabled={isLoading} />

              <div className="relative min-h-0 flex-1 overflow-hidden">
                <div
                  className="flex h-full w-[200%] transition-transform motion-reduce:transition-none"
                  style={{
                    transform:
                      mode === "signin" ? "translateX(0%)" : "translateX(-50%)",
                    transitionDuration: `${AUTH_SLIDE_MS}ms`,
                    transitionTimingFunction: AUTH_SPRING,
                  }}
                >
                  <form
                    onSubmit={handleSignIn}
                    className="flex w-1/2 shrink-0 flex-col pr-2"
                  >
                    <AuthFields
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      displayName={displayName}
                      setDisplayName={setDisplayName}
                      showName={false}
                      passwordLabel="Password"
                      idPrefix="signin"
                    />
                    <DrawerFooter className="mt-auto border-t border-border px-0 pb-0 pt-4">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && mode === "signin"
                          ? "Please wait…"
                          : "Sign in"}
                      </Button>
                    </DrawerFooter>
                  </form>

                  <form
                    onSubmit={handleStartSignUp}
                    className="flex w-1/2 shrink-0 flex-col pl-2"
                  >
                    <AuthFields
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      displayName={displayName}
                      setDisplayName={setDisplayName}
                      showName
                      passwordLabel="Password (min. 6)"
                      idPrefix="signup"
                    />
                    <DrawerFooter className="mt-auto flex-col gap-2 border-t border-border px-0 pb-0 pt-4">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && mode === "signup"
                          ? "Sending code…"
                          : "Send verification code"}
                      </Button>
                    </DrawerFooter>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* OTP step — slides in from the right */}
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col transition-[opacity,transform] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
              signUpStep === "otp"
                ? "relative translate-x-0 opacity-100"
                : "pointer-events-none absolute inset-0 translate-x-8 opacity-0"
            )}
            style={{ transitionDuration: `${AUTH_SLIDE_MS}ms` }}
            aria-hidden={signUpStep !== "otp"}
          >
            <form
              onSubmit={handleVerifyOtp}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4"
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
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

const TAB_SPRING = { type: "spring" as const, bounce: 0.2, duration: 0.6 }

function ModeTabs({
  mode,
  onSwitch,
  disabled,
}: {
  mode: "signin" | "signup"
  onSwitch: (m: "signin" | "signup") => void
  disabled?: boolean
}) {
  return (
    <LayoutGroup id="auth-mode-tabs">
      <div className="relative mb-4 flex rounded-full bg-ios-fill p-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSwitch("signin")}
          className={cn(
            "relative z-10 flex-1 rounded-full py-2 text-[13px] font-medium ios-spring transition-colors duration-200",
            mode === "signin"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          {mode === "signin" && (
            <motion.div
              layoutId="auth-mode-indicator"
              className="absolute inset-0 z-0 rounded-full bg-primary shadow-sm shadow-primary/20"
              transition={TAB_SPRING}
            />
          )}
          <span className="relative z-10">Sign in</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSwitch("signup")}
          className={cn(
            "relative z-10 flex-1 rounded-full py-2 text-[13px] font-medium ios-spring transition-colors duration-200",
            mode === "signup"
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground/80"
          )}
        >
          {mode === "signup" && (
            <motion.div
              layoutId="auth-mode-indicator"
              className="absolute inset-0 z-0 rounded-full bg-primary shadow-sm shadow-primary/20"
              transition={TAB_SPRING}
            />
          )}
          <span className="relative z-10">Sign up</span>
        </button>
      </div>
    </LayoutGroup>
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
  idPrefix,
}: {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  displayName: string
  setDisplayName: (v: string) => void
  showName: boolean
  passwordLabel: string
  idPrefix: string
}) {
  return (
    <>
      {showName && (
        <div className="mb-4">
          <Label
            htmlFor={`${idPrefix}-name`}
            className="text-[13px] text-muted-foreground"
          >
            Display name
          </Label>
          <Input
            id={`${idPrefix}-name`}
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
        <Label
          htmlFor={`${idPrefix}-email`}
          className="text-[13px] text-muted-foreground"
        >
          Email
        </Label>
        <Input
          id={`${idPrefix}-email`}
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
        <Label
          htmlFor={`${idPrefix}-password`}
          className="text-[13px] text-muted-foreground"
        >
          {passwordLabel}
        </Label>
        <Input
          id={`${idPrefix}-password`}
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
