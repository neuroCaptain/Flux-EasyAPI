import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <Card className="mb-4">
      <CardContent className="flex justify-between items-center p-4">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-5 w-[100px]" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </CardContent>
    </Card>
  )
}