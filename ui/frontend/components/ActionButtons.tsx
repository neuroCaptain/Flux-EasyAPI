'use client'

import { Button } from "@/components/ui/button"
import { Loader2, Download, Trash2, FileText } from "lucide-react"

interface ActionButtonsProps {
  handleDownloadAll: () => void
  handleDeleteAll: () => void
  isDownloadingAll: boolean
  imagesLength: number
  apiHealth: string
}

export function ActionButtons({
  handleDownloadAll,
  handleDeleteAll,
  isDownloadingAll,
  imagesLength,
  apiHealth
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col space-y-2 w-1/2">
      <Button 
        onClick={handleDownloadAll} 
        disabled={isDownloadingAll || imagesLength === 0 || apiHealth !== 'healthy'} 
        className="flex-1 bg-black text-white hover:bg-gray-800"
      >
        {isDownloadingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Download All Images
      </Button>
      <Button 
        onClick={handleDeleteAll} 
        disabled={imagesLength === 0 || apiHealth !== 'healthy'} 
        className="flex-1 bg-red-600 text-white hover:bg-red-700"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete All Images
      </Button>
      <Button 
        onClick={() => window.open('/docs', '_blank')} 
        className="flex-1 bg-green-600 text-white hover:bg-green-700"
      >
        <FileText className="mr-2 h-4 w-4" />
        Docs
      </Button>
    </div>
  )
}