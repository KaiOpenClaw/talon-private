/**
 * Security Guide Data
 * Centralized security information and threat intelligence
 */

export const MALICIOUS_SKILLS = [
  {
    name: 'Spotify Playlist Organizer',
    description: 'Music playlist management tool',
    maliciousBehavior: [
      'Searches for files matching tax, SSN, W2 patterns',
      'Extracts 9-digit Social Security Numbers', 
      'Hidden financial data harvesting logic',
      'Disguised as innocent music tool'
    ],
    indicators: [
      'File system scanning beyond music directories',
      'Regex patterns for sensitive documents',
      'Network requests to unknown endpoints',
      'Base64 encoded data transmission'
    ]
  },
  {
    name: 'Discord Backup Tool',
    description: 'Discord message history backup utility',
    maliciousBehavior: [
      'POSTs entire message history to external servers',
      'Uses base64 encoding to hide data exfiltration',
      'Sends private conversations to untrusted endpoints',
      'No user consent for data transmission'
    ],
    indicators: [
      'Network POST requests with large payloads',
      'Base64 encoded message content',
      'External domain connections',
      'No local storage of backups'
    ]
  }
]

export const SECURITY_CHECKLIST = [
  {
    category: 'Installation Security',
    items: [
      { text: 'Never install skills from untrusted sources', critical: true },
      { text: 'Review skill code before installation', critical: true },
      { text: 'Check skill permissions and access requirements', critical: false },
      { text: 'Verify skill author reputation and reviews', critical: false },
      { text: 'Test skills in isolated environment first', critical: true }
    ]
  },
  {
    category: 'Network Security', 
    items: [
      { text: 'Never expose OpenClaw port 18789 to the internet', critical: true },
      { text: 'Use firewall rules to block external access', critical: true },
      { text: 'Run OpenClaw behind VPN or private network only', critical: false },
      { text: 'Monitor network traffic for suspicious activity', critical: false },
      { text: 'Disable unnecessary network features', critical: false }
    ]
  },
  {
    category: 'Container Security',
    items: [
      { text: 'Run OpenClaw in Docker with limited privileges', critical: true },
      { text: 'Mount only necessary directories as read-only', critical: true },
      { text: 'Use non-root user inside containers', critical: true },
      { text: 'Implement resource limits (CPU, memory, disk)', critical: false },
      { text: 'Regular security updates for base images', critical: false }
    ]
  },
  {
    category: 'Data Protection',
    items: [
      { text: 'Keep sensitive files outside OpenClaw workspace', critical: true },
      { text: 'Use encrypted storage for personal documents', critical: true },
      { text: 'Regular backups of important data', critical: false },
      { text: 'Monitor file access patterns', critical: false },
      { text: 'Implement data loss prevention tools', critical: false }
    ]
  }
]

export const THREAT_PATTERNS = [
  {
    type: 'Data Exfiltration',
    description: 'Skills that secretly upload personal data to external servers',
    patterns: [
      'POST requests with base64 encoded data',
      'File uploads to unknown domains',
      'Bulk data transmission patterns',
      'Hidden network activity'
    ],
    examples: ['Discord message history uploads', 'Document scanning and upload', 'Credential harvesting']
  },
  {
    type: 'File System Scanning',
    description: 'Skills that search for sensitive files beyond their stated purpose',
    patterns: [
      'Regex patterns for SSN, tax documents',
      'Directory traversal outside workspace',
      'Searching for financial keywords',
      'Password file enumeration'
    ],
    examples: ['Tax document searches', 'Social Security number extraction', 'Banking file access']
  },
  {
    type: 'Code Obfuscation',
    description: 'Skills that hide their true functionality using code obfuscation',
    patterns: [
      'Base64 encoded strings',
      'Dynamic code execution (eval)',
      'Encrypted or compressed code blocks',
      'Variable name obfuscation'
    ],
    examples: ['Hidden malicious functions', 'Disguised network requests', 'Concealed file operations']
  }
]