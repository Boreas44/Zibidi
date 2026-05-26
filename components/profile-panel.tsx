"use client"

import { useEffect, useState } from "react"
import {
  ChevronRight,
  LogOut,
  Settings,
  Bookmark,
  User,
  UserPlus,
  LogIn,
  Camera,
  Trash2,
} from "lucide-react"
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
import { UserAvatar } from "@/components/user-avatar"
import type { AppProfile } from "@/lib/auth/server"
import { signOutAction, updateProfileAction } from "@/app/actions/auth"
import { uploadAvatarAction, removeAvatarAction } from "@/app/actions/profile"
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
} from "@/lib/auth/display-name"
import { hasAvatarUrl } from "@/lib/avatar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
  onOpenSettings: () => void
  onOpenAuth: (mode?: "signin" | "signup") => void
  onViewLibrary?: () => void
  user: AppProfile | null
  postCount: number
  savedCount: number
}

export function ProfilePanel({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenAuth,
  onViewLibrary,
  user,
  postCount,
  savedCount,
}: ProfilePanelProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName)
      setBio(user.bio)
      setAvatarUrl(user.avatarUrl)
      setIsEditing(false)
    }
  }, [isOpen, user])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.set("avatar", file)
      const result = await uploadAvatarAction(formData)
      if (result.success) {
        setAvatarUrl(result.avatarUrl)
        toast.success(result.message ?? "Photo updated")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsLoading(false)
      e.target.value = ""
    }
  }

  const handleRemoveAvatar = async () => {
    setIsLoading(true)
    try {
      const result = await removeAvatarAction()
      if (result.success) {
        setAvatarUrl(null)
        toast.success(result.message ?? "Photo removed")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const result = await updateProfileAction({ displayName, bio })
      if (result.success) {
        toast.success(result.message ?? "Profile updated")
        setIsEditing(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const result = await signOutAction()
      if (result.success) {
        toast.success("Signed out")
        onClose()
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
        <DrawerContent className="flex h-full max-h-none flex-col rounded-none border-l border-border bg-card data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
          <DrawerHeader className="border-b border-border text-left">
            <DrawerTitle className="text-[20px] font-semibold">Account</DrawerTitle>
            <DrawerDescription className="text-[13px]">
              Sign in or create an account to post and save content
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ios-fill-secondary">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="max-w-xs text-center text-[15px] text-secondary-foreground">
              Sign in to post, save content, and add a profile photo.
            </p>
            <div className="flex w-full max-w-xs flex-col gap-3">
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  onClose()
                  onOpenAuth("signup")
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create account
              </Button>
              <Button
                type="button"
                variant="ios"
                className="w-full"
                onClick={() => {
                  onClose()
                  onOpenAuth("signin")
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="flex h-full max-h-none flex-col rounded-none border-l border-border bg-card data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader className="border-b border-border text-left">
          <DrawerTitle className="text-[20px] font-semibold">Account</DrawerTitle>
          <DrawerDescription className="text-[13px] text-secondary-foreground">
            {user.email}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6 flex flex-col items-center rounded-2xl border border-border/50 bg-secondary py-6">
            <div className="relative mb-3">
              <UserAvatar
                name={displayName}
                avatarUrl={avatarUrl}
                size="lg"
              />
              {isEditing && (
                <>
                  <label
                    htmlFor="profile-avatar-upload"
                    className="ios-tap absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                    aria-label="Upload profile photo"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="profile-avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={isLoading}
                    onChange={handleAvatarChange}
                  />
                </>
              )}
            </div>
            {isEditing && hasAvatarUrl(avatarUrl) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-2 text-destructive"
                disabled={isLoading}
                onClick={handleRemoveAvatar}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove photo
              </Button>
            )}
            {isEditing ? (
              <div className="w-full max-w-xs space-y-3 px-4">
                <div>
                  <Label htmlFor="profile-name" className="text-[13px] text-secondary-foreground">
                    Display name
                  </Label>
                  <Input
                    id="profile-name"
                    variant="ios"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1"
                    minLength={DISPLAY_NAME_MIN_LENGTH}
                    maxLength={DISPLAY_NAME_MAX_LENGTH}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="profile-bio" className="text-[13px] text-secondary-foreground">
                    Bio
                  </Label>
                  <Input
                    id="profile-bio"
                    variant="ios"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-[22px] font-bold text-foreground">{user.displayName}</h3>
                <p className="mt-2 max-w-xs text-center text-[15px] leading-relaxed text-secondary-foreground">
                  {user.bio || "No bio yet"}
                </p>
              </>
            )}
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/50 bg-secondary px-4 py-3 text-center">
              <p className="text-[22px] font-bold text-foreground">{postCount}</p>
              <p className="text-[12px] font-medium text-secondary-foreground">Posts</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-secondary px-4 py-3 text-center">
              <p className="text-[22px] font-bold text-foreground">{savedCount}</p>
              <p className="text-[12px] font-medium text-secondary-foreground">Saved</p>
            </div>
          </div>

          <section className="ios-grouped border border-border/50 bg-secondary">
            <button
              type="button"
              onClick={() => setIsEditing((e) => !e)}
              className="ios-tap ios-separator flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <User className="h-5 w-5 text-primary" />
              <span className="flex-1 text-[17px] font-medium text-foreground">
                {isEditing ? "Cancel edit" : "Edit profile"}
              </span>
              <ChevronRight className="h-4 w-4 text-secondary-foreground/80" />
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onViewLibrary?.()
              }}
              className="ios-tap ios-separator flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Bookmark className="h-5 w-5 text-primary" />
              <span className="flex-1 text-[17px] font-medium text-foreground">Saved</span>
              <span className="text-[13px] tabular-nums text-secondary-foreground">{savedCount}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenSettings()
              }}
              className="ios-tap flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Settings className="h-5 w-5 text-primary" />
              <span className="flex-1 text-[17px] font-medium text-foreground">Settings</span>
              <ChevronRight className="h-4 w-4 text-secondary-foreground/80" />
            </button>
          </section>
        </div>

        <DrawerFooter className="flex-col gap-2 border-t border-border">
          {isEditing ? (
            <Button
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={handleSaveProfile}
            >
              Save profile
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
