'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Download, Trash2, X, CheckCircle, AlertTriangle, FileText, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const API_BASE_URL = 'http://localhost:8000' // Replace with your actual backend domain

interface GenerateParams {
  prompt: string
  model: 'dev' | 'schnell'
  width: number
  height: number
  batch_size: number
  steps: number
  noise_seed?: number
}

interface QueueStatus {
  queue_pending: number
  queue_running: number
}

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  })

  useEffect(() => {
    const pollImages = async () => {
      try {
        const response = await axiosInstance.get('/images')
        const newImages = response.data.images
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
        await axiosInstance.get('/health')
        setApiHealth('healthy')
        setError(null)
      } catch (error) {
        setApiHealth('unhealthy')
        setError('API is currently unavailable. Some features may not work.')
      }
    }

    const getQueueStatus = async () => {
      try {
        const response = await axiosInstance.get('/queue')
        setQueueStatus(response.data)
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
      const endpoint = params.model === 'dev' ? '/dev/generate' : '/schnell/generate'
      if (generationType === 'single') {
        await axiosInstance.post(endpoint, params)
      } else {
        // Handle bulk generation
        const bulkParams = JSON.parse(bulkJson)
        await axiosInstance.post(`${endpoint}/bulk`, bulkParams)
      }
      toast({
        title: "Image generation started",
        description: "Your image(s) are being generated. They will appear in the list when ready.",
        duration: 2500,
      })
    } catch (error) {
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
      await axiosInstance.delete(`/images/${imageName}`)
      setImages(images.filter(img => img !== imageName))
      toast({
        title: "Image deleted",
        description: `${imageName} has been deleted.`,
        duration: 2500,
      })
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
        ? error.response.data.detail
        : `Failed to delete ${imageName}. Please try again.`
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
      const response = await axiosInstance.get(`/images/download/${imageName}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
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
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
        ? error.response.data.detail
        : `Failed to download ${imageName}. Please try again.`
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
      const response = await axiosInstance.get('/images/download_all', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
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
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
        ? error.response.data.detail
        : "Failed to download all images. Please try again."
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
        await axiosInstance.delete('/images/all')
        setImages([])
        toast({
          title: "All images deleted",
          description: "All images have been successfully deleted.",
          duration: 2500,
        })
      } catch (error) {
        const errorMessage = axios.isAxiosError(error) && error.response?.data?.detail
          ? error.response.data.detail
          : "Failed to delete all images. Please try again."
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          setBulkJson(content)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold ">Flux-EasyAPI</h1>
        <div className="flex items-center space-x-4">
          <Select
            value={params.model}
            onValueChange={handleModelChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dev">Dev Model</SelectItem>
              <SelectItem value="schnell">Schnell Model</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">API Status:</span>
            {apiHealth === 'unknown' ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            ) : apiHealth === 'healthy' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Generation Type</Label>
        <RadioGroup
          defaultValue="single"
          onValueChange={(value) => setGenerationType(value as 'single' | 'bulk')}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single">Single Image</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bulk" id="bulk" />
            <Label htmlFor="bulk">Bulk Generation</Label>
          </div>
        </RadioGroup>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-6">
            {generationType === 'single' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Input
                    id="prompt"
                    placeholder="Enter prompt for image generation"
                    value={params.prompt}
                    onChange={(e) => setParams({...params, prompt: e.target.value})}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      min={64}
                      max={2048}
                      value={params.width}
                      onChange={(e) => setParams({...params, width: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      min={64}
                      max={2048}
                      value={params.height}
                      onChange={(e) => setParams({...params, height: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      min={1}
                      max={20}
                      value={params.batch_size}
                      onChange={(e) => setParams({...params, batch_size: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Steps: {params.steps}</Label>
                    <Slider
                      min={1}
                      max={50}
                      value={[params.steps]}
                      onValueChange={(value) => setParams({...params, steps: value[0]})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noiseSeed">Noise Seed (optional)</Label>
                    <Input
                      id="noiseSeed"
                      type="number"
                      placeholder="Random"
                      
                      value={params.noise_seed || ''}
                      onChange={(e) => setParams({...params, noise_seed: e.target.value ? parseInt(e.target.value) : undefined})}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulkJson">Bulk Generation JSON</Label>
                  <Textarea
                    id="bulkJson"
                    placeholder="Paste your JSON here"
                    value={bulkJson}
                    onChange={(e) => setBulkJson(e.target.value)}
                    className="w-full h-32"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload JSON File
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isGenerating || apiHealth !== 'healthy'} className="w-full">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Image{generationType === 'bulk' ? 's' : ''}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-between items-stretch mb-6 gap-4">
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

        <div className="flex flex-col space-y-2 w-1/2">
          <Button 
            onClick={handleDownloadAll} 
            disabled={isDownloadingAll || images.length === 0 || apiHealth !== 'healthy'} 
            className="flex-1 bg-black text-white hover:bg-gray-800"
          >
            {isDownloadingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download All Images
          </Button>
          <Button 
            onClick={handleDeleteAll} 
            disabled={images.length === 0 || apiHealth !== 'healthy'} 
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete All Images
          </Button>
          <Button 
            onClick={() => window.open('https://your-docs-url.com', '_blank')} 
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Docs
          </Button>
        </div>
      </div>

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

      {viewedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">{viewedImage}</h2>
              <Button size="icon" variant="ghost" onClick={() => setViewedImage(null)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="p-4">
              <img src={`${API_BASE_URL}/images/${viewedImage}`} alt={viewedImage} className="w-full h-auto rounded-md" />
            </div>
          </div>
        </div>
      )}

      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}