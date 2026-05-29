import { cn } from "@/lib/utils"

type AuthFormErrorProps = {
  message: string
  className?: string
}

export function AuthFormError({ message, className }: AuthFormErrorProps) {
  return (
    <p
      role="alert"
      className={cn(
        "w-fit max-w-full rounded-full bg-red-50 px-3 py-1.5 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400",
        className,
      )}
    >
      {message}
    </p>
  )
}
