# Developer Setup & Contributing Guide

Complete guide for setting up Talon development environment and contributing to the project.

## Quick Start

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm 9+** or **yarn 3+**
- **Git** with SSH key configured
- **OpenClaw Gateway** running (for testing)
- **OpenAI API Key** (for search functionality)

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone git@github.com:KaiOpenClaw/talon-private.git
   cd talon-private
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Verify Setup**
   - Open `http://localhost:4000` in browser
   - Check console for any connection errors
   - Verify agent list loads properly

---

## Environment Variables

### Required Variables

```env
# OpenClaw Gateway Connection (Required)
GATEWAY_URL=https://your-gateway.tailscale.com:5050
GATEWAY_TOKEN=your_gateway_token_from_openclaw_config

# OpenAI API for Vector Search (Required for search functionality)
OPENAI_API_KEY=sk-your_openai_key_here
```

### Optional Variables

```env
# Authentication (Production only)
TALON_AUTH_TOKEN=generate_secure_password_for_production

# Talon API for Workspace Data (Development enhancement)
TALON_API_URL=https://your-talon-api-endpoint.com
TALON_API_TOKEN=your_talon_api_token

# Debug and Development
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=true
SENTRY_DSN=https://your-sentry-dsn-here
```

### Finding Your Gateway Token

```bash
# Your OpenClaw Gateway token is in the config file
cat ~/.openclaw/openclaw.json | jq -r '.gateway.auth.token'
```

### Testing Environment Variables

```bash
# Test gateway connection
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  "$GATEWAY_URL/api/sessions"

# Test OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  "https://api.openai.com/v1/models"
```

---

## Project Architecture

### Directory Structure

```
talon-private/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes (38 endpoints)
│   │   ├── (auth)/            # Protected route groups
│   │   ├── workspace/[id]/    # Dynamic agent pages
│   │   └── page.tsx           # Main dashboard
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── chat-panel.tsx    # Agent chat interface
│   │   ├── semantic-search.tsx # Vector search UI
│   │   └── memory-viewer.tsx  # Memory file browser
│   └── lib/                   # Utility libraries
│       ├── gateway.ts         # OpenClaw Gateway client
│       ├── lancedb.ts         # Vector search implementation
│       ├── logger.ts          # Structured logging
│       └── cache.ts           # API response caching
├── docs/                      # Documentation
├── scripts/                   # CLI tools and utilities
│   └── index-workspaces.ts    # Search index builder
├── content/                   # Marketing and blog content
└── public/                    # Static assets
```

### Key Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript | React framework with App Router |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS + component system |
| **State** | Zustand | Lightweight state management |
| **Search** | LanceDB + OpenAI | Vector database + embeddings |
| **Real-time** | WebSocket | Live updates and notifications |
| **Auth** | Token-based | Simple, secure authentication |
| **Deployment** | Render | Native module support for LanceDB |

### API Architecture

```
┌─────────────────────────────────────────┐
│           Next.js API Routes            │
│  ┌─────────────────────────────────┐    │
│  │  Gateway Bridge (gateway.ts)    │    │ 
│  │  - Authentication                │    │
│  │  - Request/Response mapping      │    │
│  │  - Error handling                │    │
│  │  - Rate limiting                 │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│       OpenClaw Gateway (External)       │
│  - Agent management                     │
│  - Session orchestration                │
│  - Cron job execution                   │
│  - Multi-channel messaging              │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Agent Workspaces                │
│  - MEMORY.md, SOUL.md, TOOLS.md        │
│  - Session transcripts                  │
│  - Agent-specific configurations        │
└─────────────────────────────────────────┘
```

---

## Development Workflow

### Code Standards

**TypeScript Configuration:**
- Strict mode enabled
- No implicit any types
- Comprehensive interface definitions
- Path aliases configured (`@/` for `src/`)

