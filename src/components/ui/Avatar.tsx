import { cn } from '../../lib/utils'

const palettes = [
  'bg-brand-100 text-brand-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
]

const sizes = {
  sm: 'size-8 text-[11px]',
  md: 'size-10 text-xs',
  lg: 'size-14 text-base',
}

interface AvatarProps {
  name: string
  size?: keyof typeof sizes
  className?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const paletteIndex =
    name.split('').reduce((total, character) => total + character.charCodeAt(0), 0) %
    palettes.length

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        palettes[paletteIndex],
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}
