# Security Guide

Comprehensive security practices for deploying and operating Talon in production environments.

## 🛡️ Security Overview

Talon handles sensitive data including:
- **Gateway authentication tokens** - Full OpenClaw access
- **Agent workspace content** - Including API keys, configuration
- **Search indexes** - Vector embeddings of all memory content
- **Session data** - Conversation history and agent interactions

This guide covers securing these assets in production deployments.

---

## 🔐 Authentication & Authorization

### Token-Based Authentication

#### Strong Token Generation

Generate cryptographically secure authentication tokens:

```bash
# Method 1: OpenSSL (Recommended)
openssl rand -hex 32
# Output: 64-character hex string

# Method 2: Python
python3 -c "import secrets; print(secrets.token_hex(32))"

# Method 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Configure in production environment:
```env
TALON_AUTH_TOKEN=your-64-character-secure-token-here
```

#### Token Rotation Strategy

Implement regular token rotation:

```bash
# Generate new token
new_token=$(openssl rand -hex 32)

# Update environment variable
# (Process varies by deployment platform)

# Notify team members
echo "New Talon auth token: $new_token"

# Schedule rotation (quarterly recommended)
```

### Multi-User Authentication

#### Individual User Tokens

Generate unique tokens per team member:

```bash
#!/bin/bash
# generate-user-tokens.sh

users=("alice" "bob" "charlie" "david")
tokens_file="talon-tokens.json"

echo "{" > $tokens_file
for i in "${!users[@]}"; do
    user=${users[$i]}
    token=$(openssl rand -hex 32)
    echo "  \"$user\": \"$token\"," >> $tokens_file
    echo "User: $user, Token: $token"
done
echo "}" >> $tokens_file
```

Configure environment:
```env
# Comma-separated tokens for multiple users
TALON_AUTH_TOKENS="token1,token2,token3"
```

#### Role-Based Access (Coming Soon)

Future versions will support role-based permissions:

```json
{
  "users": {
    "alice": {
      "token": "alice-token-here",
      "role": "admin",
      "permissions": ["read", "write", "admin"]
    },
    "bob": {
      "token": "bob-token-here", 
      "role": "developer",
      "permissions": ["read", "write"]
    },
    "charlie": {
      "token": "charlie-token-here",
      "role": "viewer",
      "permissions": ["read"]
    }
  }
}
```

---

## 🌐 Network Security

### HTTPS Configuration

#### Force HTTPS in Production

```env
# Force all connections to use HTTPS
NODE_ENV=production
FORCE_HTTPS=true

# HTTP Strict Transport Security
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
```

#### SSL/TLS Certificate Management

##### Option 1: Let's Encrypt (Render/Vercel Auto)
Most cloud platforms handle SSL certificates automatically.

##### Option 2: Custom Certificates
```bash
# Generate certificate signing request
openssl req -new -newkey rsa:2048 -nodes \
  -keyout talon.key -out talon.csr

# Install certificate (varies by platform)
```

### IP Access Control

#### Allowlist Configuration

Restrict access to trusted networks:

```env
# Comma-separated CIDR blocks
ALLOWED_IPS="10.0.0.0/8,192.168.0.0/16,203.0.113.0/24"

# Office networks only
ALLOWED_IPS="your.office.ip/32,vpn.range.0.0/16"
```

#### Geographic Restrictions

```env
# Restrict by country codes (ISO 3166-1 alpha-2)
ALLOWED_COUNTRIES="US,CA,GB,DE"

# Block specific countries
BLOCKED_COUNTRIES="CN,RU,KP"
```

### VPN & Private Network Access

#### Tailscale Integration

Deploy Talon on your Tailscale network:

```bash
# Install Tailscale on Talon server
curl -fsSL https://tailscale.com/install.sh | sh

# Authenticate and join network
tailscale up

