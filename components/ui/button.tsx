import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", ...props }, ref) => {
    let variantStyles = "";
    
    switch (variant) {
      case "primary":
        variantStyles = "bg-[var(--color-garnet)] text-[var(--color-paper-card)] hover:bg-[var(--color-garnet-dark)] shadow-sm";
        break;
      case "secondary":
        variantStyles = "bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[var(--color-paper-faint)] border border-[var(--color-paper-faint)]";
        break;
      case "outline":
        variantStyles = "bg-transparent text-[var(--color-ink)] border border-[var(--color-ink-soft)] hover:bg-[var(--color-paper)]";
        break;
      case "ghost":
        variantStyles = "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-paper)]";
        break;
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
