import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ios-spring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/40 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90',
        destructive:
          'rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'rounded-full border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        secondary:
          'rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'rounded-xl hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline rounded-none active:scale-100',
        ios: 'rounded-full bg-ios-fill text-foreground hover:bg-accent',
      },
      size: {
        default: 'h-10 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-9 rounded-full gap-1.5 px-4 text-[13px] has-[>svg]:px-3',
        lg: 'h-11 rounded-full px-7 text-base has-[>svg]:px-5',
        icon: 'size-10 rounded-full',
        'icon-sm': 'size-9 rounded-full',
        'icon-lg': 'size-11 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
