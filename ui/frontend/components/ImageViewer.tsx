'use client'

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { API_BASE_URL } from "@/services/api"

interface ImageViewerProps {
  image: string
  onClose: () => void
}

export function ImageViewer({ image, onClose }: ImageViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-100">
      <div className="bg-white rounded-lg max-w-3xl w-full">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold">{image}</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="p-4">
          <img src={`${API_BASE_URL}/images/${image}`} alt={image} className="w-full h-auto rounded-md" />
        </div>
      </div>
    </div>
  )
}