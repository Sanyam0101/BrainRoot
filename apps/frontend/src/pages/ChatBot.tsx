import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, Database, Network, Clock, Loader2, Brain } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import ReactMarkdown from 'react-markdown'

interface ContextItem {
    content: string
    tags: string[]
    similarity: number | null
}

interface AnalystResponse {
    query: string
    answer: string
    context_items: ContextItem[]
    graph_connections: any[]
    processing_time_ms: number
    total_notes_scanned: number
}

interface ChatMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    metadata?: {
        processing_time_ms?: number
        context_count?: number
        graph_count?: number
        total_scanned?: number
    }
}

export default function ChatBot() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'system',
            content: '🧠 **Second Brain AI Analyst** is ready.\n\nAsk me anything about your notes, ideas, tags, or knowledge graph. I use semantic vector search and graph traversal to find and synthesize answers from your personal knowledge base.',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data: stats } = useQuery({
        queryKey: ['analyst-stats'],
        queryFn: async () => {
            const res = await api.get('/analyst/stats')
            return res.data
        },
        refetchInterval: 30000
    })

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            const res = await api.post('/analyst/ask', {
                query: userMsg.content,
                limit: 5
            })
            const data: AnalystResponse = res.data

            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                timestamp: new Date(),
                metadata: {
                    processing_time_ms: data.processing_time_ms,
                    context_count: data.context_items.length,
                    graph_count: data.graph_connections.length,
                    total_scanned: data.total_notes_scanned
                }
            }
            setMessages(prev => [...prev, assistantMsg])
        } catch (err: any) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `❌ **Error:** ${err.response?.data?.detail || 'Failed to reach the AI Analyst. Check that the API container is running.'}`,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Data Analyst</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Powered by Semantic Search + Knowledge Graph
                        </p>
                    </div>
                </div>
                {stats && (
                    <div className="hidden md:flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
                            <Database className="w-3.5 h-3.5" />
                            {stats.total_notes} Notes
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-100 dark:border-green-800">
                            <Sparkles className="w-3.5 h-3.5" />
                            {stats.unique_tags?.length || 0} Tags
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full border border-purple-100 dark:border-purple-800">
                            <Network className="w-3.5 h-3.5" />
                            {stats.graph?.connections || 0} Connections
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white'
                                : msg.role === 'system'
                                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                            }`}>
                            {msg.role !== 'user' && (
                                <div className="flex items-center gap-2 mb-2">
                                    <Bot className="w-4 h-4 text-purple-500" />
                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">AI Analyst</span>
                                </div>
                            )}
                            <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            {msg.metadata && (
                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {msg.metadata.processing_time_ms?.toFixed(0)}ms
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Database className="w-3 h-3" />
                                        {msg.metadata.context_count} matches
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Network className="w-3 h-3" />
                                        {msg.metadata.graph_count} graph nodes
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm">
                            <div className="flex items-center gap-3 text-gray-500">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                                <span className="text-sm font-medium">Analyzing your knowledge base...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend() }}
                    className="flex items-center gap-3"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your notes, ideas, connections..."
                        className="input flex-1 py-3 text-base"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    )
}
