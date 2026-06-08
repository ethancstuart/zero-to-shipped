'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { NavLoginButton } from './nav-login-button'

const navItems = [
  { label: 'Pulse', href: '/pulse' },
  { label: 'Build', href: '/build' },
  { label: 'Learn', href: '/learn' },
  { label: 'System', href: '/system' },
  { label: 'Tools', href: '/tools' },
  { label: 'Which tool?', href: '/which-tool' },
]

interface MobileMenuProps {
  isAuthenticated: boolean
}

export function MobileMenu({ isAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => setIsOpen(false), [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, close])

  return (
    <>
      {/* Hamburger button — visible below lg */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center justify-center w-10 h-10 -mr-2 text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] transition-colors"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Menu size={20} />
      </button>

      {/* Full-screen overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-[hsl(var(--bg))] flex flex-col items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-5 right-6 flex items-center justify-center w-10 h-10 text-[hsl(var(--fg-muted))] hover:text-[hsl(var(--fg))] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

          {/* Nav links */}
          <nav className="flex flex-col items-center gap-6">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="text-2xl text-[hsl(var(--fg))] font-display tracking-tight hover:text-[hsl(var(--accent-hsl))] transition-colors"
                style={{
                  animation: `fadeUp 0.4s ease-out ${i * 0.08}s both`,
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom section: theme toggle + CTA */}
          <div
            className="absolute bottom-12 flex flex-col items-center gap-5"
            style={{ animation: 'fadeUp 0.4s ease-out 0.5s both' }}
          >
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={close}
                className="bg-[hsl(var(--fg))] text-[hsl(var(--bg))] rounded-full px-8 py-3 text-sm font-medium transition-all duration-300 hover:opacity-90"
              >
                Dashboard
              </Link>
            ) : (
              <NavLoginButton />
            )}
          </div>
        </div>
      )}
    </>
  )
}
