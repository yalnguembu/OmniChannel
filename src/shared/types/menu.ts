import { ElementType } from "react"

export type SideBarMenuItem = SideBarMenuItemWithAddButton

export type BaseMenus = {
  groupTitle: string
  elements: SideBarMenuItem[]
}

export type SideBarMenuItemWithAddButton = {
  label: string
  path: string
  icon?: ElementType
  isActive?: boolean
  children?: SideBarMenuItem[]
  addPagePath?: string
  addButtonLabel?: string
  permission?: string // Permission required to access this menu item (VIEW permission)
}

export type SideBarMenuItemWithoutAddButton = {
  label: string
  path: string
  icon?: ElementType
  isActive?: boolean
  children?: SideBarMenuItem[]
  permission?: string // Permission required to access this menu item (VIEW permission)
}
