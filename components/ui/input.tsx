import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-3 py-2 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors placeholder:text-black/30 ${className}`}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
