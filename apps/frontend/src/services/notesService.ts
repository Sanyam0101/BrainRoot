import api from './api'

export interface Note {
  id: string
  user_id: string
  content: string
  tags: string[]
  created_at: string
  similarity_score?: number
}

export interface NoteCreate {
  content: string
  tags?: string[]
}

export interface NoteUpdate {
  content?: string
  tags?: string[]
}

export const notesService = {
  getAll: async (limit: number = 50, offset: number = 0): Promise<Note[]> => {
    const response = await api.get('/notes/', { params: { limit, offset } })
    return response.data
  },

  getById: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`)
    return response.data
  },

  create: async (data: NoteCreate): Promise<Note> => {
    const response = await api.post('/notes/', data)
    return response.data
  },

  upload: async (file: File, tags: string): Promise<Note> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tags', tags)
    const response = await api.post('/notes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  update: async (id: string, data: NoteUpdate): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`)
  },

  search: async (query: string, limit: number = 10): Promise<Note[]> => {
    const response = await api.get('/notes/search', {
      params: { q: query, limit },
    })
    return response.data
  },
}