**ESLint Rules:**
```json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

**Code Formatting:**
- Prettier with 2-space indentation
- Trailing commas where valid
- Single quotes for strings
- Semicolons required

### Git Workflow

**Branch Naming:**
```
feature/semantic-search-improvements
bugfix/gateway-connection-timeout  
hotfix/production-deployment-issue
docs/api-reference-update
```

**Commit Messages:**
```
feat: add semantic search filtering by agent
fix: resolve gateway timeout in production
docs: update API reference with new endpoints
refactor: improve error handling in chat component
test: add unit tests for search functionality
```

**Pull Request Process:**

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   git push -u origin feature/your-feature-name
   ```

2. **Development & Testing**
   - Write code following project conventions
   - Add/update tests for new functionality
   - Update documentation if needed
   - Test locally with real OpenClaw data

3. **Pre-submission Checklist**
   ```bash
   # Code quality checks
   npm run lint          # ESLint validation
   npm run type-check    # TypeScript compilation
   npm run build         # Production build test
   
   # Test API endpoints
   npm run test          # Unit tests (if available)
   
   # Search index validation (if search changes)
   npx tsx scripts/index-workspaces.ts --dry-run
   ```

4. **Pull Request Submission**
   - Clear description of changes
   - Link to related GitHub issues
   - Include screenshots for UI changes
   - Request review from maintainers

### Testing Strategy

**Manual Testing Checklist:**

```markdown
### Core Functionality
- [ ] Agent list loads with correct status
- [ ] Chat interface sends/receives messages
- [ ] Memory browser displays files correctly
- [ ] Session management works across agents

### Search Functionality  
- [ ] Semantic search returns relevant results
- [ ] Agent filtering works correctly
- [ ] Search index rebuilds successfully
- [ ] Performance acceptable with large datasets

### System Monitoring
- [ ] Cron job dashboard shows accurate status
- [ ] Skills management displays correctly
- [ ] System health metrics update properly
- [ ] WebSocket connections maintain stability

### Production Features
- [ ] Authentication protects sensitive routes
- [ ] Rate limiting prevents abuse
- [ ] Error handling provides useful feedback
- [ ] Performance monitoring captures metrics
```

**Load Testing:**

```bash
# Test API performance with realistic load
npx autocannon -c 10 -d 30 -H "Authorization=Bearer $TOKEN" \
  https://localhost:4000/api/agents

# Search performance testing
for i in {1..20}; do
  curl -H "Authorization: Bearer $TOKEN" \
    "https://localhost:4000/api/search?query=test+query+$i" &
done
```

---

## API Development

### Adding New Endpoints

1. **Create Route File**
   ```typescript
   // src/app/api/your-endpoint/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { logApiRequest, logApiError } from '@/lib/logger';
   
   export const dynamic = 'force-dynamic';
   
   export async function GET(request: NextRequest) {
     const startTime = Date.now();
     
     try {
       logApiRequest({
         component: 'YourEndpointAPI',
         action: 'fetch',
         endpoint: '/api/your-endpoint'
       });
       
       // Your implementation here
       const data = await fetchData();
       
       return NextResponse.json(data);
     } catch (error) {
       logApiError({
         component: 'YourEndpointAPI', 
         action: 'fetch',
         endpoint: '/api/your-endpoint',
         error,
         duration: Date.now() - startTime
       });
       
       return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
       );
     }
   }
   ```

2. **Add TypeScript Interfaces**
   ```typescript
   // src/types/api.ts
   export interface YourEndpointResponse {
     data: YourDataType[];
     total: number;
     lastUpdated: string;
   }
   
   export interface YourDataType {
     id: string;
     name: string;
     status: 'active' | 'inactive';
     metadata: Record<string, any>;
   }
   ```

3. **Update API Client**
   ```typescript
   // src/lib/gateway.ts
   export async function fetchYourEndpoint(): Promise<YourEndpointResponse> {
     return gatewayRequest('/api/your-endpoint');
   }
   ```

4. **Add Documentation**
   ```markdown
   # Update docs/api-reference.md
   #### GET `/api/your-endpoint`
   Description of your endpoint...
   ```

### Gateway Integration Patterns

