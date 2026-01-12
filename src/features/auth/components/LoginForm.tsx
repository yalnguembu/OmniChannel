import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/shared/components/ui/form"
import { LoginFormData, loginSchema } from "@/shared/lib/validation"
import { LoaderIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSession } from "@/features/auth/hooks/useSession"
import { useState } from "react"

export const LoginForm = () => {
  const { login, isLoading, error: sessionError } = useSession()
  const [error, setError] = useState<string | null>(sessionError || null)

  const { t } = useTranslation()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleSubmit = async (values: LoginFormData) => {
    setError(null)
    try {
      await login({
        email: values.email,
        password: values.password,
      })
    } catch (err: any) {
      setError(err.message || "Login failed")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{t("auth.login.title", "Sign in to your account")}</CardTitle>
        <CardDescription>{t("auth.login.description", "Enter your email and password below")}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mb-4 text-sm">{error}</div>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.login.email", "Email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t("auth.login.emailPlaceholder", "Enter your email")} {...field} autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth.login.password", "Password")}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t("auth.login.passwordPlaceholder", "••••••••")} {...field} autoComplete="current-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.login.signIn", "Sign in")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
