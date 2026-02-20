# Talon Architecture Diagram

## System Architecture: Next.js 14 + LanceDB + OpenClaw Gateway

### Diagram Concept: "Professional AI Agent Management Stack"

**Visual Flow:** User → Frontend → API Layer → Gateway → Agent Workspaces

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   Desktop   │ │   Mobile    │ │     PWA     │ │ Command     ││
│  │  Dashboard  │ │   Touch     │ │  Offline    │ │ Palette     ││
│  │             │ │   Native    │ │   Support   │ │   (⌘K)      ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │    Next.js 14    │ │  Tailwind CSS +  │ │    Zustand       │ │
│  │   App Router     │ │    shadcn/ui     │ │  State Mgmt      │ │
│  │                  │ │                  │ │                  │ │
│  │ • SSR/SSG        │ │ • Component UI   │ │ • Global State   │ │
│  │ • API Routes     │ │ • Dark Mode      │ │ • Real-time      │ │
│  │ • WebSocket      │ │ • Responsive     │ │ • Persistence    │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │  Sessions   │ │   Search    │ │   Memory    │ │   System    ││
│  │   /api/     │ │   LanceDB   │ │   Files     │ │  Health     ││
│  │             │ │             │ │             │ │             ││
│  │ • List      │ │ • Vector    │ │ • Browse    │ │ • Status    ││
│  │ • History   │ │ • Query     │ │ • Edit      │ │ • Monitor   ││
│  │ • Send      │ │ • Filter    │ │ • Sync      │ │ • Alerts    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH & EMBEDDING                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │    LanceDB       │ │   OpenAI API     │ │   Index Mgmt     │ │
│  │  Vector Store    │ │   Embeddings     │ │  780+ Chunks     │ │
│  │                  │ │                  │ │                  │ │
│  │ • Local Storage  │ │ • text-embed-3   │ │ • Auto Reindex   │ │
│  │ • Fast Query     │ │ • Similarity     │ │ • Agent Filter   │ │
│  │ • Persistence    │ │ • $0.08 Cost     │ │ • 27 Workspaces  │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OPENCLAW GATEWAY                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │  Sessions   │ │    Cron     │ │   Skills    │ │  Channels   ││
│  │   Manager   │ │  31 Jobs    │ │  49 Packs   │ │   Multi     ││
│  │             │ │             │ │             │ │  Platform   ││
│  │ • REST API  │ │ • Schedule  │ │ • Enable    │ │ • Discord   ││
│  │ • WebSocket │ │ • Monitor   │ │ • Install   │ │ • Telegram  ││
│  │ • Auth      │ │ • Trigger   │ │ • Status    │ │ • WhatsApp  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AGENT WORKSPACES                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐        │
│  │   Agent 1     │ │   Agent 2     │ │   Agent N     │ ...    │
│  │   duplex      │ │    coach      │ │    talon      │        │
│  │               │ │               │ │               │        │
│  │ • MEMORY.md   │ │ • MEMORY.md   │ │ • MEMORY.md   │        │
│  │ • SOUL.md     │ │ • SOUL.md     │ │ • SOUL.md     │        │
│  │ • memory/*.md │ │ • memory/*.md │ │ • memory/*.md │        │
│  │ • Sessions    │ │ • Sessions    │ │ • Sessions    │        │
│  └───────────────┘ └───────────────┘ └───────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Specifications

### Component Details

#### Frontend Technologies
```typescript
{
  "framework": "Next.js 14",
  "routing": "App Router (latest)",
  "styling": "Tailwind CSS + shadcn/ui",
  "state": "Zustand (lightweight)",
  "realtime": "WebSocket + SSE",
  "pwa": "Progressive Web App support"
}
```

#### Search Architecture  
```typescript
{
  "vectorDb": "LanceDB (native module)",
  "embeddings": "OpenAI text-embedding-3-small", 
  "indexSize": "780+ chunks, 27 agents",
  "queryTime": "<100ms average",
  "storage": "Local disk (.lancedb/)"
}
```

#### Gateway Integration
```typescript
{
  "protocol": "REST API + WebSocket",
  "auth": "Bearer token authentication", 
  "endpoints": "24 API routes",
  "realtime": "Session status, job updates",
  "fallback": "Graceful degradation"
}
```

### Data Flow Diagram

**Request Flow:**
1. **User Interaction** → Command Palette (⌘K) or UI click
2. **Frontend Router** → Next.js App Router handles route
3. **API Middleware** → Authentication and request validation
4. **Service Layer** → Gateway API call or LanceDB query
5. **Data Processing** → Transform and cache response
6. **State Update** → Zustand store update triggers re-render
7. **UI Update** → Component re-renders with new data

**Real-time Updates:**
1. **Gateway Events** → WebSocket message from OpenClaw
2. **Event Handler** → Client WebSocket receives update
3. **State Sync** → Zustand store updated automatically
4. **UI Refresh** → All subscribed components update
5. **Toast Notification** → User feedback for important changes

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         RENDER CLOUD                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │   Web Service    │ │  Build System    │ │   Environment    │ │
│  │                  │ │                  │ │                  │ │
│  │ • Next.js App    │ │ • npm run build  │ │ • 8 Env Vars     │ │
│  │ • 37 Pages       │ │ • 42 API Routes  │ │ • Secure Tokens  │ │
│  │ • LanceDB Native │ │ • Bundle 112kB   │ │ • Gateway URL    │ │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TAILSCALE FUNNEL                           │
├─────────────────────────────────────────────────────────────────┤
│  https://srv1325349.tail657eaf.ts.net:5050                     │
│  • OpenClaw Gateway exposed securely                            │
│  • Private network access                                       │
│  • End-to-end encryption                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LOCAL AGENT HOST                            │
├─────────────────────────────────────────────────────────────────┤
│  /root/clawd/agents/* - All agent workspaces and memory files   │
└─────────────────────────────────────────────────────────────────┘
```

## Visual Design Guidelines

### Color Coding
- **Blue (#3B82F6)**: Core Talon components (Frontend, API)
- **Green (#10B981)**: OpenClaw Gateway and integrations  
- **Purple (#8B5CF6)**: AI/ML components (LanceDB, OpenAI)
- **Orange (#F59E0B)**: External services and deployment
- **Gray (#6B7280)**: Data storage and file system

### Typography
- **Headers**: Inter Bold 16px
- **Component Names**: Inter Medium 14px
- **Technical Details**: Inter Regular 12px
- **Code Snippets**: JetBrains Mono 11px

### Layout Principles
- **Top-Down Flow**: User experience to infrastructure
- **Left-Right**: Request/response data flow
- **Grouped Components**: Related services in containers
- **Consistent Spacing**: 16px padding, 8px margins
- **Professional Aesthetic**: Dark theme, clean lines

---

## Export Requirements

### File Formats
- **SVG**: Vector format for scalability
- **PNG**: High resolution (2x, 3x) for retina displays  
- **PDF**: Print-friendly version
- **Figma**: Editable source file

### Use Cases
- **Blog Post**: Inline technical explanation
- **Documentation**: Architecture overview page
- **Presentations**: Developer talks and demos
- **Social Media**: Technical content sharing
- **GitHub README**: Repository documentation