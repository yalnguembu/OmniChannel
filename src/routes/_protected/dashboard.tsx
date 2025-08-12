import React from "react"

import { Button } from "../../shared/components"
import { useTranslation } from "react-i18next"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import type { SideBarMenuItem } from "../../shared/types/menu"
import { adminMenus } from "@/shared/lib/menu"
// import { useUIStore } from "@/shared/stores"
// import { useMemo } from "react"

const flattenMenus = (menus: SideBarMenuItem[]): SideBarMenuItem[] => {
  const result: SideBarMenuItem[] = []
  for (const item of menus) {
    if (item.children && item.children.length > 0) {
      result.push(...flattenMenus(item.children))
    } else if (item.path) {
      result.push(item)
    }
  }
  return result
}

const QuickActionsPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  // const { context } = useUIStore()

  // const menus = useMemo(() => getMenusFromContext(context), [context])
  const quickActions = flattenMenus(adminMenus)

  return (
    <div className="p-8 mx-auto w-full md:max-w-5xl">
      <h2>{t("menu.Dashboard", { defaultValue: "Quick Actions" })}</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {quickActions.map((action: SideBarMenuItem) => (
          <Button className="flex gap-3 items-center" key={action.path} onClick={() => navigate({ to: action.path })} variant="outline" size="lg">
            {action.icon && React.createElement(action.icon, { size: 20 })}
            {t(`${action.label}`, { defaultValue: action.label })}
          </Button>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/_protected/dashboard")({
  component: QuickActionsPage,
})
