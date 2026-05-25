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
    <div className="my-8 overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
        <span className="text-xs text-white/50">Interactive Sandbox</span>
        <span className="text-xs text-white/30">{template}</span>
      </div>
      <div ref={containerRef} />
    </div>
  )
}
