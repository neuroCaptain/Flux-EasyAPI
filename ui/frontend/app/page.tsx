'use client'

import { ImageGeneratorComponent } from '@/components/ImageGenerator'
import { useContext } from 'react'
import { ApiHealthContext } from '@/contexts/ApiHealthContext'

export default function Home() {
  const apiHealth = useContext(ApiHealthContext)
  return <ImageGeneratorComponent apiHealth={apiHealth} />
}