**Standard Gateway Request:**
```typescript
async function gatewayRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${GATEWAY_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Gateway request failed: ${response.status}`);
  }
  
  return response.json();
}
```

**With Caching:**
```typescript
async function fetchWithCache<T>(
  key: string, 
  fetcher: () => Promise<T>, 
  ttl: number = 30000
): Promise<T> {
  const cached = cache.get(key);
  if (cached && !cache.isStale(key)) {
    return cached;
  }
  
  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}
```

**Error Handling:**
```typescript
async function safeGatewayRequest<T>(endpoint: string): Promise<T | null> {
  try {
    return await gatewayRequest<T>(endpoint);
  } catch (error) {
    logApiError({
      component: 'GatewayClient',
      action: 'request',
      endpoint,
      error
    });
    return null; // Return null for graceful fallback
  }
}
```

---

## Frontend Development

### Component Architecture

**Base Component Pattern:**
```typescript
// components/your-component.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logError } from '@/lib/logger';

interface YourComponentProps {
  agentId?: string;
  onUpdate?: (data: any) => void;
}

export function YourComponent({ agentId, onUpdate }: YourComponentProps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await fetch('/api/your-endpoint');
        const data = await result.json();
        
        setData(data);
        onUpdate?.(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        logError({
          component: 'YourComponent',
          action: 'fetchData', 
          error: err
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [agentId, onUpdate]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Component</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your component content */}
      </CardContent>
    </Card>
  );
}
```

### State Management with Zustand

```typescript
// lib/store.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AppState {
  // State
  agents: Agent[];
  selectedAgent: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  selectAgent: (agentId: string) => void;
  updateConnectionStatus: (status: AppState['connectionStatus']) => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    agents: [],
    selectedAgent: null,
    connectionStatus: 'disconnected',
    
    // Actions
    setAgents: (agents) => set({ agents }),
    selectAgent: (agentId) => set({ selectedAgent: agentId }),
    updateConnectionStatus: (status) => set({ connectionStatus: status }),
  }))
);

// Usage in components
function AgentList() {
  const { agents, selectedAgent, selectAgent } = useAppStore();
  // Component logic
}
```

### Real-time Updates

```typescript
// hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function useWebSocket(token: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const updateConnectionStatus = useAppStore(state => state.updateConnectionStatus);
  
  useEffect(() => {
    const websocket = new WebSocket(`ws://localhost:4000/api/ws?token=${token}`);
    
    websocket.onopen = () => {
      updateConnectionStatus('connected');
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'agent-status-update':
          // Update agent status in store
          break;
        case 'session-update':
          // Update session data
          break;
      }
    };
    
    websocket.onclose = () => {
      updateConnectionStatus('disconnected');
    };
    
    return () => {
      websocket.close();
    };
  }, [token, updateConnectionStatus]);
  
  return ws;
}
```

---

## Search Development

### Vector Search Implementation

The semantic search system uses LanceDB with OpenAI embeddings:

```typescript
// lib/lancedb.ts
import lancedb from '@lancedb/lancedb';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float'
  });
  
  return response.data[0].embedding;
}

export async function searchMemories(
  query: string, 
  agentFilter?: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const db = await lancedb.connect('.lancedb');
  const table = await db.openTable('memories');
  
  const queryEmbedding = await createEmbedding(query);
  
  let searchQuery = table.search(queryEmbedding).limit(limit);
  
  if (agentFilter) {
    searchQuery = searchQuery.where(`agent_id = '${agentFilter}'`);
  }
  
  const results = await searchQuery.toArray();
  
  return results.map(result => ({
    id: result.id,
    content: result.content,
    score: result._distance,
    source: {
      agentId: result.agent_id,
      file: result.file_path,
      line: result.line_number,
      timestamp: result.timestamp
    }
  }));
}
```

### Building Search Index

```typescript
// scripts/index-workspaces.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createEmbedding } from '../src/lib/lancedb';

interface Document {
  id: string;
  content: string;
  agent_id: string;
  file_path: string;
  line_number: number;
  timestamp: string;
  embedding: number[];
}

