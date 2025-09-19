import { Link } from "@tanstack/react-router"
import { SidebarHeader } from "../ui/sidebar"
import AppLogo from "@/assets/images/logo/icon.png"

const Header: React.FC = () => {
  return (
    <SidebarHeader className="group-data-[collapsible=icon]:p-0">
      <Link to="/" className="flex items-center gap-2 py-0">
        <div>
          <img src={AppLogo} title="FujiPay" className="size-7" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate font-medium text-primary text-lg">FujiSat Pay</span>
        </div>
      </Link>
    </SidebarHeader>
  )
}

export default Header
