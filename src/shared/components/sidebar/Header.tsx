import { Link } from "@tanstack/react-router"
import { SidebarHeader } from "../ui/sidebar"
import AppLogo from "@/assets/images/logo/icon.png"

const Header: React.FC = () => {
  return (
    <SidebarHeader>
      <Link to="/" className="flex items-center gap-2 px-2 py-0">
        <div>
          <img src={AppLogo} title="FujiPay" className="size-8" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold text-primary text-xl uppercase">FujiPay</span>
        </div>
      </Link>
    </SidebarHeader>
  )
}

export default Header
