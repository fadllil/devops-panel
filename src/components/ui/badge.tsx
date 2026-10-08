import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "#lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        warning: "border-transparent bg-yellow-500 text-white",
        danger: "border-transparent bg-red-500 text-white",
        success: "border-transparent bg-green-500 text-white",
        info: "border-transparent bg-blue-500 text-white",
        light: "border-transparent bg-white text-black",
        dark: "border-transparent bg-black text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
