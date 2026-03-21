import { create } from 'zustand'
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios'
import { supabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface UploadItem {
  id: string
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error' | 'cancelled'
  url?: string
  error?: string
  cancelToken?: CancelTokenSource
}

interface UploadState {
  uploads: Record<string, UploadItem>
  addUpload: (file: File, bucket?: string) => Promise<string>
  cancelUpload: (id: string) => void
  removeUpload: (id: string) => void
  clearCompleted: () => void
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: {},

  addUpload: async (file: File, bucket = 'books') => {
    const id = Math.random().toString(36).substring(7)
    const fileName = file.name
    const cancelToken = axios.CancelToken.source()

    set((state) => ({
      uploads: {
        ...state.uploads,
        [id]: { id, fileName, progress: 0, status: 'uploading', cancelToken },
      },
    }))

    // We still return the promise for those who want to await it, 
    // but the ID is available via the return value of the promise immediately? 
    // Wait, let's just make it return the ID synchronously if possible, or return the ID from the promise quickly.
    
    const startUpload = async () => {
      try {
        const fileExt = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        const { data: { session } } = await supabaseClient.auth.getSession()
        const token = session?.access_token || supabaseKey
        const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`

        await axios.post(uploadUrl, file, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseKey,
            'Content-Type': file.type,
            'x-upsert': 'true'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              set((state) => ({
                uploads: {
                  ...state.uploads,
                  [id]: { ...state.uploads[id], progress: percentCompleted }
                }
              }))
            }
          },
          cancelToken: cancelToken.token
        })

        const { data: { publicUrl } } = supabaseClient.storage.from(bucket).getPublicUrl(path)

        set((state) => ({
          uploads: {
            ...state.uploads,
            [id]: { ...state.uploads[id], status: 'completed', progress: 100, url: publicUrl },
          },
        }))
      } catch (error: any) {
        if (axios.isCancel(error)) {
          set((state) => ({
            uploads: {
              ...state.uploads,
              [id]: { ...state.uploads[id], status: 'cancelled' },
            },
          }))
        } else {
          console.error('Upload error:', error)
          set((state) => ({
            uploads: {
              ...state.uploads,
              [id]: { ...state.uploads[id], status: 'error', error: error.message },
            },
          }))
          toast.error(`فشل رفع "${fileName}"`)
        }
      }
    }

    startUpload()
    return id
  },

  cancelUpload: (id: string) => {
    const upload = get().uploads[id]
    if (upload?.cancelToken) {
      upload?.cancelToken.cancel('User cancelled upload')
    }
    set((state) => ({
      uploads: {
        ...state.uploads,
        [id]: { ...state.uploads[id], status: 'cancelled' },
      },
    }))
  },

  removeUpload: (id: string) => {
    set((state) => {
      const newUploads = { ...state.uploads }
      delete newUploads[id]
      return { uploads: newUploads }
    })
  },

  clearCompleted: () => {
    set((state) => {
      const newUploads = { ...state.uploads }
      Object.keys(newUploads).forEach((id) => {
        if (newUploads[id].status === 'completed') {
          delete newUploads[id]
        }
      })
      return { uploads: newUploads }
    })
  },
}))
