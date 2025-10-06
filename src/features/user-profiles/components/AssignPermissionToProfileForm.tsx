import React, { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { LoaderIcon, Loader2 } from "lucide-react"
import { useUserProfile } from "../hooks/useUserProfile"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { UserPermissionModuleResponse, ProfilPermissionsResponse } from "@/shared/api"

interface AssignPermissionToProfileFormProps {
  onSubmit: (permissionValues: string[]) => void
  onCancel: () => void
  isLoading?: boolean
  profileId: string
}

const assignPermissionsSchema = z.object({
  permissionValues: z.array(z.string()).min(1, "At least one permission must be selected"),
})

type AssignPermissionsFormData = z.infer<typeof assignPermissionsSchema>

export const AssignPermissionToProfileForm: React.FC<AssignPermissionToProfileFormProps> = ({ onSubmit, onCancel, isLoading = false, profileId }) => {
  const { t } = useTranslation()

  const { getPermissionsByUserProfileId, getAllUserProfilePermissions } = useUserProfile()

  const { data: allPermissionsResponse, isLoading: isLoadingAllPermissions } = getAllUserProfilePermissions()
  const { data: profilePermissionsResponse, isLoading: isLoadingProfilePermissions } = getPermissionsByUserProfileId(profileId)

  // Extract permission modules from API responses
  const allPermissionModules = (allPermissionsResponse?.data as UserPermissionModuleResponse[]) || []
  const profilePermissionsData = profilePermissionsResponse?.data as ProfilPermissionsResponse | undefined

  // Get all selected permission values from profile
  const selectedPermissionValues = useMemo(() => {
    const values: string[] = []
    profilePermissionsData?.permissionModules?.forEach((module) => {
      module.permissions?.forEach((perm) => {
        if (perm.isSelected && perm.value) {
          values.push(perm.value)
        }
      })
    })
    return values
  }, [profilePermissionsData])

  // Get all available permission values
  const allPermissionValues = useMemo(() => {
    const values: string[] = []
    allPermissionModules.forEach((module) => {
      module.permissions?.forEach((perm) => {
        if (perm.value) {
          values.push(perm.value)
        }
      })
    })
    return values
  }, [allPermissionModules])

  const form = useForm<AssignPermissionsFormData>({
    resolver: zodResolver(assignPermissionsSchema),
    defaultValues: {
      permissionValues: selectedPermissionValues,
    },
  })

  useEffect(() => {
    if (selectedPermissionValues.length > 0) {
      form.reset({ permissionValues: selectedPermissionValues })
    }
  }, [selectedPermissionValues, form])

  const handleSubmit = (values: AssignPermissionsFormData) => {
    onSubmit(values.permissionValues)
  }

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      form.setValue("permissionValues", allPermissionValues)
    } else {
      form.setValue("permissionValues", [])
    }
  }

  const handleToggleModule = (module: UserPermissionModuleResponse, checked: boolean) => {
    const currentValues = form.getValues("permissionValues")
    const modulePermissionValues = module.permissions?.map((p) => p.value).filter(Boolean) as string[]

    if (checked) {
      const newValues = [...new Set([...currentValues, ...modulePermissionValues])]
      form.setValue("permissionValues", newValues)
    } else {
      const newValues = currentValues.filter((val) => !modulePermissionValues.includes(val))
      form.setValue("permissionValues", newValues)
    }
  }

  const selectedPermissions = form.watch("permissionValues")
  const allSelected = allPermissionValues.length > 0 && selectedPermissions?.length === allPermissionValues.length

  if (isLoadingAllPermissions || isLoadingProfilePermissions) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t("userProfile.form.assignPermissions.title")}</CardTitle>
        {profilePermissionsData?.profilName && <CardTitle className="text-lg text-muted-foreground">{profilePermissionsData.profilName}</CardTitle>}
        <CardDescription>{t("userProfile.form.assignPermissions.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b">
              <Checkbox checked={allSelected} onCheckedChange={handleToggleAll} id="select-all" />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                {t("userProfile.form.assignPermissions.selectAll")}
              </label>
            </div>

            <FormField
              control={form.control}
              name="permissionValues"
              render={() => (
                <FormItem>
                  <div className="space-y-6">
                    {allPermissionModules.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t("userProfile.form.assignPermissions.noPermissions")}</p>
                    ) : (
                      <div className="space-y-6">
                        {allPermissionModules.map((module, moduleIndex) => {
                          const modulePermissionValues = module.permissions?.map((p) => p.value).filter(Boolean) as string[]
                          const allModuleSelected = modulePermissionValues.every((val) => selectedPermissions?.includes(val))
                          const someModuleSelected = modulePermissionValues.some((val) => selectedPermissions?.includes(val))

                          return (
                            <div key={moduleIndex} className="space-y-3">
                              <div className="flex items-center space-x-2 pb-2 border-b">
                                <Checkbox
                                  checked={allModuleSelected}
                                  onCheckedChange={(checked) => handleToggleModule(module, checked as boolean)}
                                  className={someModuleSelected && !allModuleSelected ? "opacity-50" : ""}
                                  id={`module-${moduleIndex}`}
                                />
                                <label htmlFor={`module-${moduleIndex}`} className="text-base font-semibold cursor-pointer">
                                  {module.name}
                                </label>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-6">
                                {module.permissions?.map((permission, permIndex) => (
                                  <FormField
                                    key={`${moduleIndex}-${permIndex}`}
                                    control={form.control}
                                    name="permissionValues"
                                    render={({ field }) => {
                                      return (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-lg hover:bg-accent/50 transition-colors">
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(permission.value!)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, permission.value])
                                                  : field.onChange(field.value?.filter((value) => value !== permission.value))
                                              }}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none flex-1">
                                            <FormLabel className="text-sm cursor-pointer">{permission.displayName}</FormLabel>
                                          </div>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading || allPermissionModules.length === 0}>
                {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                {t("userProfile.form.assignPermissions.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
