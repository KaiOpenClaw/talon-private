# API Reference

Talon provides a comprehensive REST API for programmatic access to all dashboard functionality.

## Base URL

```
https://your-talon-deployment.com/api
```

## Authentication

All API requests require the same gateway token used for the web interface:

```http
Authorization: Bearer your_gateway_token
```

---

## 🤖 Agents

### List All Agents
```http
GET /api/agents
```

**Response:**
```json
{
  "agents": [
    {
      "id": "duplex",
      "name": "duplex",
      "avatar": "🤖",
      "description": "Main orchestration agent",
      "status": "online",
      "workdir": "/root/clawd/agents/duplex",
      "lastActivity": "2026-02-17T16:30:00Z",
      "memorySize": "2.4MB"
    }
  ],
  "summary": {
    "total": 20,
    "active": 5,
    "idle": 15
  }
}
```

### Get Agent Details
```http
GET /api/agents/{agentId}
```

---

## ⚡ Skills

### List Skills
```http
GET /api/skills
```

**Response:**
```json
{
  "skills": [
    {
      "name": "coding-agent",
      "description": "Run Codex CLI, Claude Code, OpenCode",
      "status": "ready",
      "source": "npm",
      "dependencies": ["node", "npm"],
      "missingDeps": []
    }
  ],
  "summary": {
    "total": 49,
    "ready": 12,
    "missingDeps": 37
  }
}
```

### Install Skill
```http
POST /api/skills/install
Content-Type: application/json

{
  "skill": "docker"
}
```

---

## ⏰ Cron Jobs

### List Cron Jobs
```http
GET /api/cron
```

**Query Parameters:**
- `includeDisabled` - Include disabled jobs (default: false)

**Response:**
```json
{
  "jobs": [
    {
      "id": "04fd40da-46a2-4ab2-b0be-e033b0b86520",
      "name": "🦅 Talon Development Sprint",
      "schedule": "every 1h",
      "nextRun": "in 6m",
      "lastRun": "-",
      "status": "idle",
      "target": "isolated",
      "agent": "duplex"
    }
  ],
  "summary": {
    "total": 31,
    "running": 0,
    "errors": 1,
    "idle": 30
  }
}
```

### Trigger Job
```http
POST /api/cron/run
Content-Type: application/json

{
  "jobId": "04fd40da-46a2-4ab2-b0be-e033b0b86520"
}
```

### Toggle Job Status
```http
POST /api/cron/toggle
Content-Type: application/json

{
  "jobId": "04fd40da-46a2-4ab2-b0be-e033b0b86520",
  "enabled": true
}
```

---

## 📡 Channels

### List Channels
```http
GET /api/channels
```

**Response:**
```json
{
  "channels": [
    {
      "platform": "discord",
      "name": "openclaw",
      "status": "online",
      "enabled": true,
      "connectedSince": "1 day ago",
      "messagesSent": 2341,
      "messagesReceived": 1876,
      "accounts": ["openclaw#1234"]
    }
  ],
  "summary": {
    "total": 6,
    "online": 4,
    "offline": 1,
    "errors": 1
  }
}
```

### Reconnect Channel
```http
POST /api/channels/reconnect
Content-Type: application/json

{
  "platform": "discord",
  "name": "openclaw"
}
```

### Toggle Channel
```http
POST /api/channels/toggle
Content-Type: application/json

{
  "platform": "discord",
  "name": "openclaw",
  "enabled": false
}
```

---

## 💬 Sessions

### List Sessions
```http
GET /api/sessions
```

**Query Parameters:**
- `activeMinutes` - Filter to sessions active within N minutes
- `limit` - Maximum number of sessions to return

**Response:**
```json
{
  "sessions": [
    {
      "key": "main-duplex-20260217",
      "agentId": "duplex",
      "kind": "main",
      "lastActivity": "2026-02-17T16:45:00Z",
      "messageCount": 127,
      "active": true
    }
  ]
}
```

### Send Message to Session
```http
POST /api/sessions/send
Content-Type: application/json

{
  "sessionKey": "main-duplex-20260217",
  "message": "Status update please"
}
```

