import { ElementType } from "react"

export type SideBarMenuItem = SideBarMenuItemWithAddButton
// | SideBarMenuItemWithoutAddButton;

export type SideBarMenuItemWithAddButton = {
  label: string
  path: string
  icon?: ElementType
  isActive?: boolean
  children?: SideBarMenuItem[]
  addPagePath?: string
  addButtonLabel?: string
}

export type SideBarMenuItemWithoutAddButton = {
  label: string
  path: string
  icon?: ElementType
  isActive?: boolean
  children?: SideBarMenuItem[]
}
