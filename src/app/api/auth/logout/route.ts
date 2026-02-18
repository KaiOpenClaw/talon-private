import { NextResponse } from 'next/server';
import { env } from '@/lib/config';

export async function POST() {
  const response = NextResponse.json({ 
    success: true,
    message: 'Logged out successfully'
  });
  
  // Clear auth cookie
  response.cookies.set('talon-auth-token', '', {
    httpOnly: true,
    secure: env.server.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  });
  
  return response;
}

export async function GET() {
  return POST();
}
