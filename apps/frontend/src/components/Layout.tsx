import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Network,
  Bot,
  Plug,
  BrainCircuit,
  Settings
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle dark mode reading and storing
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    if (isDark) document.documentElement.classList.add('dark')

    // Listen for scroll to add blurred header effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
    if (newDarkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Graph View', href: '/graph', icon: Network },
    { name: 'AI Analyst', href: '/chat', icon: Bot },
    { name: 'Integrations', href: '/integrations', icon: Plug },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-500/30 overflow-x-hidden relative">

      {/* Animated Brain Neural Pattern Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-brain-pattern opacity-40 dark:opacity-[0.15] mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000" />
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-primary-500/20 dark:bg-primary-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] mix-blend-screen" />
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r border-slate-200/50 dark:border-slate-800/80 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] lg:translate-x-0 shadow-2xl lg:shadow-none bg-white/60 dark:bg-[#0F172A]/80 flex flex-col`}>

        {/* Logo Section */}
        <div className="flex items-center justify-between h-20 px-6 mt-2 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30 ring-1 ring-white/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">Second Brain</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary-600 dark:text-primary-400 opacity-80 mt-0.5">Neural Hub</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto z-10">
          <div className="mb-4 px-3">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Main Menu</p>
          </div>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                    ? 'text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                {/* Active link gradient background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-indigo-600 opacity-100" />
                )}

                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-[0_0_10px_2px_rgba(255,255,255,0.3)]" />
                )}

                <item.icon className={`w-5 h-5 mr-3.5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                <span className={`font-medium relative z-10 tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-5 mx-4 mb-6 rounded-2xl glass-panel bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center shadow-inner text-white font-bold text-sm ring-2 ring-white dark:ring-slate-800">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {user?.full_name || 'Neural User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
            <button
              onClick={toggleDarkMode}
              className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center justify-center group"
              title="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
              ) : (
                <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>
            <button className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="flex-1 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all flex items-center justify-center"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content wrapper */}
      <div className="lg:pl-72 relative z-10 min-h-screen flex flex-col transition-all duration-300">

        {/* Mobile Top Header */}
        <div className={`sticky top-0 z-30 lg:hidden transition-all duration-300 ${scrolled ? 'glass-panel bg-white/70 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/80 shadow-md' : 'bg-transparent'}`}>
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-slate-700">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary-500" />
              <h1 className="text-lg font-bold">Second Brain</h1>
            </div>
            <div className="w-9 h-9 opacity-0 pointer-events-none" /> {/* Spacer */}
          </div>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-500">
          <Outlet />
        </main>

        {/* Subtle Footer */}
        <footer className="mt-auto py-6 px-8 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/30 dark:border-slate-800/30">
          <p>Powered by Next-Gen Neural Connectivity &bull; Second Brain v1.0</p>
        </footer>
      </div>
    </div>
  )
}
