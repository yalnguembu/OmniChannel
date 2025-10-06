import { BadgeCheck, Bell, ChevronRight, GalleryVerticalEnd, LogOut, Settings, Wheat, User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/shared/components/ui/sidebar"
import { useSessionStore, useUIStore } from "@/shared/stores"
import { Button } from "../ui"
import { ThemeModeToggle } from "../ThemeModeToggle"
import { useNavigate } from "@tanstack/react-router"
import { CONTEXT } from "@/shared/types/ui"
import { useSession } from "@/shared/hooks/useSession"
import LanguageToggle from "../LanguageToggle"

export function UserDropdown() {
  const { isMobile } = useSidebar()
  const { user } = useSessionStore()
  const { context, setContext } = useUIStore()
  const navigate = useNavigate()
  const { logout } = useSession()

  const handleSwitchContext = (newContext: CONTEXT) => {
    setContext(newContext)
    navigate({ to: `/` })
  }

  const avatar = (user?.fullName ?? `${user?.lastName} ${user?.firstName}`)
    .split(" ")
    .splice(0, 2)
    .map((user) => user.at(0))
    ?.join("")
    .toLocaleUpperCase()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="hidden lg:grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.fullName}</span>
              </div>
              <Avatar className="h-8 w-8 rounded-lg">
                {/* <AvatarImage src={user?.photo ?? ""} alt={user?.fullName} /> */}
                <AvatarFallback className="rounded-full text-secondary font-black">{avatar}</AvatarFallback>
              </Avatar>
              <ChevronRight className="ml-auto size-4 rotate-90" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg ml-2" side="bottom" align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={user?.photo ?? ""} alt={user?.fullName} /> */}
                  <AvatarFallback className="rounded-lg">{avatar}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.fullName}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ThemeModeToggle size="default" />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <LanguageToggle variant="expanded" direction="right" />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="w-full">
                  <Button
                    variant="outline"
                    size="lg"
                    className="shadow-none h-12 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-between w-full border-transparent"
                  >
                    <GalleryVerticalEnd className="ml-auto size-5" />
                    <div className="grid w-full gap-y-1 text-left leading-tight">
                      <span className="truncate text-xs text-mutted font-light">Context</span>
                      <span className="text-xs text-primary font-medium capitalize">{context}</span>
                    </div>
                    <ChevronRight className="ml-auto size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" className="w-(--radix-dropdown-menu-trigger-width) ml-1 min-w-56 py-2 rounded-lg">
                  <DropdownMenuItem onClick={() => handleSwitchContext("SYSTEM")}>
                    <Settings />
                    Configuration
                    {context === "SYSTEM" && <BadgeCheck className="ml-auto size-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSwitchContext("COMAPNY")}>
                    <Wheat />
                    Salam
                    {context === "COMAPNY" && <BadgeCheck className="ml-auto size-4 text-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings/profile" })}>
                <User />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
