'use client'

import { Card, CardContent } from "@/components/ui/card"

interface QueueStatusProps {
  queueStatus: { queue_pending: number; queue_running: number } | null
}

export function QueueStatus({ queueStatus }: QueueStatusProps) {
  return (
    <Card className="w-1/2 flex flex-col justify-between">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Queue Status</h2>
        {queueStatus ? (
          <>
            <p>Queue Size: {queueStatus.queue_pending}</p>
            <p>Active Workers: {queueStatus.queue_running}</p>
          </>
        ) : (
          <p>Loading queue status...</p>
        )}
      </CardContent>
    </Card>
  )
}