# Configure internal-only access
ALLOWED_IPS="100.64.0.0/10"  # Tailscale range
```

#### AWS VPC / Private Subnets

Deploy in private subnets with VPN access:

```yaml
# CloudFormation example
Resources:
  TalonInstance:
    Type: AWS::EC2::Instance
    Properties:
      SubnetId: !Ref PrivateSubnet
      SecurityGroupIds:
        - !Ref TalonSecurityGroup
      
  TalonSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Talon Dashboard Access
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          SourceSecurityGroupId: !Ref VPNSecurityGroup
```

---

## 🔒 Data Protection

### Environment Variable Security

#### Secure Storage

Never commit sensitive data to version control:

```bash
# .env files should be in .gitignore
echo ".env*" >> .gitignore
echo "*.key" >> .gitignore
echo "*.pem" >> .gitignore

# Use deployment platform secret management
# Render: Environment variables
# AWS: Parameter Store / Secrets Manager
# Azure: Key Vault
# GCP: Secret Manager
```

#### Encryption at Rest

Encrypt sensitive configuration:

```bash
# Encrypt environment file
gpg --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 \
    --s2k-digest-algo SHA512 --s2k-count 65536 \
    --symmetric --output .env.gpg .env

# Decrypt for deployment
gpg --quiet --batch --yes --decrypt --passphrase="$GPG_PASSPHRASE" \
    --output .env .env.gpg
```

### Database & Search Index Security

#### LanceDB Security

Secure vector search database:

```env
# Encrypt LanceDB directory
LANCEDB_PATH=/encrypted/storage/.lancedb

# File system encryption
# Use encrypted volumes/partitions for LanceDB storage
```

#### Search Data Sanitization

Remove sensitive data before indexing:

```javascript
// Custom sanitization function
function sanitizeContent(content) {
  // Remove API keys
  content = content.replace(/sk-[a-zA-Z0-9]{48}/g, '[API_KEY_REDACTED]');
  
  // Remove tokens
  content = content.replace(/[a-f0-9]{64}/g, '[TOKEN_REDACTED]');
  
  // Remove passwords
  content = content.replace(/password[:\s]*[^\s\n]+/gi, 'password: [REDACTED]');
  
  return content;
}
```

### Backup Security

#### Encrypted Backups

```bash
#!/bin/bash
# secure-backup.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/secure/backups"
ENCRYPTION_KEY="your-backup-encryption-key"

# Create encrypted backup
tar -czf - /app/data /app/.lancedb | \
  gpg --cipher-algo AES256 --compress-algo 2 \
      --symmetric --passphrase "$ENCRYPTION_KEY" \
      --output "$BACKUP_DIR/talon_backup_$BACKUP_DATE.tar.gz.gpg"

# Upload to secure storage (S3, Azure Blob, etc.)
aws s3 cp "$BACKUP_DIR/talon_backup_$BACKUP_DATE.tar.gz.gpg" \
  s3://your-secure-backup-bucket/ \
  --server-side-encryption AES256
```

---

## 🚨 Threat Protection

### Rate Limiting & DDoS Protection

#### Built-in Rate Limiting

Configure API rate limits:

```env
# Requests per minute per IP
RATE_LIMIT_RPM=100

# Burst allowance
RATE_LIMIT_BURST=20

# Specific endpoint limits
RATE_LIMIT_SEARCH_RPM=20    # Search endpoints
RATE_LIMIT_INDEX_RPM=5      # Indexing operations
RATE_LIMIT_SPAWN_RPM=10     # Agent spawning
```

#### Advanced DDoS Protection

##### Cloudflare Protection
```javascript
// Cloudflare Worker script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Check for suspicious patterns
  const userAgent = request.headers.get('user-agent')
  const cf = request.cf
  
  if (!userAgent || cf.botScore < 30) {
    return new Response('Access denied', { status: 403 })
  }
  
  // Forward to Talon
  return fetch(request)
}
```

##### Application-Level Protection
```javascript
// Express middleware for advanced protection
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Advanced rate limiting
const advancedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Different limits based on request type
    if (req.path.startsWith('/api/search')) return 20;
    if (req.path.startsWith('/api/index')) return 5;
    return 100;
  },
  keyGenerator: (req) => {
    // Use IP + User-Agent for better tracking
    return req.ip + req.get('User-Agent');
  }
});
```

### Input Validation & Sanitization

#### API Input Validation

```javascript
// Schema validation using Joi
const Joi = require('joi');

