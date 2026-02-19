# Talon API Reference

Complete reference for all Talon REST API endpoints. This documentation covers authentication, request/response formats, and practical examples for integrating with the Talon dashboard.

## Base URL & Authentication

**Base URL:** `https://your-talon-instance.onrender.com/api`  
**Authentication:** Token-based authentication required for most endpoints  
**Content-Type:** `application/json` for POST requests

### Authentication Header
```http
Authorization: Bearer YOUR_TALON_AUTH_TOKEN
```

### Rate Limiting
- **General endpoints:** 100 requests per minute per IP
- **Search endpoints:** 20 requests per minute per IP  
- **Spawn endpoints:** 5 requests per minute per IP
- **Index endpoints:** 10 requests per minute per IP

---

## Core API Endpoints

### Agents Management

#### GET `/api/agents`
List all available agents with current status and metadata.

**Response:**
```json
{
  "agents": [
    {
      "id": "duplex",
      "name": "Duplex",
      "status": "active",
      "lastActivity": "2026-02-19T05:00:00Z",
      "description": "Full-duplex communication specialist",
      "capabilities": ["chat", "memory", "tools"],
      "workspace": "/root/clawd/agents/duplex"
    }
  ],
  "count": 20,
  "lastUpdated": "2026-02-19T05:00:00Z"
}
```

**Example:**
```bash
curl -H "Authorization: Bearer $TALON_AUTH_TOKEN" \
  https://your-talon.onrender.com/api/agents
```

---

### Session Management

#### GET `/api/sessions`
List active sessions with optional filtering and pagination.

**Query Parameters:**
- `activeMinutes` (number): Filter by activity in last N minutes
- `limit` (number): Maximum sessions to return (default: 50)
- `includeArchived` (boolean): Include archived sessions

**Response:**
```json
{
  "sessions": [
    {
      "sessionKey": "session-uuid-123",
      "agentId": "duplex", 
      "status": "active",
      "lastActivity": "2026-02-19T04:58:00Z",
      "messageCount": 15,
      "startTime": "2026-02-19T04:00:00Z"
    }
  ],
  "total": 5,
  "activeCount": 3
}
```

#### GET `/api/sessions/history`
Get message history for a specific session.