async function indexWorkspaces(agentsDir: string = '/root/clawd/agents') {
  const agents = readdirSync(agentsDir);
  const documents: Document[] = [];
  
  for (const agent of agents) {
    const agentPath = join(agentsDir, agent);
    const memoryFiles = ['MEMORY.md', 'SOUL.md', 'TOOLS.md'];
    
    for (const file of memoryFiles) {
      const filePath = join(agentPath, file);
      
      try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        // Create chunks of 3 lines for better context
        for (let i = 0; i < lines.length; i += 3) {
          const chunk = lines.slice(i, i + 3).join('\n').trim();
          
          if (chunk.length > 50) { // Skip very short chunks
            const embedding = await createEmbedding(chunk);
            
            documents.push({
              id: `${agent}-${file}-${i}`,
              content: chunk,
              agent_id: agent,
              file_path: file,
              line_number: i + 1,
              timestamp: new Date().toISOString(),
              embedding
            });
          }
        }
      } catch (error) {
        console.warn(`Could not read ${filePath}:`, error.message);
      }
    }
  }
  
  // Insert into LanceDB
  const db = await lancedb.connect('.lancedb');
  await db.createTable('memories', documents, { writeMode: 'overwrite' });
  
  console.log(`Indexed ${documents.length} chunks from ${agents.length} agents`);
}

// CLI execution
if (require.main === module) {
  indexWorkspaces().catch(console.error);
}
```

---

## Debugging & Troubleshooting

### Common Issues

**Gateway Connection Errors:**
```bash
# Check Tailscale Funnel status
tailscale funnel status

# Verify gateway is running
openclaw status

# Test direct connection
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  "$GATEWAY_URL/api/sessions"
```

**Search Index Problems:**
```bash
# Rebuild search index
cd talon-private
npx tsx scripts/index-workspaces.ts

# Check LanceDB directory
ls -la .lancedb/

# Verify OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  "https://api.openai.com/v1/models"
```

**Development Server Issues:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check port conflicts
lsof -i :4000
```

### Logging and Monitoring

**Structured Logging:**
```typescript
// All components use structured logging
import { logApiRequest, logApiError, logComponentError } from '@/lib/logger';

// API request logging
logApiRequest({
  component: 'SessionsAPI',
  action: 'list',
  endpoint: '/api/sessions',
  parameters: { activeMinutes: 60 }
});

// Error logging with context
logApiError({
  component: 'ChatPanel',
  action: 'sendMessage',
  error: new Error('Gateway timeout'),
  context: { agentId: 'duplex', messageLength: 150 }
});
```

**Performance Monitoring:**
```typescript
// lib/performance.ts
export function measureApiPerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  return fn().finally(() => {
    const duration = Date.now() - startTime;
    
    // Log performance metrics
    console.log(`${operation} completed in ${duration}ms`);
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send metrics to DataDog, New Relic, etc.
    }
  });
}
```

**Debug Environment Variables:**
```env
# Enable debug logging
DEBUG=talon:*
NEXT_PUBLIC_DEBUG=true

# Detailed API logging  
LOG_LEVEL=debug
LOG_API_REQUESTS=true
LOG_PERFORMANCE=true

# Development features
ENABLE_DEV_TOOLS=true
DISABLE_AUTH=true  # Development only!
```

---

## Performance Optimization

### API Response Caching

```typescript
// lib/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
}

export const cache = new APICache();
```

### Bundle Size Optimization

```typescript
// next.config.js
const nextConfig = {
  // Tree shaking for smaller bundles
  experimental: {
    optimizePackageImports: ['@lancedb/lancedb', 'lucide-react']
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      };
    }
    
    return config;
  }
};
```

### Database Query Optimization

```typescript
// Optimize LanceDB queries
export async function optimizedSearch(query: string, limit: number = 10) {
  const db = await lancedb.connect('.lancedb');
  const table = await db.openTable('memories');
  
  // Use pre-computed embeddings when possible
  const cachedEmbedding = cache.get(`embedding:${query}`);
  const queryEmbedding = cachedEmbedding || await createEmbedding(query);
  
  if (!cachedEmbedding) {
    cache.set(`embedding:${query}`, queryEmbedding, 300000); // 5 min cache
  }
  
  // Optimize search with proper indexing
  const results = await table
    .search(queryEmbedding)
    .limit(limit)
    .select(['id', 'content', 'agent_id', 'file_path', '_distance'])
    .toArray();
  
  return results;
}
```

