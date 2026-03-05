import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesService, Note } from '../services/notesService'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Editor from '@monaco-editor/react'

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')

  const { data: note, isLoading } = useQuery<Note>({
    queryKey: ['notes', id],
    queryFn: () => notesService.getById(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (note) {
      setContent(note.content)
      setTags(note.tags.join(', '))
    }
  }, [note])

  const updateMutation = useMutation({
    mutationFn: (data: { content: string; tags: string[] }) =>
      notesService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['notes', id] })
      setIsEditing(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => notesService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      navigate('/notes')
    },
  })

  const handleSave = () => {
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t)
    updateMutation.mutate({
      content,
      tags: tagArray,
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading note...</div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Note not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/notes')}
          className="btn btn-secondary flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="btn btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setContent(note.content)
                  setTags(note.tags.join(', '))
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn btn-secondary text-red-600 dark:text-red-400 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <div className="h-[400px] border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="markdown"
                  theme="vs-dark"
                  value={content}
                  onChange={(value) => setContent(value || '')}
                  options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    padding: { top: 16, bottom: 16 }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-gray-100">
                {note.content}
              </pre>
            </div>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
              Created: {new Date(note.created_at).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