**Query Parameters:**
- `sessionKey` (string, required): Session identifier
- `limit` (number): Maximum messages to return (default: 100)
- `includeTools` (boolean): Include tool usage in history

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-123",
      "role": "user",
      "content": "What's the status of the deployment?",
      "timestamp": "2026-02-19T04:55:00Z"
    },
    {
      "id": "msg-124", 
      "role": "assistant",
      "content": "The deployment is currently in progress...",
      "timestamp": "2026-02-19T04:55:30Z",
      "tools": ["gateway", "exec"]
    }
  ],
  "sessionKey": "session-uuid-123",
  "total": 15
}
```

#### POST `/api/sessions/send`
Send a message to a specific session or agent.

**Request Body:**
```json
{
  "sessionKey": "session-uuid-123", // Optional: specific session
  "agentId": "duplex",              // Optional: agent to message  
  "message": "Check deployment status",
  "timeoutSeconds": 30              // Optional: response timeout
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg-125",
  "response": "Deployment is 85% complete...",
  "executionTime": 2.3,
  "sessionKey": "session-uuid-123"
}
```

---

### Semantic Search

#### GET `/api/search`
Perform vector-based semantic search across all agent memories.

**Query Parameters:**
- `query` (string, required): Search query text
- `agent` (string): Filter by specific agent ID
- `limit` (number): Maximum results (default: 10, max: 50)
- `minScore` (number): Minimum relevance score (0.0-1.0)

**Response:**
```json
{
  "results": [
    {
      "id": "result-1",
      "content": "Deployment failed due to missing environment variables...",
      "score": 0.89,
      "source": {
        "agentId": "duplex",
        "file": "MEMORY.md",
        "line": 45,
        "timestamp": "2026-02-18T10:30:00Z"
      },
      "context": "Previous 2 lines and next 2 lines for context"
    }
  ],
  "query": "deployment issues",
  "totalResults": 12,
  "executionTime": 0.15
}
```

#### POST `/api/index`
Rebuild the search index for specified agents or all agents.

**Request Body:**
```json
{
  "agents": ["duplex", "coach"],    // Optional: specific agents
  "force": true,                   // Optional: force full rebuild
  "dryRun": false                  // Optional: preview changes only
}
```

**Response:**
```json
{
  "success": true,
  "indexed": {
    "agents": 2,
    "files": 45,
    "chunks": 156
  },
  "executionTime": 12.5,
  "cost": "$0.03"
}
```

---

### Cron Job Management

#### GET `/api/cron/jobs`
List all scheduled cron jobs with status and next execution times.

**Response:**
```json
{
  "jobs": [
    {
      "id": "job-uuid-123",
      "name": "Daily Agent Health Check",
      "schedule": "0 9 * * *",
      "enabled": true,
      "nextRun": "2026-02-20T09:00:00Z",
      "lastRun": {
        "timestamp": "2026-02-19T09:00:00Z",
        "status": "success",
        "duration": 2.1
      },
      "successRate": 98.5
    }
  ],
  "total": 31,
  "activeCount": 28
}
```

#### GET `/api/cron/status`
Get overall cron scheduler status and health metrics.

**Response:**
```json
{
  "scheduler": {
    "status": "running",
    "uptime": 86400,
    "jobsProcessed": 145,
    "lastHeartbeat": "2026-02-19T04:59:00Z"
  },
  "performance": {
    "averageExecutionTime": 1.8,
    "successRate": 97.2,
    "failedJobsLast24h": 2
  }
}
```

#### POST `/api/cron/run`
Manually trigger a specific cron job.

**Request Body:**
```json
{
  "jobId": "job-uuid-123",
  "force": true                    // Optional: run even if disabled
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "job-uuid-123",
  "runId": "run-uuid-456",
  "status": "started",
  "estimatedDuration": 30
}
```

---

### Skills & Capabilities

#### GET `/api/skills`
List all available skills with installation status and metadata.

**Response:**
```json
{
  "skills": [
    {
      "id": "github",
      "name": "GitHub Integration",
      "status": "installed",
      "version": "1.2.3",
      "description": "GitHub API integration for issues and PRs",
      "dependencies": ["gh", "git"],
      "capabilities": ["issues", "pulls", "repos"],
      "usage": {
        "lastUsed": "2026-02-19T03:30:00Z",
        "usageCount": 45
      }
    }
  ],
  "installed": 12,
  "available": 49,
  "updateAvailable": 3
}
```

#### POST `/api/skills/install`
Install or update a specific skill package.

**Request Body:**
```json
{
  "skillId": "github",
  "version": "latest",             // Optional: specific version
  "force": false                   // Optional: force reinstall
}
```

**Response:**
```json
{
  "success": true,
  "skillId": "github", 
  "version": "1.2.4",
  "installTime": 15.2,
  "dependencies": ["gh", "git"],
  "status": "installed"
}
```

---

### System Monitoring

#### GET `/api/system/health`
Get comprehensive system health status and metrics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-19T05:00:00Z",
  "components": {
    "gateway": {
      "status": "connected",
      "responseTime": 45,
      "lastCheck": "2026-02-19T04:59:30Z"
    },
    "database": {
      "status": "healthy",
      "connections": 15,
      "queryTime": 2.3
    },
    "search": {
      "status": "ready", 
      "indexSize": "156MB",
      "lastIndexed": "2026-02-19T04:00:00Z"
    }
  },
  "performance": {
    "uptime": 86400,
    "memoryUsage": "245MB",
    "cpuUsage": 12.5
  }
}
```

#### GET `/api/system/stats`
Get detailed system statistics and performance metrics.

**Response:**
```json
{
  "requests": {
    "total": 1256,
    "last24h": 145,
    "averageResponseTime": 234
  },
  "cache": {
    "hitRate": 89.5,
    "size": "45MB",
    "evictions": 23
  },
  "errors": {
    "last24h": 3,
    "errorRate": 0.2,
    "commonErrors": [
      {
        "type": "TimeoutError",
        "count": 2,
        "lastOccurrence": "2026-02-19T03:15:00Z"
      }
    ]
  }
}
```

---

### Performance Monitoring

#### GET `/api/performance/metrics`
Get performance metrics for API endpoints and system components.

**Query Parameters:**
- `timeframe` (string): "1h", "24h", "7d" (default: "1h")
- `component` (string): Filter by component name

**Response:**
```json
{
  "timeframe": "1h",
  "endpoints": [
    {
      "path": "/api/sessions",
      "method": "GET",
      "requests": 45,
      "averageTime": 123,
      "errorRate": 0.0,
      "slowestRequest": 456
    }
  ],
  "summary": {
    "totalRequests": 245,
    "averageResponseTime": 156,
    "errorRate": 1.2,
    "cacheHitRate": 87.3
  }
}
```

#### GET `/api/performance/errors`
Get recent error logs with context and resolution suggestions.

**Response:**
```json
{
  "errors": [
    {
      "id": "error-123",
      "timestamp": "2026-02-19T04:45:00Z",
      "level": "error",
      "component": "gateway",
      "message": "Connection timeout to OpenClaw Gateway",
      "context": {
        "endpoint": "/api/sessions",
        "duration": 30000,
        "retries": 3
      },
      "suggestions": [
        "Check gateway connectivity",
        "Verify Tailscale Funnel status",
        "Review authentication tokens"
      ]
    }
  ],
  "totalErrors": 12,
  "last24h": 3
}
```

---

