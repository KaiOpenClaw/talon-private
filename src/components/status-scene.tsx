'use client'

import { useEffect, useState } from 'react'

interface StatusData {
  gateway: { status: string; version?: string; uptime?: number; activeCalls?: number }
  machine: {
    hostname: string
    cpu: { usage: number; cores: number }
    memory: { used: number; total: number; percent: number }
    disk: { used: number; total: number; percent: number }
    loadAvg: number[]
  }
  channels: { name: string; status: string; accounts?: number }[]
  cron: { running: boolean; jobCount: number }
  sessions: { total: number; active: number }
}

// CSS-based animated background (Three.js fallback)
export default function StatusScene({ data }: { data: StatusData | null }) {
  const [particles, setParticles] = useState<Array<{id: number; x: number; y: number; size: number; speed: number; opacity: number}>>([])
  
  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 20 + 10,
      opacity: Math.random() * 0.5 + 0.2,
    }))
    setParticles(newParticles)
  }, [])

  const healthy = data?.gateway.status === 'ok'
  const cpuPercent = data?.machine.cpu.usage || 0
  const memPercent = data?.machine.memory.percent || 0

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-zinc-950 via-black to-zinc-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, ${healthy ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'} 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(59,130,246,0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(245,158,11,0.15) 0%, transparent 60%)
            `,
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-amber-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `float ${p.speed}s ease-in-out infinite`,
            animationDelay: `${-p.speed * Math.random()}s`,
          }}
        />
      ))}

      {/* Central orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Outer glow */}
        <div 
          className={`absolute -inset-20 rounded-full blur-3xl animate-pulse ${
            healthy ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
        />
        
        {/* Orbit rings */}
        <div className="absolute -inset-32 border border-amber-500/20 rounded-full animate-[spin_30s_linear_infinite]" />
        <div className="absolute -inset-40 border border-blue-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute -inset-48 border border-purple-500/20 rounded-full animate-[spin_50s_linear_infinite]" />
        
        {/* Inner orb */}
        <div 
          className={`relative w-32 h-32 rounded-full animate-pulse ${
            healthy 
              ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/50' 
              : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50'
          }`}
        >
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        </div>

        {/* Metric orbs */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full animate-bounce"
          style={{
            background: cpuPercent > 80 ? '#ef4444' : cpuPercent > 50 ? '#f59e0b' : '#22c55e',
            boxShadow: `0 0 20px ${cpuPercent > 80 ? '#ef4444' : cpuPercent > 50 ? '#f59e0b' : '#22c55e'}`,
            animationDuration: '2s',
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            CPU
          </span>
        </div>
        
        <div 
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full animate-bounce"
          style={{
            background: memPercent > 80 ? '#ef4444' : memPercent > 50 ? '#f59e0b' : '#22c55e',
            boxShadow: `0 0 20px ${memPercent > 80 ? '#ef4444' : memPercent > 50 ? '#f59e0b' : '#22c55e'}`,
            animationDuration: '2.5s',
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            MEM
          </span>
        </div>

        <div 
          className="absolute top-1/2 -left-24 -translate-y-1/2 w-12 h-12 rounded-full animate-bounce"
          style={{
            background: '#3b82f6',
            boxShadow: '0 0 20px #3b82f6',
            animationDuration: '3s',
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            DSK
          </span>
        </div>

        <div 
          className="absolute top-1/2 -right-24 -translate-y-1/2 w-12 h-12 rounded-full animate-bounce"
          style={{
            background: '#8b5cf6',
            boxShadow: '0 0 20px #8b5cf6',
            animationDuration: '2.2s',
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            {data?.cron.jobCount || 0}
          </span>
        </div>
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  )
}
