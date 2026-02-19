# OpenClaw Gateway API: Your First Integration
**Part 1 of 6: Building with OpenClaw Tutorial Series**

*Published: February 19, 2026*  
*Reading Time: 8 minutes*  
*Tags: #openclaw #api #integration #tutorial #ai*

---

So you've heard about OpenClaw and want to build your own tools and integrations? You're in the right place. 

This is the first article in a 6-part series that will take you from OpenClaw newcomer to building production-ready applications like [Talon](https://github.com/KaiOpenClaw/talon-private) - the professional dashboard that's transforming how teams manage AI agents.

Today, we're starting with the foundation: the OpenClaw Gateway API. By the end of this tutorial, you'll have a working integration that can list sessions, send messages to agents, and handle responses - all the building blocks you need for more complex applications.

## What is the OpenClaw Gateway API?

The Gateway API is your programmatic interface to the entire OpenClaw ecosystem. Instead of using the CLI commands like `openclaw sessions` or `openclaw agent -m "message"`, you can make HTTP requests to achieve the same results.

Think of it as the bridge between the OpenClaw backend (where your agents live) and your custom applications (web dashboards, mobile apps, automation scripts, etc.).

### Why Use the API Instead of CLI?

**Scalability**: HTTP requests are faster and more reliable than spawning CLI processes  
**Real-time**: Build WebSocket connections for live updates  
**Integration**: Easy to integrate with web frameworks, mobile apps, and other services  
**Error Handling**: Structured error responses instead of parsing CLI output  
**Authentication**: Proper token-based security for production systems

## Prerequisites

Before we dive in, make sure you have:

- OpenClaw installed and running (check with `openclaw status`)
- Node.js 18+ installed  
- Basic knowledge of HTTP APIs and JavaScript/TypeScript
- Your OpenClaw Gateway URL and authentication token

### Finding Your Gateway Configuration

Your OpenClaw configuration is stored in `~/.openclaw/openclaw.json`. The gateway section looks like this:

```json
{
  "gateway": {
    "auth": {
      "token": "your-auth-token-here"
    },
    "server": {
      "host": "0.0.0.0",
      "port": 5050
    }
  }
}
```

If you're using Tailscale Funnel (recommended for remote access), your Gateway URL will look like:
`https://your-machine.tail-number.ts.net:5050`

## Your First API Request

Let's start with the simplest possible integration: listing your active sessions.

### 1. Basic Session List Request

```javascript
// api-client.js
class OpenClawClient {
  constructor(gatewayUrl, authToken) {
    this.baseUrl = gatewayUrl;
    this.authToken = authToken;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // List all active sessions
  async listSessions(options = {}) {
    const params = new URLSearchParams();
    if (options.activeMinutes) params.append('activeMinutes', options.activeMinutes);
    if (options.limit) params.append('limit', options.limit);
    
    const endpoint = `/api/sessions${params.toString() ? `?${params}` : ''}`;
    return await this.makeRequest(endpoint);
  }
}

// Usage example
const client = new OpenClawClient(
  'https://your-machine.tail-number.ts.net:5050',
  'your-auth-token'
);

// List all sessions
const sessions = await client.listSessions();
console.log(`Found ${sessions.length} active sessions:`, sessions);

// List only sessions active in the last 60 minutes
const recentSessions = await client.listSessions({ activeMinutes: 60 });
console.log(`Recent sessions:`, recentSessions);
```

### 2. Understanding the Response

A successful sessions response looks like this:

```json
[
  {
    "id": "sess_abc123",
    "agentId": "duplex",
    "status": "active",
    "lastActivity": "2026-02-19T21:00:00.000Z",
    "messageCount": 45,
    "createdAt": "2026-02-19T20:30:00.000Z",
    "metadata": {
      "channel": "discord",
      "userId": "user123"
    }
  },
  {
    "id": "sess_def456", 
    "agentId": "coach",
    "status": "idle",
    "lastActivity": "2026-02-19T20:45:00.000Z",
    "messageCount": 12,
    "createdAt": "2026-02-19T20:15:00.000Z",
    "metadata": {
      "channel": "discord",
      "userId": "user456"
    }
  }
]
```

## Sending Messages to Agents

Now let's add the ability to send messages to your agents:

```javascript
class OpenClawClient {
  // ... previous methods

  // Send a message to an agent
  async sendMessage(agentId, message, options = {}) {
    const payload = {
      message,
      agentId,
      ...options
    };

    return await this.makeRequest('/api/sessions/send', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Send message to specific session
  async sendToSession(sessionId, message, options = {}) {
    const payload = {
      message,
      sessionKey: sessionId,
      ...options
    };

    return await this.makeRequest('/api/sessions/send', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

// Usage examples
const client = new OpenClawClient(gatewayUrl, authToken);

// Send a message to the duplex agent (creates new session if none exists)
const response = await client.sendMessage('duplex', 'What is my current portfolio balance?');
console.log('Agent response:', response);

// Send a message to a specific existing session
const sessionResponse = await client.sendToSession('sess_abc123', 'Show me the latest trades');
console.log('Session response:', sessionResponse);
```

## Getting Session History

Often you'll want to see the conversation history for a session:

```javascript
class OpenClawClient {
  // ... previous methods

  // Get message history for a session
  async getSessionHistory(sessionId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.includeTools) params.append('includeTools', options.includeTools);
    
    params.append('sessionKey', sessionId);
    
    return await this.makeRequest(`/api/sessions/history?${params}`);
  }
}

// Usage
const history = await client.getSessionHistory('sess_abc123', { 
  limit: 50,
  includeTools: true 
});

console.log(`Session has ${history.length} messages:`);
history.forEach(msg => {
  console.log(`[${msg.timestamp}] ${msg.role}: ${msg.content}`);
});
```

## Error Handling and Best Practices

Here's a more robust version of our client with proper error handling:

```javascript
class OpenClawClient {
  constructor(gatewayUrl, authToken, options = {}) {
    this.baseUrl = gatewayUrl;
    this.authToken = authToken;
    this.timeout = options.timeout || 30000; // 30 second default
    this.retryAttempts = options.retryAttempts || 3;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new OpenClawAPIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorBody
          );
        }

        return await response.json();
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Health check method
  async healthCheck() {
    try {
      await this.makeRequest('/api/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Custom error class for better error handling
class OpenClawAPIError extends Error {
  constructor(message, statusCode, body) {
    super(message);
    this.name = 'OpenClawAPIError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

// Usage with error handling
async function safeApiCall() {
  const client = new OpenClawClient(gatewayUrl, authToken, {
    timeout: 10000,
    retryAttempts: 3
  });

  try {
    // Always check health first in production
    if (!await client.healthCheck()) {
      throw new Error('Gateway is not responding');
    }

    const sessions = await client.listSessions();
    return sessions;
  } catch (error) {
    if (error instanceof OpenClawAPIError) {
      console.error(`API Error ${error.statusCode}:`, error.message);
      console.error('Response body:', error.body);
    } else {
      console.error('Network or other error:', error.message);
    }
    
    // Return empty array as fallback
    return [];
  }
}
```

## Environment Configuration

For production applications, manage your configuration with environment variables:

```javascript
// config.js
const config = {
  gateway: {
    url: process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:5050',
    token: process.env.OPENCLAW_AUTH_TOKEN,
  },
  api: {
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS) || 3,
  }
};

// Validate required configuration
if (!config.gateway.token) {
  throw new Error('OPENCLAW_AUTH_TOKEN environment variable is required');
}

export default config;
```

```bash
# .env file
OPENCLAW_GATEWAY_URL=https://your-machine.tail-number.ts.net:5050
OPENCLAW_AUTH_TOKEN=your-auth-token-here
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3
```

## Complete Working Example

Here's a complete example that demonstrates all the concepts we've covered:

```javascript
// openclaw-demo.js
import config from './config.js';

class OpenClawClient {
  constructor(gatewayUrl, authToken, options = {}) {
    this.baseUrl = gatewayUrl;
    this.authToken = authToken;
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
  }

  async makeRequest(endpoint, options = {}) {
    // Implementation from above...
  }

  async listSessions(options = {}) { /* ... */ }
  async sendMessage(agentId, message, options = {}) { /* ... */ }
  async getSessionHistory(sessionId, options = {}) { /* ... */ }
  async healthCheck() { /* ... */ }
}

// Demo application
async function main() {
  const client = new OpenClawClient(
    config.gateway.url,
    config.gateway.token,
    config.api
  );

  console.log('🚀 Starting OpenClaw API Demo...\n');

  // 1. Health check
  console.log('1. Checking gateway health...');
  const isHealthy = await client.healthCheck();
  console.log(`Gateway status: ${isHealthy ? '✅ Online' : '❌ Offline'}\n`);

  if (!isHealthy) {
    console.error('Gateway is not responding. Check your configuration.');
    process.exit(1);
  }

  // 2. List sessions
  console.log('2. Listing active sessions...');
  const sessions = await client.listSessions({ activeMinutes: 120 });
  console.log(`Found ${sessions.length} sessions in the last 2 hours:`);
  sessions.forEach(session => {
    console.log(`  - ${session.agentId}: ${session.status} (${session.messageCount} messages)`);
  });
  console.log('');

  // 3. Send a message
  console.log('3. Sending message to duplex agent...');
  try {
    const response = await client.sendMessage('duplex', 'Hello! Can you tell me your current status?');
    console.log('✅ Message sent successfully');
    console.log('Response preview:', response.substring ? response.substring(0, 100) + '...' : response);
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
  }
  console.log('');

  // 4. Get session history (if we have sessions)
  if (sessions.length > 0) {
    console.log('4. Getting recent session history...');
    const firstSession = sessions[0];
    const history = await client.getSessionHistory(firstSession.id, { limit: 5 });
    
    console.log(`Last ${history.length} messages from ${firstSession.agentId}:`);
    history.slice(-3).forEach(msg => {
      console.log(`  [${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.role}: ${msg.content.substring(0, 80)}...`);
    });
  }

  console.log('\n✅ Demo completed successfully!');
}

// Run the demo
main().catch(error => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
```

Run it with:

```bash
node openclaw-demo.js
```

Expected output:
```
🚀 Starting OpenClaw API Demo...

1. Checking gateway health...
Gateway status: ✅ Online

2. Listing active sessions...
Found 3 sessions in the last 2 hours:
  - duplex: active (23 messages)
  - coach: idle (8 messages)
  - content-generator: active (15 messages)

3. Sending message to duplex agent...
✅ Message sent successfully
Response preview: I'm currently active and monitoring the markets. My last analysis was completed 5 minutes ago...

4. Getting recent session history...
Last 3 messages from duplex:
  [3:45:22 PM] user: Hello! Can you tell me your current status?
  [3:45:25 PM] assistant: I'm currently active and monitoring the markets...
  [3:44:12 PM] user: What's the market looking like today?

✅ Demo completed successfully!
```

## Next Steps

Congratulations! You now have a solid foundation for integrating with the OpenClaw Gateway API. You can:

- List active sessions across all your agents
- Send messages and receive responses  
- Get conversation history
- Handle errors gracefully
- Manage configuration properly

### What's Coming Next

In the next tutorial, we'll build on this foundation to create real-time monitoring with WebSockets. You'll learn how to:

- Establish WebSocket connections for live updates
- Handle real-time session events
- Build reactive user interfaces that update automatically
- Manage connection state and reconnection logic

### Going Further

Ready to see this in action? Check out [Talon](https://github.com/KaiOpenClaw/talon-private), a complete dashboard built using these exact patterns. The source code shows how all these concepts work together in a production application.

**Source Code**: All the code from this tutorial is available in the [companion repository](https://github.com/KaiOpenClaw/openclaw-tutorials) with working examples and additional documentation.

---

## Discussion

How are you planning to use the OpenClaw API? Building a dashboard, mobile app, automation scripts, or something completely different?

Drop a comment with your use case - I'd love to hear what you're building and might cover it in a future tutorial!

**Next Tutorial**: [Building Real-time Agent Monitoring with WebSockets →](tutorial-02-websockets-realtime.md)

---

*This is Part 1 of the "Building with OpenClaw" tutorial series. Follow me for updates when new tutorials are published, or star the [tutorial repository](https://github.com/KaiOpenClaw/openclaw-tutorials) to get notified of new examples.*