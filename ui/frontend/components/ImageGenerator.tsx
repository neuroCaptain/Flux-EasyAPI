'use client'

import axios from 'axios'
import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import { imageApi, GenerateParams, QueueStatus } from '../services/api'
import { Header } from './Header'
import { GenerationTypeSelector } from './GenerationTypeSelector'
import { GenerationForm } from './GenerationForm'
import { QueueStatus as QueueStatusComponent } from './QueueStatus'
import { ActionButtons } from './ActionButtons'
import { ImageGrid } from './ImageGrid'
import { ImageViewer } from './ImageViewer'
import { ErrorDialog } from './ErrorDialog'

const defaultSettings = {
  dev: {
    width: 1920,
    height: 1080,
    batch_size: 1,
    steps: 20
  },
  schnell: {
    width: 1920,
    height: 1080,
    batch_size: 1,
    steps: 4
  }
}

export function ImageGeneratorComponent() {
  const [params, setParams] = useState<GenerateParams>({
    prompt: '',
    model: 'dev',
    ...defaultSettings.dev
  })
  const [images, setImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)
  const [viewedImage, setViewedImage] = useState<string | null>(null)
  const [apiHealth, setApiHealth] = useState<'healthy' | 'unhealthy' | 'unknown'>('unknown')
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [generationType, setGenerationType] = useState<'single' | 'bulk'>('single')
  const [bulkJson, setBulkJson] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const pollImages = async () => {
      try {
        const newImages = await imageApi.getImages()
        if (newImages.length > images.length) {
          setImages(newImages)
          toast({
            title: "New images available",
            description: `${newImages.length - images.length} new image(s) have been added.`,
            duration: 2500,
          })
        }
      } catch (error) {
        console.error('Failed to fetch images:', error)
        setError('Failed to fetch images. Please try again later.')
      }
    }

    const checkHealth = async () => {
      try {
        await imageApi.checkHealth()
        setApiHealth('healthy')
        setError(null)
      } catch (error) {
        setApiHealth('unhealthy')
        setError('API is currently unavailable. Some features may not work.')
      }
    }

    const getQueueStatus = async () => {
      try {
        const status = await imageApi.getQueueStatus()
        setQueueStatus(status)
      } catch (error) {
        console.error('Failed to fetch queue status:', error)
        setError('Failed to fetch queue status. Please try again later.')
      }
    }

    const imageInterval = setInterval(pollImages, 5000)
    const healthInterval = setInterval(checkHealth, 30000)
    const queueInterval = setInterval(getQueueStatus, 10000)

    checkHealth()
    pollImages()
    getQueueStatus()

    return () => {
      clearInterval(imageInterval)
      clearInterval(healthInterval)
      clearInterval(queueInterval)
    }
  }, [images, toast])

  const handleModelChange = (model: 'dev' | 'schnell') => {
    setParams({
      ...params,
      model,
      ...defaultSettings[model]
    })
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      if (generationType === 'single') {
        await imageApi.generateImage(params)
      } else {
        const bulkParams = JSON.parse(bulkJson)
        await imageApi.generateBulkImages(bulkParams)
      }
      toast({
        title: "Image generation started",
        description: "Your image(s) are being generated. They will appear in the list when ready.",
        duration: 2500,
      })
    } catch (error) {
      console.error('Error generating image:', error)
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
        ? error.response.data.detail
        : "There was an error generating your image(s). Please try again."
      setError(errorMessage)
      setIsErrorDialogOpen(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async (imageName: string) => {
    try {
      await imageApi.deleteImage(imageName)
      setImages(images.filter(img => img !== imageName))
      toast({
        title: "Image deleted",
        description: `${imageName} has been deleted.`,
        duration: 2500,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${imageName}. Please try again.`
      setError(errorMessage)
      toast({
        title: "Deletion failed",
        description: errorMessage,
        variant: "destructive",
        duration: 2500,
      })
    }
  }

  const handleDownload = async (imageName: string) => {
    try {
      const blob = await imageApi.downloadImage(imageName)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', imageName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast({
        title: "Image downloaded",
        description: `${imageName} has been downloaded.`,
        duration: 2500,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to download ${imageName}. Please try again.`
      setError(errorMessage)
      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
        duration: 2500,
      })
    }
  }

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true)
    setError(null)
    try {
      const blob = await imageApi.downloadAllImages()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'all_images.zip')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast({
        title: "All images downloaded",
        description: "All images have been downloaded as a ZIP file.",
        duration: 2500,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to download all images. Please try again."
      setError(errorMessage)
      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
        duration: 2500,
      })
    } finally {
      setIsDownloadingAll(false)
    }
  }

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all images? This action cannot be undone.')) {
      try {
        await imageApi.deleteAllImages()
        setImages([])
        toast({
          title: "All images deleted",
          description: "All images have been successfully deleted.",
          duration: 2500,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete all images. Please try again."
        setError(errorMessage)
        toast({
          title: "Deletion failed",
          description: errorMessage,
          variant: "destructive",
          duration: 2500,
        })
      }
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Header apiHealth={apiHealth}/>
      <GenerationTypeSelector generationType={generationType} setGenerationType={setGenerationType} model={params.model} onModelChange={handleModelChange}/>
      <GenerationForm
        generationType={generationType}
        params={params}
        setParams={setParams}
        bulkJson={bulkJson}
        setBulkJson={setBulkJson}
        handleGenerate={handleGenerate}
        isGenerating={isGenerating}
        apiHealth={apiHealth}
      />
      <div className="flex justify-between items-stretch mb-6 gap-4">
        <QueueStatusComponent queueStatus={queueStatus} />
        <ActionButtons
          handleDownloadAll={handleDownloadAll}
          handleDeleteAll={handleDeleteAll}
          isDownloadingAll={isDownloadingAll}
          imagesLength={images.length}
          apiHealth={apiHealth}
        />
      </div>
      <ImageGrid
        images={images}
        apiHealth={apiHealth}
        handleDownload={handleDownload}
        handleDelete={handleDelete}
        setViewedImage={setViewedImage}
      />
      {viewedImage && (
        <ImageViewer image={viewedImage} onClose={() => setViewedImage(null)} />
      )}
      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        error={error}
      />
    </div>
  )
}