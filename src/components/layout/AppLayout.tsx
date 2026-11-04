import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { ToastViewport } from '../ui/ToastViewport'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-[272px]">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-line bg-white/60 px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>CampusChain · Projet universitaire de gestion du prêt de matériel</p>
            <p className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} aria-hidden="true" />
              Frontend de démonstration · blockchain non connectée
            </p>
          </div>
        </footer>
      </div>

      <ToastViewport />
    </div>
  )
}
