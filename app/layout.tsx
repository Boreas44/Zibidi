import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { STRIP_EXTENSION_DOM_SCRIPT } from '@/lib/strip-extension-dom'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zibidi — share, discover, write',
  description: 'Create, discover, and share on Zibidi. A modern blog experience inspired by Apple Music.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/WhiteLGO.png', type: 'image/png' }],
    apple: [{ url: '/WhiteLGO.png', type: 'image/png' }],
    shortcut: ['/WhiteLGO.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script id="strip-extension-dom" strategy="beforeInteractive">
          {STRIP_EXTENSION_DOM_SCRIPT}
        </Script>
        {children}
        <Toaster theme="dark" position="top-center" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
