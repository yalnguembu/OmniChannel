import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon } from "lucide-react"
import { CreateJobRequest } from "@/shared/api"
import { zCreateJobRequest } from "@/shared/api/zod.gen"



interface JobCreateFormProps {
  onSubmit: (data: CreateJobRequest, setError: any) => void
  onCancel: () => void
  isLoading?: boolean
  defaultValues?: Partial<CreateJobRequest>
  
}

export const JobCreateForm: React.FC<JobCreateFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  defaultValues,
  
}) => {
  const { t } = useTranslation()

  const form = useForm<CreateJobRequest>({
    resolver: zodResolver(zCreateJobRequest),
    defaultValues: {
      ...defaultValues,
      
    },
  })

  

  const handleSubmit = (values: CreateJobRequest) => {
    if (onSubmit) {
      onSubmit(values, form.setError)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("job.form.create.title")}</CardTitle>
        <CardDescription>{t("job.form.create.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
      control={form.control}
      name="jobType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.jobTypeLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Job.form.jobTypePlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.statusLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Job.form.statusPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="payload"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.payloadLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Job.form.payloadPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="scheduledAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.scheduledAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Job.form.scheduledAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="startedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.startedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Job.form.startedAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="completedAt"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.completedAtLabel")}</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
            placeholder={t("Job.form.completedAtPlaceholder")}
            required={false}
          />
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="result"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.resultLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Job.form.resultPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="errorMessage"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.errorMessageLabel")}</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder={t("Job.form.errorMessagePlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="attemptCount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.attemptCountLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Job.form.attemptCountPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

<FormField
      control={form.control}
      name="maxAttempts"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("Job.form.maxAttemptsLabel")}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={t("Job.form.maxAttemptsPlaceholder")}
              {...field}
              value={field.value || ""}
              required={false}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
            </div>

            {form.formState.errors.root && (
              <div className="bg-destructive/15 text-destructive text-sm font-medium p-3 rounded-md animate-in fade-in slide-in-from-top-1">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("job.form.create.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
