import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { notesService } from '../services/notesService'
import NoteCard from '../components/NoteCard'
import { Plus, Search, Upload, FileText, Lightbulb, X, Sparkles, Brain, Tag } from 'lucide-react'
import Editor from '@monaco-editor/react'

type TabType = 'all' | 'ideas' | 'uploaded'

const ACCEPTED_TYPES = '.pdf,.csv,.txt,.md,.docx'

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSemanticSearch, setIsSemanticSearch] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')
  const [noteType, setNoteType] = useState<'note' | 'idea'>('note')
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTags, setUploadTags] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const limit = 12
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', page],
    queryFn: () => notesService.getAll(limit, (page - 1) * limit),
  })

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['notes', 'search', searchQuery],
    queryFn: () => notesService.search(searchQuery),
    enabled: searchQuery.length > 2 && isSemanticSearch,
  })

  const createMutation = useMutation({
    mutationFn: notesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setShowCreateForm(false)
      setNewNoteContent('')
      setNewNoteTags('')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file, tags }: { file: File; tags: string }) =>
      notesService.upload(file, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setShowUploadForm(false)
      setUploadFile(null)
      setUploadTags('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: notesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = newNoteTags.split(',').map(t => t.trim()).filter(t => t)
    if (noteType === 'idea') {
      tags.push('idea')
    }
    createMutation.mutate({
      content: noteType === 'idea' ? `💡 ${newNoteContent}` : newNoteContent,
      tags,
    })
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadFile) {
      uploadMutation.mutate({ file: uploadFile, tags: uploadTags })
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) setUploadFile(file)
  }

  // Filter notes by tab
  const filterNotes = (noteList: any[]) => {
    if (activeTab === 'ideas') return noteList.filter(n => n.tags?.includes('idea') || n.content?.startsWith('💡'))
    if (activeTab === 'uploaded') return noteList.filter(n => n.tags?.includes('uploaded'))
    return noteList
  }

  const displayNotes = isSemanticSearch && searchQuery.length > 2 ? searchResults : notes
  const filteredNotes = displayNotes ? filterNotes(displayNotes) : []
  const isLoadingNotes = isSemanticSearch ? isSearching : isLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary-500" />
            Knowledge Base
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Notes, ideas, and uploaded documents — all semantically searchable
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowUploadForm(!showUploadForm); setShowCreateForm(false) }}
            className="btn btn-secondary flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setShowUploadForm(false) }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {[
          { key: 'all', label: 'All Notes', icon: FileText },
          { key: 'ideas', label: 'Ideas', icon: Lightbulb },
          { key: 'uploaded', label: 'Uploaded', icon: Upload },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={isSemanticSearch ? "🧠 Semantic search — find by meaning..." : "Filter notes by keyword..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 pr-4"
          />
        </div>
        <button
          onClick={() => setIsSemanticSearch(!isSemanticSearch)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${isSemanticSearch
              ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-purple-300'
            }`}
        >
          <Sparkles className={`w-4 h-4 ${isSemanticSearch ? 'text-purple-500' : ''}`} />
          AI Search
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 shadow-sm">
          <form onSubmit={handleUpload} className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="text-center py-8 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              {uploadFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{uploadFile.name}</span>
                  <span className="text-sm text-gray-500">({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setUploadFile(null) }}>
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Drop a file here or click to browse</p>
                  <p className="text-sm text-gray-500 mt-1">Supports PDF, CSV, TXT, Markdown, DOCX (max 10MB)</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                className="hidden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Tag className="w-4 h-4 inline mr-1" />Tags (comma-separated)
              </label>
              <input
                type="text"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                className="input"
                placeholder="research, notes, project..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!uploadFile || uploadMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload & Embed'}
              </button>
              <button type="button" onClick={() => { setShowUploadForm(false); setUploadFile(null) }} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Note vs Idea toggle */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setNoteType('note')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${noteType === 'note' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}
              >
                <FileText className="w-4 h-4" /> Note
              </button>
              <button
                type="button"
                onClick={() => setNoteType('idea')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${noteType === 'idea' ? 'bg-amber-50 dark:bg-amber-900/30 shadow-sm text-amber-700 dark:text-amber-400' : 'text-gray-500'
                  }`}
              >
                <Lightbulb className="w-4 h-4" /> Idea
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {noteType === 'idea' ? '💡 Describe your idea' : '📝 Content'}
              </label>
              <div className="h-[200px] border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="markdown"
                  theme="vs-dark"
                  value={newNoteContent}
                  onChange={(value) => setNewNoteContent(value || '')}
                  options={{
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    padding: { top: 12, bottom: 12 },
                    fontSize: 14
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Tag className="w-4 h-4 inline mr-1" />Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newNoteTags}
                onChange={(e) => setNewNoteTags(e.target.value)}
                className="input"
                placeholder={noteType === 'idea' ? "brainstorm, concept, feature..." : "tag1, tag2, tag3..."}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={createMutation.isPending}>
                {noteType === 'idea' ? <Lightbulb className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {createMutation.isPending ? 'Creating...' : noteType === 'idea' ? 'Save Idea' : 'Create Note'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setNewNoteContent(''); setNewNoteTags('') }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes Grid */}
      {isLoadingNotes ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">{isSemanticSearch ? 'Searching semantically...' : 'Loading notes...'}</p>
          </div>
        </div>
      ) : filteredNotes && filteredNotes.length > 0 ? (
        <>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {filteredNotes.length} {activeTab === 'ideas' ? 'ideas' : activeTab === 'uploaded' ? 'uploaded documents' : 'notes'} found
            {isSemanticSearch && searchQuery.length > 2 && ' (semantic search)'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => deleteMutation.mutate(note.id)}
                onClick={() => navigate(`/notes/${note.id}`)}
              />
            ))}
          </div>

          {!isSemanticSearch && !searchQuery && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                className="btn btn-secondary px-6"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Page {page}
              </span>
              <button
                className="btn btn-secondary px-6"
                onClick={() => setPage(p => p + 1)}
                disabled={(displayNotes?.length || 0) < limit}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center py-16 shadow-sm">
          {activeTab === 'ideas' ? (
            <>
              <Lightbulb className="w-16 h-16 mx-auto text-amber-400 mb-4" />
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No ideas yet</p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Capture your ideas — they'll be embedded and searchable with AI.</p>
              <button onClick={() => { setShowCreateForm(true); setNoteType('idea') }} className="btn btn-primary">
                <Lightbulb className="w-4 h-4 mr-2 inline" /> New Idea
              </button>
            </>
          ) : activeTab === 'uploaded' ? (
            <>
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No uploaded documents</p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Upload PDFs, CSVs, DOCX files to add them to your knowledge base.</p>
              <button onClick={() => setShowUploadForm(true)} className="btn btn-primary">
                <Upload className="w-4 h-4 mr-2 inline" /> Upload File
              </button>
            </>
          ) : (
            <>
              <Brain className="w-16 h-16 mx-auto text-primary-400 mb-4" />
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchQuery ? 'No notes found' : 'Start building your knowledge base'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? 'Try different keywords or toggle AI Search.' : 'Add notes, ideas, or upload documents to get started.'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