const searchSchema = Joi.object({
  q: Joi.string().min(1).max(500).required(),
  agent: Joi.string().alphanum().max(50),
  limit: Joi.number().integer().min(1).max(100).default(20),
  minScore: Joi.number().min(0).max(1).default(0.7)
});

// Validate search requests
app.post('/api/search', (req, res) => {
  const { error, value } = searchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Invalid request parameters',
      details: error.details 
    });
  }
  
  // Proceed with validated data
  performSearch(value);
});
```

#### Content Security Policy

```javascript
// CSP configuration
const csp = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Next.js requires this
    "https://cdn.jsdelivr.net" // For external libraries
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // For Tailwind CSS
    "https://fonts.googleapis.com"
  ],
  imgSrc: [
    "'self'",
    "data:", // For SVG icons
    "https:" // For external images
  ],
  connectSrc: [
    "'self'",
    process.env.GATEWAY_URL // OpenClaw gateway
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com"
  ]
};
```

---

## 🔍 Security Monitoring & Logging

### Audit Logging

#### Comprehensive Access Logging

```javascript
// Security event logging
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: '/var/log/talon-security.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

// Log security events
function logSecurityEvent(event, req, details = {}) {
  securityLogger.info({
    event,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...details
  });
}

// Usage examples
app.use('/api', (req, res, next) => {
  logSecurityEvent('api_access', req, {
    endpoint: req.path,
    authenticated: !!req.user
  });
  next();
});
```

#### Failed Authentication Tracking

```javascript
// Track authentication failures
const failedAttempts = new Map();

function trackFailedAuth(ip) {
  const key = ip;
  const attempts = failedAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
  
  attempts.count++;
  attempts.lastAttempt = Date.now();
  
  failedAttempts.set(key, attempts);
  
  // Log suspicious activity
  if (attempts.count > 5) {
    logSecurityEvent('brute_force_attempt', { ip }, {
      attempts: attempts.count,
      timespan: attempts.lastAttempt - attempts.firstAttempt
    });
  }
  
  // Auto-block after 10 attempts
  if (attempts.count >= 10) {
    blacklistIP(ip, '1h');
  }
}
```

### Real-time Monitoring

#### Security Metrics

```javascript
// Prometheus security metrics
const promClient = require('prom-client');

const securityMetrics = {
  authFailures: new promClient.Counter({
    name: 'talon_auth_failures_total',
    help: 'Total authentication failures',
    labelNames: ['ip', 'reason']
  }),
  
  blockedRequests: new promClient.Counter({
    name: 'talon_blocked_requests_total',
    help: 'Total blocked requests',
    labelNames: ['ip', 'reason']
  }),
  
  activeUsers: new promClient.Gauge({
    name: 'talon_active_users',
    help: 'Number of active authenticated users'
  })
};

// Increment metrics
securityMetrics.authFailures.inc({ ip: req.ip, reason: 'invalid_token' });
```

#### Alert Configuration

```yaml
# Prometheus alerting rules
groups:
  - name: talon-security
    rules:
      - alert: HighAuthFailureRate
        expr: rate(talon_auth_failures_total[5m]) > 0.5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High authentication failure rate detected"
          
      - alert: BruteForceAttack
        expr: increase(talon_auth_failures_total[1m]) > 10
        labels:
          severity: critical
        annotations:
          summary: "Potential brute force attack in progress"
          
      - alert: UnauthorizedAPIAccess
        expr: rate(talon_blocked_requests_total[5m]) > 1
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Multiple blocked API requests detected"
```

---

## 🧹 Security Maintenance

### Vulnerability Management

#### Dependency Updates

```bash
# Regular security updates
npm audit
npm audit fix