### Spawn Sub-Agent
```http
POST /api/sessions/spawn
Content-Type: application/json

{
  "agentId": "duplex",
  "task": "Deploy Talon to production",
  "cleanup": "keep",
  "timeoutSeconds": 3600
}
```

---

## 🔍 Search

### Semantic Search
```http
GET /api/search?q={query}&agent={agentId}&limit={limit}
```

**Query Parameters:**
- `q` - Search query (required)
- `agent` - Filter to specific agent (optional)
- `limit` - Maximum results (default: 20)
- `minScore` - Minimum similarity score (default: 0.7)

**Response:**
```json
{
  "results": [
    {
      "id": "duplex:MEMORY.md:1",
      "content": "## Current Focus\n\nBuild the OpenClaw Client...",
      "score": 0.89,
      "agentId": "duplex",
      "filePath": "MEMORY.md",
      "fileType": "memory",
      "chunk": 1
    }
  ],
  "query": "OpenClaw client",
  "totalResults": 15,
  "searchTime": "42ms"
}
```

### Index Agent Workspace
```http
POST /api/index
Content-Type: application/json

{
  "agent": "duplex",
  "force": false
}
```

---

## 📊 System Health

### System Health Overview
```http
GET /api/system/health
```

**Response:**
```json
{
  "gateway": {
    "status": "online",
    "version": "2026.2.15",
    "uptime": "2 days",
    "memory": 45,
    "cpu": 12
  },
  "agents": {
    "total": 20,
    "active": 5,
    "idle": 15
  },
  "sessions": {
    "total": 147,
    "active": 8,
    "lastHour": 23
  },
  "skills": {
    "total": 49,
    "ready": 12,
    "missingDeps": 37
  },
  "cron": {
    "total": 31,
    "running": 0,
    "errors": 1,
    "nextJob": "in 6m"
  },
  "channels": {
    "total": 6,
    "online": 4,
    "offline": 1,
    "errors": 1
  },
  "search": {
    "indexed": 780,
    "lastUpdate": "2026-02-17 16:32 UTC"
  }
}
```

---

## 📁 Memory & Workspaces

### Read Agent Memory File
```http
GET /api/memory?agent={agentId}&file={fileName}
```

### Update Agent Memory File
```http
POST /api/memory
Content-Type: application/json

{
  "agent": "duplex",
  "file": "MEMORY.md",
  "content": "Updated memory content..."
}
```

### List Workspace Files
```http
GET /api/memory?agent={agentId}&action=list
```

---

## 🚨 Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Resource not found",
  "code": "RESOURCE_NOT_FOUND",
  "details": {
    "resource": "agent",
    "id": "nonexistent-agent"
  },
  "timestamp": "2026-02-17T16:45:00Z"
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid token)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable (gateway offline)

---

## 🔒 Rate Limiting

API requests are rate limited per IP address:
- **100 requests/minute** for read operations
- **20 requests/minute** for write operations  
- **5 requests/minute** for resource-intensive operations (search, indexing)

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703123456
```

---

## 📝 SDK Examples

### Node.js
```javascript
const TalonAPI = require('@openclaw/talon-sdk');

const talon = new TalonAPI({
  baseURL: 'https://your-talon.com/api',
  token: 'your_gateway_token'
});

// List agents
const agents = await talon.agents.list();

// Search across workspaces
const results = await talon.search('deployment strategy', {
  agent: 'duplex',
  limit: 10
});

// Trigger cron job
await talon.cron.run('job-id-here');
```

### Python
```python
import requests

class TalonAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {token}'}
    
    def search(self, query, agent=None):
        params = {'q': query}
        if agent:
            params['agent'] = agent
        
        response = requests.get(
            f'{self.base_url}/search',
            params=params,
            headers=self.headers
        )
        return response.json()

# Usage
talon = TalonAPI('https://your-talon.com/api', 'your_token')
results = talon.search('cron jobs')
```

---

**Need help?** Join our [Discord](https://discord.gg/openclaw) or [open an issue](https://github.com/KaiOpenClaw/talon-private/issues).