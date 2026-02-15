import { NextResponse } from 'next/server'

// Talon API server (exposes agent workspaces)
const TALON_API_URL = process.env.TALON_API_URL || 'https://srv1325349.tail657eaf.ts.net:4101'
const TALON_API_TOKEN = process.env.TALON_API_TOKEN || ''

export async function GET() {
  try {
    const response = await fetch(`${TALON_API_URL}/agents`, {
      headers: {
        'Authorization': `Bearer ${TALON_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Talon API error:', response.status, response.statusText)
      return NextResponse.json({ 
        agents: [], 
        error: `Failed to fetch agents: ${response.status}` 
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json({ 
      agents: [], 
      error: String(error) 
    })
  }
}
