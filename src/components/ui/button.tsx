import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border)]",
        destructive:
          "bg-destructive text-white border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border)]",
        outline:
          "bg-background text-foreground border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] hover:bg-accent hover:text-accent-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border)]",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-border shadow-[4px_4px_0px_0px_var(--border)] hover:bg-secondary/80 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border)]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-border",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
