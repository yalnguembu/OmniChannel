import React from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/shared/components/ui/breadcrumb"
import { BreadcrumbItem as BreadcrumbItemType } from "@/shared/types/components"
import { Home } from "lucide-react"
import { Link } from "@tanstack/react-router"

interface BreadcrumbNavigationProps {
  breadcrumbs: BreadcrumbItemType[]
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ breadcrumbs }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Home className="inline size-4" />
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href} className="hover:underline decoration-accent font-medium hover:bg-accent/20 rounded px-1 py-0.5 hover:text-accent">
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="font-semibold">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
