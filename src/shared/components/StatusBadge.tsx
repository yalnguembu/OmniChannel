import { BadgeStyles } from "../types/enums"

const getBadgeThemeFromText = (text: string) => {
  switch (text.toLowerCase()) {
    case "active":
      return BadgeStyles.GREEN
    case "inactive":
      return BadgeStyles.YELLOW
    default:
      return BadgeStyles.GREEN
  }
}

type StatusBadgeProps = {
  text: string
  theme?: BadgeStyles
}

const StatusBadge = ({ text, theme }: StatusBadgeProps) => {
  return <div className={theme ? theme : getBadgeThemeFromText(text)}>{text?.toLowerCase()}</div>
}

export default StatusBadge
