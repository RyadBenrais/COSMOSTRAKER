import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  children: ReactNode
  accent?: 'purple' | 'cyan' | 'pink'
}

function Panel({ title, children, accent = 'purple' }: PanelProps) {
  const accentColors = {
    purple: 'border-purple-500/30',
    cyan: 'border-cyan-500/30',
    pink: 'border-pink-500/30',
  }

  return (
    <div className={`bg-slate-900/60 border ${accentColors[accent]} rounded-xl px-4 py-3`}>
      <p className="text-[10px] tracking-[2px] text-purple-300/70 uppercase mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}

export default Panel