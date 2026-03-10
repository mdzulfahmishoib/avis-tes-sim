import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-[#21479B] focus-visible:ring-3 focus-visible:ring-[#21479B]/50 disabled:pointer-events-none disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Input }