### Memory Management

#### GET `/api/memory`
Access agent memory files and workspace content.

**Query Parameters:**
- `agentId` (string, required): Agent identifier
- `file` (string): Specific file (MEMORY.md, SOUL.md, TOOLS.md)
- `path` (string): Subdirectory path within agent workspace

**Response:**
```json
{
  "agentId": "duplex",
  "files": [
    {
      "name": "MEMORY.md",
      "path": "MEMORY.md", 
      "size": 15234,
      "modified": "2026-02-19T04:30:00Z",
      "content": "# Agent Memory\n\nRecent activities...",
      "lines": 234
    }
  ],
  "workspace": "/root/clawd/agents/duplex"
}
```

#### POST `/api/memory`
Update agent memory files or workspace content.

**Request Body:**
```json
{
  "agentId": "duplex",
  "file": "MEMORY.md",
  "content": "# Updated Memory Content\n\nNew information...",
  "backup": true                   // Optional: create backup before update
}
```

**Response:**
```json
{
  "success": true,
  "agentId": "duplex",
  "file": "MEMORY.md",
  "bytesWritten": 1543,
  "backup": "MEMORY.md.backup.2026-02-19T05:00:00Z"
}
```

---

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticate with Talon using token-based authentication.

**Request Body:**
```json
{
  "token": "your-talon-auth-token"
}
```

**Response:**
```json
{
  "success": true,
  "expiresIn": 604800,             // 7 days in seconds
  "permissions": ["read", "write", "admin"]
}
```

#### POST `/api/auth/logout`
End current authentication session.

**Response:**
```json
{
  "success": true,
  "message": "Session ended successfully"
}
```

---

### WebSocket API

#### GET `/api/ws`
Establish WebSocket connection for real-time updates.

**Connection:** Upgrade HTTP to WebSocket protocol
**Authentication:** Pass token as query parameter: `?token=your-auth-token`

**Message Types:**

**Outbound (Client → Server):**
```json
{
  "type": "subscribe",
  "topics": ["agent-status", "session-updates", "cron-jobs"]
}
```

**Inbound (Server → Client):**
```json
{
  "type": "agent-status-update",
  "data": {
    "agentId": "duplex",
    "status": "active",
    "timestamp": "2026-02-19T05:00:00Z"
  }
}
```

**Available Topics:**
- `agent-status` - Agent health and activity changes
- `session-updates` - New messages and session events
- `cron-jobs` - Job execution status and completions
- `system-health` - System performance and error events

---

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "agentId",
      "reason": "Agent not found"
    },
    "requestId": "req-uuid-123",
    "timestamp": "2026-02-19T05:00:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | Missing or invalid auth token |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `RATE_LIMITED` | 429 | Too many requests |
| `GATEWAY_TIMEOUT` | 504 | OpenClaw Gateway unreachable |
| `INTERNAL_ERROR` | 500 | Server-side error |

### Rate Limit Headers

When rate limited, responses include:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0  
X-RateLimit-Reset: 1645123456
Retry-After: 60
```

---

## SDK & Integration Examples

### JavaScript/TypeScript Client

```typescript
class TalonClient {
  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async getAgents() {
    const response = await fetch(`${this.baseUrl}/api/agents`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async sendMessage(agentId: string, message: string) {
    return fetch(`${this.baseUrl}/api/sessions/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agentId, message })
    }).then(r => r.json());
  }
}
```

### Python Integration

```python
import requests

class TalonAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_agents(self):
        response = requests.get(f'{self.base_url}/api/agents', headers=self.headers)
        return response.json()
    
    def search(self, query: str, agent: str = None):
        params = {'query': query}
        if agent:
            params['agent'] = agent
        response = requests.get(f'{self.base_url}/api/search', params=params, headers=self.headers)
        return response.json()
```

### cURL Examples

```bash
# Get agent status
curl -H "Authorization: Bearer $TOKEN" \
  https://talon.onrender.com/api/agents

# Send message to agent
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"duplex","message":"Status check"}' \
  https://talon.onrender.com/api/sessions/send

# Search agent memories  
curl -H "Authorization: Bearer $TOKEN" \
  "https://talon.onrender.com/api/search?query=deployment%20issues"

# Trigger cron job
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"job-123","force":true}' \
  https://talon.onrender.com/api/cron/run
```

---

## Changelog

### API Version 1.0.0 (Current)
- Initial release with 38 endpoints
- Token-based authentication
- WebSocket real-time updates  
- Vector search integration
- Comprehensive monitoring APIs

### Upcoming Features
- GraphQL endpoint for complex queries
- Batch operations for bulk updates
- Advanced filtering and pagination
- Custom webhook integrations
- Multi-tenant support

---

For technical support or feature requests, visit our [GitHub repository](https://github.com/KaiOpenClaw/talon-private) or join our [Discord community](https://discord.gg/talon).