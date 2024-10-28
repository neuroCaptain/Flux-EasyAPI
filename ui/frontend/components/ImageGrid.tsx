'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash2 } from "lucide-react"
import { API_BASE_URL } from "@/services/api"

interface ImageGridProps {
  images: string[]
  apiHealth: string
  handleDownload: (imageName: string) => void
  handleDelete: (imageName: string) => void
  setViewedImage: (imageName: string) => void
}

export function ImageGrid({
  images,
  apiHealth,
  handleDownload,
  handleDelete,
  setViewedImage
}: ImageGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <Card key={image} className="overflow-hidden">
          <CardContent className="p-4">
            <div 
              className="aspect-square bg-gray-100 mb-4 relative rounded-md overflow-hidden cursor-pointer"
              onClick={() => setViewedImage(image)}
            >
              <img src={`${API_BASE_URL}/images/${image}`} alt={image} className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium truncate">{image}</span>
              <div className="flex space-x-2">
                <Button size="icon" variant="outline" onClick={() => handleDownload(image)} disabled={apiHealth !== 'healthy'}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
                <Button size="icon" variant="outline" onClick={() => handleDelete(image)} disabled={apiHealth !== 'healthy'}>
                  <Trash2 className="h-4  w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}