import { BaseMenus } from "../types/menu"
import { Building, AppWindow, Gauge } from "lucide-react"

export const adminMenus: BaseMenus[] = [
  {
    groupTitle: "",
    elements: [
      {
        label: "menu.Dashboard",
        path: "/dashboard",
        icon: Gauge,
      },
    ],
  },
  {
    groupTitle: "menu.general",
    elements: [
      {
        label: "menu.companies",
        path: "/companies",
        icon: Building,
        addPagePath: "/companies/add",
        addButtonLabel: "menu.addCompany",
        permission: "COMPANY_VIEW",
      },
      {
        label: "menu.applications",
        path: "/applications",
        icon: AppWindow,
        addPagePath: "/applications/add",
        addButtonLabel: "menu.addApplication",
        permission: "APPLICATION_VIEW",
      },
    ],
  },
]
