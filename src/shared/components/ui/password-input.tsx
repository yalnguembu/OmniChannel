import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input, InputProps } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, externalRef) => {
  const [showPassword, setShowPassword] = useState(false)
  const internalRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(externalRef, () => internalRef.current as HTMLInputElement)

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.style.setProperty("-moz-text-security", showPassword ? "none" : "disc")
      internalRef.current.style.setProperty("-webkit-text-security", showPassword ? "none" : "disc")
    }
  }, [showPassword])

  // Masquage des icônes natives
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
        input[type="password"]::-webkit-reveal-password,
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-ms-reveal {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          pointer-events: none !important;
        }
      `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="relative w-full">
      <Input ref={internalRef} type={showPassword ? "text" : "password"} className={`pr-10 ${className}`} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        tabIndex={-1}
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        <span className="sr-only">{showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}</span>
      </Button>
    </div>
  )
})

PasswordInput.displayName = "PasswordInput"