# Check for high-severity vulnerabilities
npm audit --audit-level high

# Update specific packages
npm update package-name

# Automated security updates (GitHub Dependabot)
```

#### Security Scanning

```bash
# SAST scanning with semgrep
pip install semgrep
semgrep --config auto /path/to/talon

# Docker security scanning
docker scout cves talon:latest

# Infrastructure scanning with Trivy
trivy fs /path/to/talon
```

### Incident Response

#### Security Incident Playbook

1. **Detection Phase**
   - Monitor alerts and logs
   - Identify potential security incidents
   - Assess impact and severity

2. **Response Phase**
   ```bash
   # Immediate actions for security incident
   
   # 1. Block suspicious IPs
   iptables -A INPUT -s SUSPICIOUS_IP -j DROP
   
   # 2. Rotate authentication tokens
   new_token=$(openssl rand -hex 32)
   # Update environment variables
   
   # 3. Review recent logs
   tail -1000 /var/log/talon-security.log | grep SUSPICIOUS_IP
   
   # 4. Check for data exposure
   grep -r "API_KEY\|TOKEN\|PASSWORD" /app/logs/
   ```

3. **Recovery Phase**
   - Patch vulnerabilities
   - Update security configurations
   - Restore services

4. **Post-Incident Phase**
   - Document lessons learned
   - Update security procedures
   - Implement additional monitoring

#### Breach Notification

```javascript
// Automated breach notification
function notifySecurityBreach(incident) {
  const notification = {
    timestamp: new Date().toISOString(),
    severity: incident.severity,
    type: incident.type,
    affectedUsers: incident.users.length,
    description: incident.description,
    mitigationSteps: incident.mitigation
  };
  
  // Notify security team
  sendToSlack(process.env.SECURITY_WEBHOOK, notification);
  
  // Log to security system
  securityLogger.error('security_breach', notification);
  
  // Trigger incident response
  if (incident.severity === 'critical') {
    triggerIncidentResponse(notification);
  }
}
```

---

## ✅ Security Checklist

### Pre-Deployment Security Review

- [ ] **Authentication**
  - [ ] Strong authentication tokens generated
  - [ ] Token rotation schedule established
  - [ ] Multi-user authentication configured

- [ ] **Network Security**
  - [ ] HTTPS enforced in production
  - [ ] SSL certificates properly configured
  - [ ] IP allowlists configured
  - [ ] Rate limiting enabled

- [ ] **Data Protection**
  - [ ] Environment variables secured
  - [ ] Sensitive data encrypted at rest
  - [ ] Search indexes sanitized
  - [ ] Backup encryption configured

- [ ] **Monitoring**
  - [ ] Security logging enabled
  - [ ] Failed authentication tracking
  - [ ] Real-time alerts configured
  - [ ] Metrics collection setup

- [ ] **Maintenance**
  - [ ] Dependency update schedule
  - [ ] Vulnerability scanning process
  - [ ] Incident response plan
  - [ ] Security training for team

### Production Security Hardening

```bash
#!/bin/bash
# Production security hardening script

# 1. Update system packages
apt update && apt upgrade -y

# 2. Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 443/tcp
ufw enable

# 3. Disable unnecessary services
systemctl disable telnet
systemctl disable ftp
systemctl stop telnet ftp

# 4. Set up log rotation
cat > /etc/logrotate.d/talon << EOF
/var/log/talon*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
}
EOF

# 5. Configure fail2ban
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban

# 6. Set secure file permissions
chmod 600 /app/.env*
chmod 700 /app/.lancedb
chown -R app:app /app/

echo "Security hardening complete"
```

---

**🔒 Security is an ongoing process.** Regularly review and update your security measures as threats evolve.

**Need security help?** 
- 🚨 [Report security issues](mailto:security@openclaw.com)
- 📚 [Security documentation](https://docs.openclaw.com/security)
- 💬 [Join security discussions](https://discord.gg/openclaw-security)