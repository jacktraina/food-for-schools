import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>

      <Card>
        <CardHeader className="pb-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-72 bg-gray-200 rounded animate-pulse mt-2"></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            <div className="flex p-4 border-b">
              <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse ml-8"></div>
              <div className="h-6 w-64 bg-gray-200 rounded animate-pulse ml-8"></div>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex p-4 border-b">
                <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse ml-8"></div>
                <div className="h-6 w-64 bg-gray-200 rounded animate-pulse ml-8"></div>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse ml-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
