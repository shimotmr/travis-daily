import { agents } from '@/lib/agents-data'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
  title: 'AI Agents — Travis Daily',
  description: 'Meet the AI agents powering Travis Research Lab',
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-yellow-500',
}

export default function AgentsPage() {
  return (
    <div className="py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users size={24} /> AI Agent Team
        </h1>
        <p className="text-muted-foreground text-sm">
          Travis Research Lab 的 AI 團隊——每個 agent 都有專屬技能，協同完成各種任務。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
          >
            {/* Gradient border effect on hover */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 via-transparent to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 pointer-events-none transition-all" />
            
            <div className="relative p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors flex-shrink-0">
                  <Image
                    src={agent.avatar}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: agent.avatarPosition || 'center center' }}
                  />
                </div>
                
                {/* Name & Role */}
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-lg mb-0.5">{agent.name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{agent.role}</p>
                  
                  {/* Status badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                    <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {agent.description}
              </p>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-1.5">
                {agent.expertise.slice(0, 3).map(skill => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                  >
                    {skill}
                  </span>
                ))}
                {agent.expertise.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    +{agent.expertise.length - 3}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
