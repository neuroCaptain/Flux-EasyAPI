'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Upload } from "lucide-react"
import { useRef } from 'react'

interface GenerationFormProps {
  generationType: 'single' | 'bulk'
  params: any
  setParams: (params: any) => void
  bulkJson: string
  setBulkJson: (json: string) => void
  handleGenerate: () => void
  isGenerating: boolean
  apiHealth: string
}

export function GenerationForm({
  generationType,
  params,
  setParams,
  bulkJson,
  setBulkJson,
  handleGenerate,
  
  isGenerating,
  apiHealth
}: GenerationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  )
}