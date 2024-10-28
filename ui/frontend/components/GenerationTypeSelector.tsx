'use client'

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface GenerationTypeSelectorProps {
  generationType: 'single' | 'bulk'
  setGenerationType: (type: 'single' | 'bulk') => void
  model: 'dev' | 'schnell'
  onModelChange: (model: 'dev' | 'schnell') => void
}


export function GenerationTypeSelector({ generationType, setGenerationType, model, onModelChange }: GenerationTypeSelectorProps) {
  return (
    <div className="flex justify-between items-center mb-6">
        <RadioGroup
        value={generationType}
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
      <div className="flex items-center space-x-4">
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dev">Dev Model</SelectItem>
            <SelectItem value="schnell">Schnell Model</SelectItem>
          </SelectContent>
        </Select>
    </div>
    </div>

  )
}