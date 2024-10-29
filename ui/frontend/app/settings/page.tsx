'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { imageApi, ModelSchema } from '@/services/api'
import { ModelCard } from '@/components/models/ModelCard'
import { SkeletonCard } from '@/components/models/SkeletonCard'

const POLLING_INTERVAL = 5000 // 5 seconds

export default function ModelsPage() {
  const [models, setModels] = useState<ModelSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchModels = useCallback(async () => {
    try {
      const fetchedModels = await imageApi.getModels()
      setModels(prevModels => {
        const hasChanges = JSON.stringify(prevModels) !== JSON.stringify(fetchedModels)
        if (hasChanges) {
          toast({
            title: "Models Updated",
            description: "The status of one or more models has changed.",
          })
        }
        return fetchedModels
      })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch models:', err)
      setError('Failed to fetch models')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchModels()
    const intervalId = setInterval(fetchModels, POLLING_INTERVAL)
    return () => clearInterval(intervalId)
  }, [fetchModels])

  const handleDownload = async (modelName: string) => {
    try {
      await imageApi.downloadModel(modelName)
      toast({
        title: "Success",
        description: `Model ${modelName} download started.`,
      })
      fetchModels() // Refresh the model list immediately
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to start download for model ${modelName}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (modelName: string) => {
    try {
      await imageApi.deleteModel(modelName)
      toast({
        title: "Success",
        description: `Model ${modelName} deleted successfully.`,
      })
      fetchModels() // Refresh the model list immediately
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to delete model ${modelName}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Available Models</h1>
      <div className="space-y-4">
        {loading
          ? Array(4).fill(0).map((_, index) => <SkeletonCard key={index} />)
          : models.map((model) => (
              <ModelCard
                key={model.model}
                model={model}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))
        }
      </div>
    </div>
  )
}