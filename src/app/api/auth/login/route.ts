import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logApiError } from '@/lib/logger';
import { env } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      );
    }
    
    const expectedToken = env.server.TALON_AUTH_TOKEN;
    
    // If no auth configured, reject login attempts
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Authentication not configured' },
        { status: 500 }
      );
    }
    
    // Verify token
    if (token !== expectedToken) {
      // Add delay to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Create response with auth cookie
    const response = NextResponse.json({ 
      success: true,
      message: 'Login successful'
    });
    
    // Set secure cookie
    response.cookies.set('talon-auth-token', token, {
      httpOnly: true,
      secure: env.server.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error) {
    logApiError(error, {
      api: 'auth-login',
      action: 'authenticate',
      hasToken: !!request.headers.get('authorization')
    });
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
