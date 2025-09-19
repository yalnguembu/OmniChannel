import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { FC, HTMLAttributes, ReactNode } from "react"

type ICardWrapper = {
  children: ReactNode
  action?: ReactNode
  headIcon?: ReactNode
  title?: string
  description?: string
  footer?: ReactNode | string
} & HTMLAttributes<HTMLDivElement>

const CardWrapper: FC<ICardWrapper> = ({ children, title, description, footer, action, ...props }) => {
  return (
    <Card className="flex flex-col" {...props}>
      <CardHeader className="items-center pb-0">
        {!!title && <CardTitle>{title}</CardTitle>}
        {!!description && <CardDescription>{description}</CardDescription>}
        {!!action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">{children}</CardContent>
      {!!footer && <CardFooter className="flex-col gap-2 text-sm">{footer}</CardFooter>}
    </Card>
  )
}

export default CardWrapper
