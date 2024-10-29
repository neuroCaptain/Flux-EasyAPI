import { createContext } from 'react'
import { ApiHealth } from '@/components/Header'

export const ApiHealthContext = createContext<ApiHealth>('unknown')