---

## Deployment

### Local Development Deployment

```bash
# Production build testing
npm run build
npm run start

# Docker development
docker build -t talon-dev .
docker run -p 4000:4000 --env-file .env.local talon-dev
```

### Production Deployment to Render

1. **Connect Repository**
   - Link GitHub repository to Render
   - Set service type to "Web Service"
   - Configure auto-deploy from main branch

2. **Environment Configuration**
   ```env
   # Required for production
   GATEWAY_URL=https://your-gateway.tailscale.com:5050
   GATEWAY_TOKEN=your_gateway_token_here
   OPENAI_API_KEY=sk-your_openai_key_here
   TALON_AUTH_TOKEN=generate_secure_production_token
   
   # Optional performance
   NODE_ENV=production
   ENABLE_PERFORMANCE_MONITORING=true
   ```

3. **Build Configuration**
   ```yaml
   # render.yaml
   services:
   - type: web
     name: talon-dashboard
     env: node
     buildCommand: npm ci && npm run build
     startCommand: npm run start
     envVars:
     - key: NODE_ENV
       value: production
   ```

### Health Checks

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      gateway: await testGatewayConnection(),
      database: await testDatabaseConnection(),
      search: await testSearchIndex()
    }
  };
  
  const allHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  
  return NextResponse.json(health, { 
    status: allHealthy ? 200 : 503 
  });
}
```

---

## Contributing Guidelines

### Issue Reporting

**Bug Reports:** Use the bug report template
```markdown
**Environment:**
- OS: [e.g., macOS, Ubuntu]
- Node version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 119]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior:**
A clear description of what you expected to happen.

**Actual Behavior:**
A clear description of what actually happened.

**Screenshots/Logs:**
If applicable, add screenshots or error logs.
```

**Feature Requests:** Use the feature request template
```markdown
**Problem Statement:**
What problem does this feature solve?

**Proposed Solution:**
Describe your ideal solution.

**Alternatives Considered:**
What other approaches did you consider?

**Additional Context:**
Screenshots, mockups, or examples.
```

### Code Contribution Process

1. **Fork the Repository**
   ```bash
   gh repo fork KaiOpenClaw/talon-private
   cd talon-private
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow code standards
   - Add tests where appropriate
   - Update documentation

4. **Test Changes**
   ```bash
   npm run lint
   npm run type-check
   npm run build
   # Manual testing with real data
   ```

5. **Submit Pull Request**
   - Clear description of changes
   - Reference related issues
   - Include screenshots for UI changes

### Community Guidelines

- **Be Respectful:** Treat all contributors with respect
- **Be Patient:** Maintainers are volunteers
- **Be Helpful:** Share knowledge and help newcomers
- **Be Constructive:** Provide actionable feedback

### Maintainer Responsibilities

- Review PRs within 7 days
- Provide constructive feedback
- Maintain code quality standards
- Update documentation
- Respond to security issues within 24 hours

---

## Resources

### Documentation Links
- [API Reference](./api-reference.md)
- [Deployment Guide](./deployment.md)
- [Configuration Guide](./configuration.md)
- [Troubleshooting Guide](./troubleshooting.md)

### External Resources
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [OpenClaw Gateway API](https://openclaw.dev/docs)
- [LanceDB Documentation](https://lancedb.github.io/lancedb/)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Community
- [GitHub Repository](https://github.com/KaiOpenClaw/talon-private)
- [Discord Server](https://discord.gg/talon) 
- [Twitter Updates](https://twitter.com/talon_ai)
- [Blog & Tutorials](https://blog.talon.dev)

### Support
- **Technical Issues:** GitHub Issues
- **Security Reports:** security@talon.dev
- **General Questions:** Discord #help channel
- **Enterprise Support:** enterprise@talon.dev

---

*Happy coding! 🦅*