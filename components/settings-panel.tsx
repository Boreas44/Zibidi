"use client"

import { Bell, Database, Moon, Shield } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { isSupabaseConfigured } from "@/lib/supabase/env"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const supabaseConnected = isSupabaseConfigured()

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="h-full max-h-none rounded-none border-l border-border bg-card data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader className="border-b border-border text-left">
          <DrawerTitle className="text-[20px] font-semibold">Settings</DrawerTitle>
          <DrawerDescription className="text-[13px]">
            App preferences and integrations
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4">
          <section className="ios-grouped mb-6">
            <div className="ios-separator flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-primary" />
                <Label htmlFor="dark-mode" className="text-[17px] font-normal">
                  Dark appearance
                </Label>
              </div>
              <Switch id="dark-mode" defaultChecked disabled />
            </div>
            <div className="ios-separator flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <Label htmlFor="notifications" className="text-[17px] font-normal">
                  Notifications
                </Label>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
          </section>

          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Backend
          </p>
          <section className="ios-grouped">
            <div className="flex items-start gap-3 px-4 py-3.5">
              <Database className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-[17px] text-foreground">Supabase</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {supabaseConnected
                    ? "Connected — posts sync to your database."
                    : "Not configured — using local mock data. Add keys to .env.local."}
                </p>
              </div>
              <span
                className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  supabaseConnected
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {supabaseConnected ? "Live" : "Mock"}
              </span>
            </div>
            <div className="ios-separator flex items-start gap-3 px-4 py-3.5">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-[17px] text-foreground">Row Level Security</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  Run supabase/migrations/001_posts.sql in your project SQL editor.
                </p>
              </div>
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
