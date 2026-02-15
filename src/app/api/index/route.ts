import { NextRequest, NextResponse } from 'next/server'

// LanceDB indexing is disabled on Vercel due to size limits
// This route is only available when running locally

export async function GET() {
  return NextResponse.json({
    status: 'disabled',
    message: 'Indexing is only available when running locally with LanceDB',
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: 'disabled', 
    message: 'Indexing is only available when running locally with LanceDB',
  })
}
