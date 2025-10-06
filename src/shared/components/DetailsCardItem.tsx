import { ElementType, ReactNode } from "react"
import StatusBadge from "./StatusBadge"
import { BadgeStyles } from "../types/enums"

export type DetailsCardItemProps = {
  label: ReactNode
  value: string | ReactNode
  Icon?: ElementType
  isBadge?: boolean
  theme?: BadgeStyles
  onClick?: () => void
  shouldClick?: boolean
  className?: string
}

const DetailsCardItem = ({ label, value, Icon, isBadge, theme, onClick, shouldClick, className, ...props }: DetailsCardItemProps) => {
  return (
    <div onClick={() => onClick?.()} className={`grid grid-cols-7 ${className}`} {...props}>
      <div className="col-span-2 gap-x-2 text-xs py-1 text-gray-500 w-full flex justify-between items-center">
        <span className="pl-1 w-full text-wrap wrap-break-word">{label}</span>
        <span className="text-muted">:</span>
      </div>
      <div className="flex items-center gap-2 col-span-5 pl-2 text-[13px]">
        {Icon ? <Icon className="w-4 h-4 inline text-neutral" /> : <></>}
        {isBadge ? (
          <span className="py-1 md:py-0.5">{typeof value === "string" && <StatusBadge text={value} theme={theme} />}</span>
        ) : typeof value === "string" ? (
          <span className="w-full break-words">{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  )
}
export default DetailsCardItem
