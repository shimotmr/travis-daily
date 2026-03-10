import * as React from "react"

import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80",
    destructive: "bg-[hsl(var(--error))] text-white hover:bg-[hsl(var(--error))]/80",
    outline: "text-foreground border border-[hsl(var(--border))]",
    success: "bg-[hsl(var(--success-bg))] text-[hsl(var(--success))] border border-[hsl(var(--success-border))]",
    warning: "bg-[hsl(var(--warning-bg))] text-[hsl(var(--warning))] border border-[hsl(var(--warning-border))]"
  }
  
  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )} 
      {...props} 
    />
  )
}

export { Badge }
