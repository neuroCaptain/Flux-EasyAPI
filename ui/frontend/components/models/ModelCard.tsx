import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Download, Server, ExternalLink } from "lucide-react"
import Link from 'next/link'
import { ModelSchema } from '@/services/api'
import { StatusBadge } from './StatusBadge'

interface ModelCardProps {
  model: ModelSchema
  onDownload: (modelName: string) => void
  onDelete: (modelName: string) => void
}

export function ModelCard({ model, onDownload, onDelete }: ModelCardProps) {
  return (
    <Card className="mb-4">
      <CardContent className="flex justify-between items-center p-4">
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg font-medium">{model.model}</h3>
          <Link
            href={model.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <span className="truncate max-w-[200px]">{model.url}</span>
            <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
          </Link>
          <div className="mt-1">
            <StatusBadge status={model.is_installed} />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Server className="h-5 w-5 text-muted-foreground" />
          {model.is_installed === 'not installed' && (
            <Button
              size="sm"
              onClick={() => onDownload(model.model)}
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          )}
          {model.is_installed === 'installed' && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(model.model)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          {model.is_installed === 'installing' && (
            <Button size="sm" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Installing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}