import axios, { AxiosInstance } from 'axios'

export const API_BASE_URL = 'http://localhost:8000'

export interface GenerateParams {
  prompt: string
  model: 'dev' | 'schnell'
  width: number
  height: number
  batch_size: number
  steps: number
  noise_seed?: number
}

export interface QueueStatus {
  queue_pending: number
  queue_running: number
}

class ImageApi {
  private axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    })
  }

  async getImages(): Promise<string[]> {
    const response = await this.axiosInstance.get('/images')
    return response.data.images
  }

  async checkHealth(): Promise<void> {
    await this.axiosInstance.get('/health')
  }

  async getQueueStatus(): Promise<QueueStatus> {
    const response = await this.axiosInstance.get('/queue')
    return response.data
  }

  async generateImage(params: GenerateParams): Promise<void> {
    const endpoint = params.model === 'dev' ? '/dev/generate' : '/schnell/generate'
    await this.axiosInstance.post(endpoint, params)
  }

  async generateBulkImages(bulkParams: any): Promise<void> {
    const endpoint = '/dev/generate/bulk' // Assuming bulk generation is only for dev model
    await this.axiosInstance.post(endpoint, bulkParams)
  }

  async deleteImage(imageName: string): Promise<void> {
    await this.axiosInstance.delete(`/images/${imageName}`)
  }

  async downloadImage(imageName: string): Promise<Blob> {
    const response = await this.axiosInstance.get(`/images/download/${imageName}`, {
      responseType: 'blob'
    })
    return response.data
  }

  async downloadAllImages(): Promise<Blob> {
    const response = await this.axiosInstance.get('/images/download_all', {
      responseType: 'blob'
    })
    return response.data
  }

  async deleteAllImages(): Promise<void> {
    await this.axiosInstance.delete('/images/all')
  }
}

export const imageApi = new ImageApi()