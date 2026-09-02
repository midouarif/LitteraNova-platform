import * as React from "react"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg px-3 py-2 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors placeholder:text-black/30 min-h-[100px] ${className}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
