'use client'

import { useEffect, useRef } from 'react'
import sdk from '@stackblitz/sdk'

interface SandboxProps {
  template: string
  openFile?: string
  height?: number
}

export function Sandbox({
  template,
  openFile = 'src/app/page.tsx',
  height = 500,
}: SandboxProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    sdk.embedGithubProject(
      containerRef.current,
      `prototype-studio/starters/${template}`,
      {
        height,
        openFile,
        view: 'default',
        theme: 'dark',
      },
    )
  }, [template, openFile, height])

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-[hsl(var(--border-base))]">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border-base))] bg-[hsl(var(--bg-muted))] px-4 py-2">
        <span className="text-xs text-[hsl(var(--fg-muted))]">Interactive Sandbox</span>
        <span className="text-xs text-[hsl(var(--fg-faint))]">{template}</span>
      </div>
      <div ref={containerRef} />
    </div>
  )
}
