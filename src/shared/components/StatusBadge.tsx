import { BadgeStyles } from "../types/enums"

const getBadgeThemeFromText = (text: string) => {
  switch (text) {
    case "active":
      return BadgeStyles.OLD_GREEN
    case "inactive":
      return BadgeStyles.OLD_YELLOW
    case "PENDING":
      return BadgeStyles.YELLOW
    case "processing":
      return BadgeStyles.BLUE
    case "validating":
      return BadgeStyles.VIOLET
    case "completed":
      return BadgeStyles.GREEN
    case "failed":
      return BadgeStyles.RED
    case "cancelled":
      return BadgeStyles.GRAY
    case "rejected":
      return BadgeStyles.RED
    case "system":
      return BadgeStyles.VIOLET
    case "campany":
      return BadgeStyles.GREEN
    case "application":
      return BadgeStyles.BLUE
    case "fund_transfer":
      return BadgeStyles.BLUE
    case "true":
      return BadgeStyles.GREEN
    case "false":
      return BadgeStyles.YELLOW
    default:
      return BadgeStyles.GREEN
  }
}

type StatusBadgeProps = {
  text: string
  theme?: BadgeStyles
  Icon?: React.ElementType
  t?: (key: string) => string
}

const StatusBadge = ({ text, theme, Icon, t }: StatusBadgeProps) => {
  const lowerText = text?.toLowerCase() || ""
  return (
    <div className={theme ? theme : getBadgeThemeFromText(lowerText)}>
      {lowerText == "true" && t ? t("statusBadges.true") : lowerText == "false" && t ? t("statusBadges.false") : text}
      {Icon && <Icon className="inline size-3.5 ml-1" />}
    </div>
  )
}

export default StatusBadge
