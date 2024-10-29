import { ModelInstalledStatus } from '@/services/api'

interface StatusBadgeProps {
  status: ModelInstalledStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'installed':
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Installed
        </span>
      )
    case 'not installed':
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Not Installed
        </span>
      )
    case 'installing':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          Installing
        </span>
      )
  }
}