import { VoteButton } from './vote-button'

interface Entry {
  id: string
  tool_id: string
  video_url: string | null
  duration_seconds: number | null
  lines_of_code: number | null
  prompt_count: number | null
  iteration_count: number | null
  result_score: number | null
  starter_repo_url: string | null
  final_repo_url: string | null
  builder_experience: string | null
  tools: { name: string; slug: string } | null
}

interface SideBySideProps {
  entries: Entry[]
  voteCounts: Record<string, number>
  challengeId: string
}

export function SideBySide({ entries, voteCounts, challengeId }: SideBySideProps) {
  return (
    <div
      className={`grid gap-6 ${
        entries.length === 2
          ? 'md:grid-cols-2'
          : entries.length >= 3
            ? 'md:grid-cols-3'
            : ''
      }`}
    >
      {entries.map((entry) => (
        <div key={entry.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {entry.tools?.name || 'Unknown Tool'}
            </h3>
            <span className="text-xs text-white/30">
              {voteCounts[entry.tool_id] || 0} votes
            </span>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {entry.duration_seconds && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-lg font-bold text-white">
                  {Math.floor(entry.duration_seconds / 60)}m {entry.duration_seconds % 60}s
                </div>
                <div className="text-xs text-white/40">Duration</div>
              </div>
            )}
            {entry.lines_of_code && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-lg font-bold text-white">{entry.lines_of_code}</div>
                <div className="text-xs text-white/40">Lines of Code</div>
              </div>
            )}
            {entry.prompt_count && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-lg font-bold text-white">{entry.prompt_count}</div>
                <div className="text-xs text-white/40">Prompts</div>
              </div>
            )}
            {entry.iteration_count && (
              <div className="rounded-lg bg-white/5 p-3">
                <div className="text-lg font-bold text-white">{entry.iteration_count}</div>
                <div className="text-xs text-white/40">Iterations</div>
              </div>
            )}
          </div>

          {entry.result_score && (
            <div className="mb-4 text-sm text-white/50">
              Quality: {'★'.repeat(entry.result_score)}{'☆'.repeat(5 - entry.result_score)}
            </div>
          )}

          {/* Links */}
          <div className="mb-4 flex gap-3 text-xs">
            {entry.final_repo_url && (
              <a
                href={entry.final_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 underline hover:text-white/60"
              >
                View code →
              </a>
            )}
            {entry.starter_repo_url && (
              <a
                href={entry.starter_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 underline hover:text-white/60"
              >
                Starter →
              </a>
            )}
          </div>

          <VoteButton
            challengeId={challengeId}
            toolId={entry.tool_id}
            toolName={entry.tools?.name || 'This tool'}
          />
        </div>
      ))}
    </div>
  )
}
