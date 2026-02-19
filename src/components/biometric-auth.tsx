'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Fingerprint, Shield, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type BiometricSupport = {
  available: boolean
  types: string[]
  error?: string
}

interface BiometricAuthResult {
  success: boolean
  credential?: PublicKeyCredential
  error?: string
}

export function BiometricAuthSetup() {
  const [support, setSupport] = useState<BiometricSupport>({ available: false, types: [] })
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkBiometricSupport()
    checkRegistrationStatus()
  }, [])

  const checkBiometricSupport = async () => {
    if (!window.PublicKeyCredential) {
      setSupport({ available: false, types: [], error: 'WebAuthn not supported' })
      return
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      
      if (available) {
        setSupport({ 
          available: true, 
          types: ['platform'] // Could be expanded to detect specific types
        })
      } else {
        setSupport({ 
          available: false, 
          types: [], 
          error: 'No biometric authenticator available' 
        })
      }
    } catch (err) {
      setSupport({ 
        available: false, 
        types: [], 
        error: 'Failed to check biometric support' 
      })
    }
  }

  const checkRegistrationStatus = () => {
    const registered = localStorage.getItem('biometric-registered')
    setIsRegistered(!!registered)
  }

  const registerBiometric = async () => {
    if (!support.available) return

    setIsLoading(true)
    setError('')

    try {
      // Generate challenge
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // User ID (should be derived from actual user data)
      const userId = new TextEncoder().encode(
        localStorage.getItem('user-id') || `talon-user-${Date.now()}`
      )

      const createCredentialOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: 'Talon - OpenClaw Dashboard',
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: 'Talon User',
            displayName: 'Talon User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      }

      const credential = await navigator.credentials.create(createCredentialOptions) as PublicKeyCredential

      if (credential) {
        // Store credential info (in production, this should be stored securely on server)
        const credentialData = {
          id: credential.id,
          rawId: Array.from(new Uint8Array(credential.rawId)),
          type: credential.type,
          registered: Date.now()
        }

        localStorage.setItem('biometric-credential', JSON.stringify(credentialData))
        localStorage.setItem('biometric-registered', 'true')
        localStorage.setItem('user-id', Array.from(userId).map(b => String.fromCharCode(b)).join(''))
        
        setIsRegistered(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register biometric authentication')
    } finally {
      setIsLoading(false)
    }
  }

  const authenticateWithBiometric = async (): Promise<BiometricAuthResult> => {
    if (!support.available || !isRegistered) {
      return { success: false, error: 'Biometric authentication not available' }
    }

    try {
      const credentialData = localStorage.getItem('biometric-credential')
      if (!credentialData) {
        return { success: false, error: 'No registered credential found' }
      }

      const storedCredential = JSON.parse(credentialData)
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const getCredentialOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: new Uint8Array(storedCredential.rawId),
            type: 'public-key'
          }],
          userVerification: 'required',
          timeout: 60000
        }
      }

      const credential = await navigator.credentials.get(getCredentialOptions) as PublicKeyCredential

      if (credential) {
        // In production, verify the assertion on the server
        return { success: true, credential }
      }

      return { success: false, error: 'Authentication failed' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Biometric authentication failed' }
    }
  }

  const removeBiometric = () => {
    localStorage.removeItem('biometric-credential')
    localStorage.removeItem('biometric-registered')
    setIsRegistered(false)
  }

  if (!support.available) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Biometric Auth Unavailable
          </CardTitle>
          <CardDescription>
            {support.error || 'Your device doesn\'t support biometric authentication'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-primary" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          {isRegistered 
            ? 'Biometric authentication is set up and ready to use'
            : 'Set up fingerprint or face recognition for quick login'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <BiometricStatus isRegistered={isRegistered} support={support} />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            {!isRegistered ? (
              <Button
                onClick={registerBiometric}
                disabled={isLoading}
                className="flex-1"
              >
                <Fingerprint className="h-4 w-4 mr-2" />
                {isLoading ? 'Setting up...' : 'Set Up Biometrics'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={removeBiometric}
                  className="flex-1"
                >
                  Remove Setup
                </Button>
                <BiometricTestButton onAuthenticate={authenticateWithBiometric} />
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BiometricStatus({ 
  isRegistered, 
  support 
}: { 
  isRegistered: boolean
  support: BiometricSupport 
}) {
  if (!support.available) {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Not Available
      </Badge>
    )
  }

  if (isRegistered) {
    return (
      <Badge variant="default" className="text-xs bg-green-500">
        <CheckCircle className="h-3 w-3 mr-1" />
        Registered
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className="text-xs">
      <Shield className="h-3 w-3 mr-1" />
      Not Set Up
    </Badge>
  )
}

function BiometricTestButton({ 
  onAuthenticate 
}: { 
  onAuthenticate: () => Promise<BiometricAuthResult> 
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleTest = async () => {
    setIsLoading(true)
    setResult('')
    
    const authResult = await onAuthenticate()
    
    if (authResult.success) {
      setResult('✅ Authentication successful!')
    } else {
      setResult(`❌ ${authResult.error}`)
    }
    
    setIsLoading(false)
    
    // Clear result after 3 seconds
    setTimeout(() => setResult(''), 3000)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleTest}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        <Fingerprint className="h-4 w-4 mr-2" />
        {isLoading ? 'Authenticating...' : 'Test'}
      </Button>
      {result && (
        <p className={cn(
          "text-xs text-center px-2 py-1 rounded",
          result.includes('✅') 
            ? "text-green-400 bg-green-500/10" 
            : "text-red-400 bg-red-500/10"
        )}>
          {result}
        </p>
      )}
    </div>
  )
}

// Hook for using biometric authentication throughout the app
export function useBiometricAuth() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    const checkSupport = async () => {
      if (!window.PublicKeyCredential) {
        setIsSupported(false)
        return
      }

      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setIsSupported(available)
      } catch {
        setIsSupported(false)
      }
    }

    const checkRegistration = () => {
      setIsRegistered(!!localStorage.getItem('biometric-registered'))
    }

    checkSupport()
    checkRegistration()
  }, [])

  const authenticate = async (): Promise<BiometricAuthResult> => {
    if (!isSupported || !isRegistered) {
      return { success: false, error: 'Biometric authentication not available' }
    }

    // Implementation would go here - similar to BiometricAuthSetup
    return { success: false, error: 'Not implemented' }
  }

  return {
    isSupported,
    isRegistered,
    authenticate,
    canUseBiometrics: isSupported && isRegistered
  }
}