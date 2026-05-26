'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: React.ReactNode
}

export function MagneticButton({ variant = 'primary', children, className, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    ref.current.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`
  }

  const onMouseLeave = () => { if (ref.current) ref.current.style.transform = '' }

  const styles = {
    primary: 'bg-[hsl(var(--fg))] text-[hsl(var(--bg))] hover:shadow-[var(--shadow-md)]',
    secondary: 'border border-[hsl(var(--border-base))] text-[hsl(var(--fg-secondary))] hover:border-[hsl(var(--fg))] hover:text-[hsl(var(--fg))]',
    ghost: 'text-[hsl(var(--fg-secondary))] hover:text-[hsl(var(--fg))]',
  }

  return (
    <a ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className={cn('inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-sm font-medium transition-all duration-300', styles[variant], className)}
      {...props}
    >{children}</a>
  )
}
