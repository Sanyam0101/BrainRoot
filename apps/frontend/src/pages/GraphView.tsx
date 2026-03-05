import { useState, useEffect, useCallback, useMemo } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    BackgroundVariant,
    Handle,
    Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import api from '../services/api'
import { Network, RefreshCw } from 'lucide-react'

/* ── Custom Node Components ─────────────────────────── */
function IdeaNodeComponent({ data }: any) {
    return (
        <div style={{
            background: '#7c3aed',
            color: '#fff',
            borderRadius: '12px',
            padding: '8px 16px',
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 0 0 2px rgba(167,139,250,0.3), 0 6px 20px rgba(124,58,237,0.4)',
            maxWidth: '160px',
            textAlign: 'center',
            cursor: 'grab',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }}>
            <Handle type="target" position={Position.Top} style={{ background: '#a78bfa', border: 'none', width: 6, height: 6 }} />
            💡 {data.label}
            <Handle type="source" position={Position.Bottom} style={{ background: '#a78bfa', border: 'none', width: 6, height: 6 }} />
        </div>
    )
}

function TagNodeComponent({ data }: any) {
    return (
        <div style={{
            background: '#059669',
            color: '#fff',
            borderRadius: '999px',
            padding: '5px 16px',
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 0 0 2px rgba(52,211,153,0.3), 0 6px 20px rgba(5,150,105,0.4)',
            maxWidth: '140px',
            textAlign: 'center',
            cursor: 'grab',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }}>
            <Handle type="target" position={Position.Top} style={{ background: '#34d399', border: 'none', width: 6, height: 6 }} />
            🏷 {data.label}
            <Handle type="source" position={Position.Bottom} style={{ background: '#34d399', border: 'none', width: 6, height: 6 }} />
        </div>
    )
}

/* ── Force layout ──────────────────────────────────── */
function forceLayout(nodes: any[], edges: any[], W = 1500, H = 1000) {
    const pos: Record<string, { x: number; y: number; vx: number; vy: number }> = {}
    const tags = nodes.filter(n => n.t === 'tag')
    const ideas = nodes.filter(n => n.t === 'idea')

    ideas.forEach((n, i) => {
        const a = (2 * Math.PI * i) / (ideas.length || 1)
        pos[n.id] = { x: W / 2 + 200 * Math.cos(a), y: H / 2 + 180 * Math.sin(a), vx: 0, vy: 0 }
    })
    tags.forEach((n, i) => {
        const a = (2 * Math.PI * i) / (tags.length || 1) + 0.3
        pos[n.id] = { x: W / 2 + 400 * Math.cos(a), y: H / 2 + 340 * Math.sin(a), vx: 0, vy: 0 }
    })

    const k = Math.sqrt((W * H) / Math.max(nodes.length, 1)) * 1.4
    let temp = W / 3
    for (let i = 0; i < 120; i++) {
        for (let a = 0; a < nodes.length; a++) {
            for (let b = a + 1; b < nodes.length; b++) {
                const pa = pos[nodes[a].id], pb = pos[nodes[b].id]
                const dx = pa.x - pb.x, dy = pa.y - pb.y
                const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
                const f = (k * k) / d
                pa.vx += (dx / d) * f; pa.vy += (dy / d) * f
                pb.vx -= (dx / d) * f; pb.vy -= (dy / d) * f
            }
        }
        edges.forEach(e => {
            const pa = pos[e.s], pb = pos[e.t]
            if (!pa || !pb) return
            const dx = pa.x - pb.x, dy = pa.y - pb.y
            const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1)
            const f = (d * d) / k
            pa.vx -= (dx / d) * f; pa.vy -= (dy / d) * f
            pb.vx += (dx / d) * f; pb.vy += (dy / d) * f
        })
        nodes.forEach(n => {
            const p = pos[n.id]
            const d = Math.max(Math.sqrt(p.vx * p.vx + p.vy * p.vy), 1)
            p.x += (p.vx / d) * Math.min(d, temp)
            p.y += (p.vy / d) * Math.min(d, temp)
            p.x = Math.max(100, Math.min(W - 100, p.x))
            p.y = Math.max(100, Math.min(H - 100, p.y))
            p.vx = 0; p.vy = 0
        })
        temp *= 0.96
    }
    return Object.fromEntries(Object.entries(pos).map(([k, v]) => [k, { x: v.x, y: v.y }]))
}

/* ── Main Component ────────────────────────────────── */
export default function GraphView() {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ ideas: 0, tags: 0, edges: 0 })

    // MUST memoize nodeTypes outside of render to prevent re-registration
    const nodeTypes = useMemo(() => ({
        idea: IdeaNodeComponent,
        tag: TagNodeComponent,
    }), [])

    const fetchGraph = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/graph/all')
            const rawN = res.data.nodes || []
            const rawE = res.data.edges || []

            const nds = rawN.map((n: any) => ({
                id: String(n.internal_id),
                t: n.label === 'Idea' ? 'idea' : 'tag',
                title: n.title || n.label || '?',
            }))
            const eds = rawE.map((e: any) => ({ s: String(e.source), t: String(e.target) }))
            const positions = forceLayout(nds, eds)

            setNodes(nds.map((n: any) => ({
                id: n.id,
                type: n.t,
                position: positions[n.id] || { x: 400, y: 400 },
                draggable: true,
                data: { label: n.title },
            })))

            setEdges(eds.map((e: any, i: number) => ({
                id: `e${i}`,
                source: e.s,
                target: e.t,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#334155', strokeWidth: 1.5 },
                markerEnd: { type: MarkerType.ArrowClosed, width: 8, height: 8, color: '#475569' },
            })))

            setStats({
                ideas: rawN.filter((n: any) => n.label === 'Idea').length,
                tags: rawN.filter((n: any) => n.label === 'Tag').length,
                edges: rawE.length,
            })
        } catch { /* skip */ } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchGraph() }, [fetchGraph])

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#7c3aed' }}>
                        <Network className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Graph</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.ideas} ideas · {stats.tags} tags · {stats.edges} connections
                        </p>
                    </div>
                </div>
                <button onClick={fetchGraph}
                    className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Graph */}
            <div className="flex-1 rounded-xl overflow-hidden relative" style={{ background: '#0c1222', border: '1px solid #1e293b' }}>
                <style>{`
                    .react-flow__node { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                    .react-flow__controls button { background: #1e293b !important; color: #94a3b8 !important; border-color: #334155 !important; }
                    .react-flow__controls button:hover { background: #334155 !important; }
                    .react-flow__controls button svg { fill: #94a3b8 !important; }
                `}</style>
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: '#0c1222' }}>
                        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #1e293b', borderTopColor: '#7c3aed' }} />
                        <p className="mt-3 text-sm text-gray-500">Loading graph...</p>
                    </div>
                ) : nodes.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: '#0c1222' }}>
                        <Network className="w-12 h-12 text-gray-800 mb-3" />
                        <p className="text-sm text-gray-500">Add notes with tags to see connections</p>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.25, maxZoom: 1.3 }}
                        minZoom={0.05}
                        maxZoom={4}
                        proOptions={{ hideAttribution: true }}
                        style={{ background: '#0c1222' }}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1a2740" />
                        <Controls showInteractive={false} />
                        <MiniMap
                            nodeColor={(n: any) => n.type === 'tag' ? '#10b981' : '#8b5cf6'}
                            maskColor="rgba(0,0,0,0.85)"
                            style={{ background: '#0c1222', borderRadius: '10px', border: '1px solid #1e293b' }}
                        />
                    </ReactFlow>
                )}
            </div>
        </div>
    )
}
