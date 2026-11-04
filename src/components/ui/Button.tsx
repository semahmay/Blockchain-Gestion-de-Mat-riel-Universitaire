import type { ButtonHTMLAttributes, ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'soft'
  | 'danger'
  | 'dangerSoft'
  | 'white'
  | 'light'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const baseStyles =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-900 text-white shadow-sm hover:bg-brand-800 active:bg-brand-950',
  secondary:
    'border border-line bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  soft: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  dangerSoft: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  white: 'bg-white text-brand-900 shadow-sm hover:bg-brand-50',
  light: 'border border-white/20 bg-white/10 text-white hover:bg-white/15',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'size-9 p-0',
}

function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...props} />
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function ButtonLink({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonStyles(variant, size, className)} {...props} />
}
