'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshDistortMaterial, Stars, Float } from '@react-three/drei'
import * as THREE from 'three'

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

// Animated particle field
function Particles({ count = 1500 }) {
  const mesh = useRef<THREE.Points>(null)
  const geometry = useRef<THREE.BufferGeometry>(null)
  
  useEffect(() => {
    if (!geometry.current) return
    
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      
      colors[i * 3] = 0.96 + Math.random() * 0.04
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.2
      colors[i * 3 + 2] = 0.1 + Math.random() * 0.2
    }
    
    geometry.current.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.current.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }, [count])

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.02
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry ref={geometry} />
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

// Glowing orb for metrics
function MetricOrb({ position, color, scale, pulseSpeed = 1 }: { 
  position: [number, number, number]
  color: string
  scale: number
  pulseSpeed?: number 
}) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.scale.setScalar(scale * (1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1))
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={mesh} position={position}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  )
}

// Central core that pulses with health
function HealthCore({ healthy }: { healthy: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const color = healthy ? '#22c55e' : '#ef4444'

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.5
      mesh.current.rotation.y = state.clock.elapsedTime * 0.3
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15
      mesh.current.scale.setScalar(pulse)
    }
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.5, 1]} />
      <MeshDistortMaterial
        color={color}
        distort={0.4}
        speed={3}
        roughness={0.1}
        metalness={0.9}
        emissive={color}
        emissiveIntensity={0.8}
      />
    </mesh>
  )
}

// Ring around core
function OrbitRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed
    }
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  )
}

function Scene({ data }: { data: StatusData | null }) {
  const healthy = data?.gateway.status === 'ok'
  const cpuPercent = data?.machine.cpu.usage || 0
  const memPercent = data?.machine.memory.percent || 0
  const diskPercent = data?.machine.disk.percent || 0

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#f59e0b" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Particles count={1500} />
      
      <HealthCore healthy={healthy} />
      
      <OrbitRing radius={3} speed={0.5} color="#f59e0b" />
      <OrbitRing radius={4} speed={-0.3} color="#3b82f6" />
      <OrbitRing radius={5} speed={0.2} color="#8b5cf6" />
      
      <MetricOrb 
        position={[3, 0, 0]} 
        color={cpuPercent > 80 ? '#ef4444' : cpuPercent > 50 ? '#f59e0b' : '#22c55e'} 
        scale={0.5 + cpuPercent / 100}
        pulseSpeed={2}
      />
      <MetricOrb 
        position={[-3, 0, 0]} 
        color={memPercent > 80 ? '#ef4444' : memPercent > 50 ? '#f59e0b' : '#22c55e'} 
        scale={0.5 + memPercent / 100}
        pulseSpeed={1.5}
      />
      <MetricOrb 
        position={[0, 3, 0]} 
        color={diskPercent > 80 ? '#ef4444' : diskPercent > 50 ? '#f59e0b' : '#22c55e'} 
        scale={0.5 + diskPercent / 100}
        pulseSpeed={1}
      />
      <MetricOrb 
        position={[0, -3, 0]} 
        color="#3b82f6" 
        scale={0.5 + (data?.cron.jobCount || 0) / 50}
        pulseSpeed={0.8}
      />
      
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5}
        minDistance={5}
        maxDistance={20}
      />
    </>
  )
}

export default function StatusScene({ data }: { data: StatusData | null }) {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
      <Scene data={data} />
    </Canvas>
  )
}
