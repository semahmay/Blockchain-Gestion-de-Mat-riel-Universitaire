import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useApp } from '../../context/useApp'
import type { ToastVariant } from '../../types'
import { cn } from '../../lib/utils'

const variants: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconClass: string; barClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'bg-emerald-50 text-emerald-600',
    barClass: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconClass: 'bg-red-50 text-red-600',
    barClass: 'bg-red-500',
  },
  info: {
    icon: Info,
    iconClass: 'bg-sky-50 text-sky-600',
    barClass: 'bg-sky-500',
  },
}

export function ToastViewport() {
  const { toasts, dismissToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex flex-col items-end gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-full sm:max-w-sm"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const config = variants[toast.variant]
        const Icon = config.icon

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto relative flex w-full animate-slide-in-right gap-3 overflow-hidden rounded-2xl border border-line bg-white p-4 pr-10 shadow-lift"
          >
            <span className={cn('absolute inset-y-0 left-0 w-1', config.barClass)} />
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-xl',
                config.iconClass,
              )}
            >
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              {toast.message ? (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{toast.message}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fermer la notification"
              className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
