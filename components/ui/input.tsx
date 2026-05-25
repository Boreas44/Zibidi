import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full min-w-0 text-[17px] md:text-base transition-[color,box-shadow,background] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
  {
    variants: {
      variant: {
        default:
          'h-10 rounded-lg border border-border bg-transparent px-3 py-2 shadow-xs focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive dark:bg-input/30',
        ios: 'h-10 rounded-full border-0 bg-ios-fill px-4 py-2 focus-visible:bg-accent focus-visible:ring-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
