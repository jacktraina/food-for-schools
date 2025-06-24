import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <div className="flex items-center">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="mx-2 h-4 w-4 text-gray-400 flex-shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-900">{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
