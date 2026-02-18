import { SecurityScanner } from '@/components/security-scanner'
import { SecurityGuide } from '@/components/security-guide'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔒 OpenClaw Security Center</h1>
        <p className="text-muted-foreground">
          Protect your system from malicious skills and security threats
        </p>
      </div>

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Security Scanner</TabsTrigger>
          <TabsTrigger value="guide">Security Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          <SecurityScanner />
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <SecurityGuide />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const metadata = {
  title: 'Security Center - Talon Dashboard',
  description: 'OpenClaw security scanner and protection guidelines',
}