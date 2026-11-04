import { ArrowLeft, Compass } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-10 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-brand-900 text-white shadow-lift">
        <Compass size={28} aria-hidden="true" />
      </span>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">
        Erreur 404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        Page introuvable
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        La page demandée n’existe pas ou a été déplacée. Utilisez la navigation pour revenir à la
        plateforme.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink to="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour au tableau de bord
        </ButtonLink>
        <ButtonLink to="/equipment" variant="secondary">
          Voir le matériel
        </ButtonLink>
      </div>
    </div>
  )
}
