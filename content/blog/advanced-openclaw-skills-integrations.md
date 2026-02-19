# Advanced OpenClaw: Custom Skills & Integrations

*Master the art of extending OpenClaw with custom skills, API integrations, and channel plugins for enterprise-grade AI automation.*

## Table of Contents

1. [Introduction to OpenClaw Extensibility](#introduction)
2. [Understanding the Skills Architecture](#skills-architecture)
3. [Building Your First Custom Skill](#first-custom-skill)
4. [Advanced Skill Patterns](#advanced-patterns)
5. [API Integration Best Practices](#api-integrations)
6. [Channel Plugin Development](#channel-plugins)
7. [Testing and Debugging Skills](#testing-debugging)
8. [Performance Optimization](#performance)
9. [Security Considerations](#security)
10. [Publishing and Distribution](#publishing)

## Introduction to OpenClaw Extensibility {#introduction}

OpenClaw's power lies not just in its core functionality, but in its extensible architecture that allows developers to create custom skills, integrate external APIs, and build channel plugins that extend AI agents into any platform or workflow.

In this comprehensive guide, we'll take you from understanding the basics of OpenClaw's skill system to building production-ready integrations that can handle enterprise workloads.

### What You'll Learn

- **Custom Skill Development**: Build reusable capabilities that agents can invoke
- **API Integration Patterns**: Connect to external services securely and efficiently
- **Channel Plugin Architecture**: Create new communication channels for agents
- **Advanced Configuration**: Environment management and secret handling
- **Performance Optimization**: Scale skills for high-throughput scenarios
- **Security Best Practices**: Protect your integrations and user data

### Prerequisites

- Completed [Getting Started with OpenClaw Gateway](./getting-started-with-openclaw-gateway.md)
- Familiarity with [Multi-Agent Workflows](./building-multi-agent-workflow.md)
- Intermediate knowledge of Node.js, Python, or Go
- Understanding of REST APIs and authentication patterns

## Understanding the Skills Architecture {#skills-architecture}

OpenClaw skills are modular capabilities that agents can invoke to interact with external systems, perform specialized tasks, or process data in specific ways. The architecture follows a plugin-based model that promotes reusability and maintainability.

### Core Components

```
OpenClaw Gateway
├── Skill Registry
│   ├── Installed Skills Discovery
│   ├── Capability Mapping
│   └── Version Management
├── Execution Engine
│   ├── Sandboxed Runtime
│   ├── Resource Management
│   └── Error Handling
└── Communication Layer
    ├── Skill-to-Agent Interface
    ├── External API Connections
    └── Channel Plugin System
```

### Skill Types

OpenClaw supports several categories of skills:

#### 1. **Tool Skills**
Execute specific tasks or operations:
- File system operations
- Database queries
- External API calls
- Data processing tasks

```yaml
# Example: File manipulation skill
name: file-operations
type: tool
capabilities:
  - read_file
  - write_file
  - list_directory
  - compress_files
```

#### 2. **Integration Skills**
Connect to external services:
- CRM systems (Salesforce, HubSpot)
- Development tools (GitHub, Jira)
- Communication platforms (Slack, Teams)
- Cloud services (AWS, Azure, GCP)

```yaml
# Example: GitHub integration skill
name: github-pro
type: integration
services:
  - repositories
  - issues
  - pull_requests
  - actions
```

#### 3. **Processing Skills**
Transform or analyze data:
- Image processing
- Natural language analysis
- Data validation
- Format conversion

```yaml
# Example: Image processing skill
name: image-processor
type: processing
operations:
  - resize
  - convert_format
  - extract_metadata
  - apply_filters
```

#### 4. **Channel Skills**
Enable communication through new platforms:
- Custom messaging protocols
- IoT device communications
- Voice assistants
- Mobile app integrations

```yaml
# Example: Custom webhook channel
name: webhook-channel
type: channel
protocols:
  - incoming_webhooks
  - outgoing_webhooks
  - real_time_events
```

### Skill Manifest Structure

Every skill requires a manifest file that describes its capabilities:

```json
{
  "name": "advanced-crm-integration",
  "version": "2.1.0",
  "description": "Advanced CRM integration with multi-platform support",
  "type": "integration",
  "author": "Your Company <dev@yourcompany.com>",
  "license": "MIT",
  "openclaw_version": ">=1.5.0",
  "capabilities": [
    {
      "name": "create_lead",
      "description": "Create a new lead in the CRM",
      "parameters": {
        "email": { "type": "string", "required": true },
        "company": { "type": "string", "required": false },
        "source": { "type": "string", "default": "openclaw" }
      },
      "returns": "lead_id"
    },
    {
      "name": "update_opportunity", 
      "description": "Update an existing sales opportunity",
      "parameters": {
        "opportunity_id": { "type": "string", "required": true },
        "stage": { "type": "string", "required": true },
        "value": { "type": "number", "required": false }
      },
      "returns": "success_status"
    }
  ],
  "configuration": {
    "api_key": { 
      "type": "secret",
      "description": "CRM API key",
      "required": true 
    },
    "base_url": {
      "type": "string",
      "description": "CRM API base URL",
      "default": "https://api.crm-platform.com/v2"
    },
    "timeout": {
      "type": "number",
      "description": "Request timeout in seconds",
      "default": 30
    }
  },
  "dependencies": {
    "axios": "^1.6.0",
    "lodash": "^4.17.21"
  },
  "runtime": "node",
  "entry_point": "./src/index.js"
}
```

## Building Your First Custom Skill {#first-custom-skill}

Let's build a comprehensive custom skill that demonstrates key concepts. We'll create a "Smart Document Processor" that can analyze documents, extract key information, and integrate with cloud storage.

### Step 1: Project Setup

```bash
# Create a new skill project
mkdir smart-document-processor
cd smart-document-processor

# Initialize the project structure
npm init -y
mkdir src tests docs

# Install dependencies
npm install axios pdf-parse docx-parser sharp
npm install --save-dev jest nodemon
```

### Step 2: Create the Skill Manifest

```json
// manifest.json
{
  "name": "smart-document-processor",
  "version": "1.0.0",
  "description": "AI-powered document processing with cloud integration",
  "type": "processing",
  "author": "Advanced Developer <dev@example.com>",
  "license": "MIT",
  "openclaw_version": ">=1.5.0",
  "capabilities": [
    {
      "name": "analyze_document",
      "description": "Extract text and metadata from documents",
      "parameters": {
        "file_path": { "type": "string", "required": true },
        "extract_images": { "type": "boolean", "default": false },
        "language": { "type": "string", "default": "en" }
      },
      "returns": "analysis_result"
    },
    {
      "name": "classify_document",
      "description": "Classify document type and content category", 
      "parameters": {
        "text_content": { "type": "string", "required": true },
        "confidence_threshold": { "type": "number", "default": 0.8 }
      },
      "returns": "classification_result"
    },
    {
      "name": "upload_to_cloud",
      "description": "Upload processed documents to cloud storage",
      "parameters": {
        "file_path": { "type": "string", "required": true },
        "metadata": { "type": "object", "required": false },
        "folder": { "type": "string", "default": "processed" }
      },
      "returns": "upload_result"
    }
  ],
  "configuration": {
    "cloud_provider": {
      "type": "string",
      "enum": ["aws", "azure", "gcp"],
      "default": "aws"
    },
    "aws_access_key": {
      "type": "secret",
      "description": "AWS access key for S3 uploads"
    },
    "aws_secret_key": {
      "type": "secret", 
      "description": "AWS secret key for S3 uploads"
    },
    "s3_bucket": {
      "type": "string",
      "description": "S3 bucket name for document storage"
    },
    "max_file_size": {
      "type": "number",
      "description": "Maximum file size in MB",
      "default": 50
    }
  },
  "runtime": "node",
  "entry_point": "./src/index.js"
}
```

### Step 3: Implement Core Functionality

```javascript
// src/index.js
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const sharp = require('sharp');
const AWS = require('aws-sdk');

class SmartDocumentProcessor {
  constructor(config) {
    this.config = config;
    this.initializeCloudClient();
  }

  initializeCloudClient() {
    if (this.config.cloud_provider === 'aws') {
      AWS.config.update({
        accessKeyId: this.config.aws_access_key,
        secretAccessKey: this.config.aws_secret_key,
        region: this.config.aws_region || 'us-east-1'
      });
      this.s3 = new AWS.S3();
    }
  }

  async analyzeDocument(params) {
    try {
      const { file_path, extract_images, language } = params;
      
      // Validate file exists and size
      const stats = await fs.stat(file_path);
      const maxSize = (this.config.max_file_size || 50) * 1024 * 1024;
      
      if (stats.size > maxSize) {
        throw new Error(`File size exceeds maximum limit of ${this.config.max_file_size}MB`);
      }

      const extension = path.extname(file_path).toLowerCase();
      let result = {
        file_path,
        file_size: stats.size,
        file_type: extension,
        processed_at: new Date().toISOString(),
        text_content: '',
        metadata: {},
        images: []
      };

      // Process based on file type
      switch (extension) {
        case '.pdf':
          result = await this.processPDF(file_path, result, extract_images);
          break;
        case '.docx':
          result = await this.processDOCX(file_path, result, extract_images);
          break;
        case '.txt':
          result.text_content = await fs.readFile(file_path, 'utf8');
          break;
        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }

      // Extract metadata and perform analysis
      result.metadata = await this.extractMetadata(result.text_content, language);
      result.word_count = result.text_content.split(/\s+/).length;
      result.character_count = result.text_content.length;

      return {
        success: true,
        result,
        processing_time: Date.now() - stats.mtimeMs
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async processPDF(filePath, result, extractImages) {
    const buffer = await fs.readFile(filePath);
    const pdfData = await pdf(buffer);
    
    result.text_content = pdfData.text;
    result.metadata.pages = pdfData.numpages;
    result.metadata.pdf_info = pdfData.info;

    if (extractImages && pdfData.images && pdfData.images.length > 0) {
      // Process embedded images (simplified example)
      result.images = pdfData.images.map((img, index) => ({
        index,
        width: img.width,
        height: img.height,
        format: img.format
      }));
    }

    return result;
  }

  async processDOCX(filePath, result, extractImages) {
    const buffer = await fs.readFile(filePath);
    const docxResult = await mammoth.extractRawText({ buffer });
    
    result.text_content = docxResult.value;
    result.metadata.warnings = docxResult.messages;

    if (extractImages) {
      const imagesResult = await mammoth.images.imgElement(buffer, (element) => {
        return element.read().then(imageBuffer => {
          return {
            src: `data:${element.contentType};base64,${imageBuffer.toString('base64')}`
          };
        });
      });
      result.images = imagesResult.messages || [];
    }

    return result;
  }

  async extractMetadata(textContent, language) {
    // Sophisticated text analysis (simplified example)
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = textContent.toLowerCase().split(/\s+/);
    const uniqueWords = [...new Set(words)];
    
    // Keyword extraction (basic implementation)
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return {
      language_detected: language,
      sentence_count: sentences.length,
      vocabulary_size: uniqueWords.length,
      keywords,
      readability_score: this.calculateReadabilityScore(sentences, words),
      estimated_reading_time: Math.ceil(words.length / 200) // 200 WPM average
    };
  }

  calculateReadabilityScore(sentences, words) {
    // Flesch Reading Ease Score (simplified)
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllables = words.reduce((acc, word) => acc + this.countSyllables(word), 0) / words.length;
    
    return Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables)
    ));
  }

  countSyllables(word) {
    // Basic syllable counting
    return word.toLowerCase().replace(/[^aeiouy]/g, '').length || 1;
  }

  async classifyDocument(params) {
    try {
      const { text_content, confidence_threshold } = params;
      
      // Document classification logic (simplified ML approach)
      const classifications = [
        { type: 'contract', keywords: ['agreement', 'contract', 'terms', 'conditions', 'party'], weight: 1.0 },
        { type: 'invoice', keywords: ['invoice', 'payment', 'due', 'amount', 'total'], weight: 1.2 },
        { type: 'report', keywords: ['analysis', 'summary', 'findings', 'recommendation'], weight: 0.9 },
        { type: 'technical', keywords: ['system', 'configuration', 'implementation', 'architecture'], weight: 1.1 },
        { type: 'correspondence', keywords: ['dear', 'regards', 'sincerely', 'letter'], weight: 0.8 }
      ];

      const textLower = text_content.toLowerCase();
      const results = classifications.map(classification => {
        const score = classification.keywords.reduce((acc, keyword) => {
          const matches = (textLower.match(new RegExp(keyword, 'g')) || []).length;
          return acc + (matches * classification.weight);
        }, 0) / classification.keywords.length;

        return {
          type: classification.type,
          confidence: Math.min(1.0, score / 10), // Normalize to 0-1
          matched_keywords: classification.keywords.filter(k => textLower.includes(k))
        };
      });

      // Find best match above threshold
      const bestMatch = results
        .filter(r => r.confidence >= confidence_threshold)
        .sort((a, b) => b.confidence - a.confidence)[0];

      return {
        success: true,
        classification: bestMatch || { type: 'unknown', confidence: 0, matched_keywords: [] },
        all_scores: results.sort((a, b) => b.confidence - a.confidence),
        threshold_used: confidence_threshold
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async uploadToCloud(params) {
    try {
      const { file_path, metadata, folder } = params;
      
      if (this.config.cloud_provider !== 'aws') {
        throw new Error('Only AWS S3 is currently supported');
      }

      const fileBuffer = await fs.readFile(file_path);
      const fileName = path.basename(file_path);
      const key = `${folder}/${Date.now()}-${fileName}`;

      const uploadParams = {
        Bucket: this.config.s3_bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: this.getContentType(path.extname(file_path)),
        Metadata: {
          ...metadata,
          uploaded_by: 'openclaw-skill',
          upload_timestamp: new Date().toISOString()
        }
      };

      const uploadResult = await this.s3.upload(uploadParams).promise();

      return {
        success: true,
        upload_url: uploadResult.Location,
        s3_key: key,
        bucket: this.config.s3_bucket,
        file_size: fileBuffer.length,
        uploaded_at: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getContentType(extension) {
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    return contentTypes[extension] || 'application/octet-stream';
  }
}

// OpenClaw skill interface
module.exports = {
  initialize: async (config) => {
    return new SmartDocumentProcessor(config);
  },

  capabilities: {
    analyze_document: async (processor, params) => {
      return await processor.analyzeDocument(params);
    },

    classify_document: async (processor, params) => {
      return await processor.classifyDocument(params);
    },

    upload_to_cloud: async (processor, params) => {
      return await processor.uploadToCloud(params);
    }
  },

  health_check: async (processor) => {
    try {
      // Verify cloud connectivity if configured
      if (processor.config.cloud_provider === 'aws' && processor.config.s3_bucket) {
        await processor.s3.headBucket({ Bucket: processor.config.s3_bucket }).promise();
      }
      
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
};
```

### Step 4: Configuration and Environment

```javascript
// config/development.js
module.exports = {
  cloud_provider: 'aws',
  aws_region: 'us-east-1',
  s3_bucket: 'my-dev-documents-bucket',
  max_file_size: 25, // MB
  debug_mode: true,
  log_level: 'debug'
};

// config/production.js
module.exports = {
  cloud_provider: 'aws',
  aws_region: process.env.AWS_REGION || 'us-east-1',
  s3_bucket: process.env.S3_BUCKET,
  max_file_size: parseInt(process.env.MAX_FILE_SIZE) || 50,
  debug_mode: false,
  log_level: 'info'
};
```

### Step 5: Testing Framework

```javascript
// tests/skill.test.js
const { initialize, capabilities } = require('../src/index');
const fs = require('fs').promises;
const path = require('path');

describe('Smart Document Processor', () => {
  let processor;
  
  beforeAll(async () => {
    const testConfig = {
      cloud_provider: 'aws',
      max_file_size: 10,
      // Mock credentials for testing
      aws_access_key: 'test-key',
      aws_secret_key: 'test-secret',
      s3_bucket: 'test-bucket'
    };
    
    processor = await initialize(testConfig);
  });

  describe('Document Analysis', () => {
    test('should analyze PDF document', async () => {
      const testFile = path.join(__dirname, 'fixtures', 'sample.pdf');
      const result = await capabilities.analyze_document(processor, {
        file_path: testFile,
        extract_images: false,
        language: 'en'
      });

      expect(result.success).toBe(true);
      expect(result.result.text_content).toBeDefined();
      expect(result.result.metadata.pages).toBeGreaterThan(0);
      expect(result.result.word_count).toBeGreaterThan(0);
    });

    test('should handle unsupported file types', async () => {
      const result = await capabilities.analyze_document(processor, {
        file_path: '/path/to/unsupported.xyz'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    test('should respect file size limits', async () => {
      // Mock a large file
      const largeMockStats = { size: 15 * 1024 * 1024 }; // 15MB
      jest.spyOn(fs, 'stat').mockResolvedValueOnce(largeMockStats);

      const result = await capabilities.analyze_document(processor, {
        file_path: '/path/to/large-file.pdf'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds maximum limit');
    });
  });

  describe('Document Classification', () => {
    test('should classify contract documents', async () => {
      const contractText = `
        This agreement is entered into between Party A and Party B.
        The terms and conditions of this contract specify the obligations
        of each party under this agreement.
      `;

      const result = await capabilities.classify_document(processor, {
        text_content: contractText,
        confidence_threshold: 0.1
      });

      expect(result.success).toBe(true);
      expect(result.classification.type).toBe('contract');
      expect(result.classification.confidence).toBeGreaterThan(0.1);
    });

    test('should return unknown for unclassifiable documents', async () => {
      const randomText = 'Random text that does not match any category';
      
      const result = await capabilities.classify_document(processor, {
        text_content: randomText,
        confidence_threshold: 0.8
      });

      expect(result.success).toBe(true);
      expect(result.classification.type).toBe('unknown');
    });
  });

  describe('Health Checks', () => {
    test('should perform health check', async () => {
      const { health_check } = require('../src/index');
      const result = await health_check(processor);

      expect(result.status).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });
});
```

## Advanced Skill Patterns {#advanced-patterns}

Now that we've built a basic skill, let's explore advanced patterns that make skills production-ready and highly maintainable.

### 1. Asynchronous Operations and Callbacks

For long-running operations, implement proper async patterns:

```javascript
class AdvancedProcessor {
  async processDocumentAsync(params) {
    const jobId = this.generateJobId();
    
    // Start background processing
    this.startBackgroundJob(jobId, params);
    
    return {
      success: true,
      job_id: jobId,
      status: 'processing',
      estimated_completion: new Date(Date.now() + 60000).toISOString()
    };
  }

  async startBackgroundJob(jobId, params) {
    try {
      // Update job status
      await this.updateJobStatus(jobId, 'processing', { progress: 0 });
      
      // Perform the actual work with progress updates
      const steps = ['extracting', 'analyzing', 'classifying', 'uploading'];
      
      for (let i = 0; i < steps.length; i++) {
        await this.updateJobStatus(jobId, 'processing', { 
          progress: (i + 1) / steps.length * 100,
          current_step: steps[i]
        });
        
        await this.performStep(steps[i], params);
      }
      
      // Complete the job
      await this.updateJobStatus(jobId, 'completed', { 
        progress: 100,
        result: 'Job completed successfully'
      });
      
    } catch (error) {
      await this.updateJobStatus(jobId, 'failed', { 
        error: error.message,
        failed_at: new Date().toISOString()
      });
    }
  }

  async getJobStatus(params) {
    const { job_id } = params;
    return await this.retrieveJobStatus(job_id);
  }
}
```

### 2. Error Handling and Retries

Implement robust error handling with automatic retries:

```javascript
class ResilientProcessor {
  constructor(config) {
    this.config = config;
    this.retryConfig = {
      maxRetries: config.max_retries || 3,
      retryDelay: config.retry_delay || 1000,
      backoffMultiplier: config.backoff_multiplier || 2
    };
  }

  async executeWithRetry(operation, params, context = {}) {
    let lastError;
    let delay = this.retryConfig.retryDelay;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries + 1; attempt++) {
      try {
        const result = await operation(params);
        
        // Log successful retry if this wasn't the first attempt
        if (attempt > 1) {
          console.log(`Operation succeeded on attempt ${attempt}`, context);
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt > this.retryConfig.maxRetries) {
          throw error;
        }
        
        // Log retry attempt
        console.warn(`Operation failed on attempt ${attempt}, retrying in ${delay}ms`, {
          error: error.message,
          ...context
        });
        
        // Wait before retry
        await this.sleep(delay);
        delay *= this.retryConfig.backoffMultiplier;
      }
    }
    
    throw lastError;
  }

  isNonRetryableError(error) {
    const nonRetryablePatterns = [
      'Authentication failed',
      'Invalid file format',
      'File not found',
      'Permission denied'
    ];
    
    return nonRetryablePatterns.some(pattern => 
      error.message.includes(pattern)
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 3. Resource Management and Cleanup

Implement proper resource management:

```javascript
class ResourceManagedProcessor {
  constructor(config) {
    this.config = config;
    this.activeConnections = new Map();
    this.tempFiles = new Set();
    this.memoryUsage = { current: 0, peak: 0 };
  }

  async acquireResource(type, identifier, factory) {
    const key = `${type}:${identifier}`;
    
    if (!this.activeConnections.has(key)) {
      const resource = await factory();
      this.activeConnections.set(key, {
        resource,
        acquiredAt: Date.now(),
        lastUsed: Date.now(),
        useCount: 0
      });
    }
    
    const connection = this.activeConnections.get(key);
    connection.lastUsed = Date.now();
    connection.useCount++;
    
    return connection.resource;
  }

  async releaseResource(type, identifier) {
    const key = `${type}:${identifier}`;
    const connection = this.activeConnections.get(key);
    
    if (connection) {
      if (connection.resource.close) {
        await connection.resource.close();
      }
      this.activeConnections.delete(key);
    }
  }

  async createTempFile(prefix = 'openclaw-skill') {
    const tempPath = path.join(os.tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    this.tempFiles.add(tempPath);
    return tempPath;
  }

  async cleanup() {
    // Close all active connections
    for (const [key, connection] of this.activeConnections.entries()) {
      try {
        if (connection.resource.close) {
          await connection.resource.close();
        }
      } catch (error) {
        console.warn(`Error closing resource ${key}:`, error.message);
      }
    }
    this.activeConnections.clear();

    // Remove temporary files
    for (const tempFile of this.tempFiles) {
      try {
        await fs.unlink(tempFile);
      } catch (error) {
        // Ignore file not found errors
        if (error.code !== 'ENOENT') {
          console.warn(`Error removing temp file ${tempFile}:`, error.message);
        }
      }
    }
    this.tempFiles.clear();
  }

  // Monitor resource usage
  updateMemoryUsage(bytes) {
    this.memoryUsage.current += bytes;
    this.memoryUsage.peak = Math.max(this.memoryUsage.peak, this.memoryUsage.current);
    
    // Alert if memory usage is too high
    const maxMemory = this.config.max_memory_mb * 1024 * 1024;
    if (this.memoryUsage.current > maxMemory) {
      console.warn('High memory usage detected', {
        current: this.memoryUsage.current,
        peak: this.memoryUsage.peak,
        limit: maxMemory
      });
    }
  }
}
```

### 4. Configuration Management and Secrets

Handle configuration and secrets securely:

```javascript
class SecureConfigManager {
  constructor(skillName) {
    this.skillName = skillName;
    this.config = {};
    this.secrets = {};
  }

  async loadConfiguration(environment = process.env.NODE_ENV || 'development') {
    // Load base configuration
    const configPath = path.join(__dirname, '..', 'config', `${environment}.js`);
    if (await fs.access(configPath).then(() => true).catch(() => false)) {
      this.config = { ...this.config, ...require(configPath) };
    }

    // Load secrets from secure storage
    await this.loadSecrets();

    // Override with environment variables
    this.loadEnvironmentOverrides();

    return this.getConfiguration();
  }

  async loadSecrets() {
    // In production, load from AWS Secrets Manager, HashiCorp Vault, etc.
    if (process.env.NODE_ENV === 'production') {
      await this.loadSecretsFromVault();
    } else {
      // In development, load from local secure file
      await this.loadSecretsFromFile();
    }
  }

  async loadSecretsFromVault() {
    // Example: AWS Secrets Manager integration
    const AWS = require('aws-sdk');
    const secretsManager = new AWS.SecretsManager();

    try {
      const secretName = `openclaw-skill-${this.skillName}`;
      const result = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
      const secrets = JSON.parse(result.SecretString);
      
      this.secrets = { ...this.secrets, ...secrets };
    } catch (error) {
      console.warn('Could not load secrets from vault:', error.message);
    }
  }

  async loadSecretsFromFile() {
    const secretsPath = path.join(os.homedir(), '.openclaw', 'secrets', `${this.skillName}.json`);
    
    try {
      if (await fs.access(secretsPath).then(() => true).catch(() => false)) {
        const secretsData = await fs.readFile(secretsPath, 'utf8');
        this.secrets = { ...this.secrets, ...JSON.parse(secretsData) };
      }
    } catch (error) {
      console.warn('Could not load secrets from file:', error.message);
    }
  }

  loadEnvironmentOverrides() {
    const prefix = `OPENCLAW_SKILL_${this.skillName.toUpperCase().replace(/-/g, '_')}_`;
    
    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(prefix)) {
        const configKey = key.slice(prefix.length).toLowerCase();
        this.config[configKey] = this.parseEnvironmentValue(value);
      }
    }
  }

  parseEnvironmentValue(value) {
    // Try to parse as JSON first
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {}
    }

    // Parse booleans and numbers
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(value) && !isNaN(parseFloat(value))) return parseFloat(value);

    return value;
  }

  getConfiguration() {
    return {
      ...this.config,
      ...this.secrets
    };
  }

  // Safely log configuration (without secrets)
  getLoggableConfig() {
    const loggable = { ...this.config };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'secret', 'token', 'key', 'auth'];
    for (const field of Object.keys(loggable)) {
      if (sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive))) {
        loggable[field] = '[REDACTED]';
      }
    }
    
    return loggable;
  }
}
```

## API Integration Best Practices {#api-integrations}

When integrating with external APIs, follow these patterns for reliability and maintainability:

### 1. HTTP Client Configuration

```javascript
const axios = require('axios');
const rateLimit = require('axios-rate-limit');

class APIIntegration {
  constructor(config) {
    this.config = config;
    this.client = this.createHTTPClient();
  }

  createHTTPClient() {
    // Base Axios configuration
    const client = axios.create({
      baseURL: this.config.api_base_url,
      timeout: this.config.timeout || 30000,
      headers: {
        'User-Agent': `OpenClaw-Skill/${this.config.skill_version || '1.0.0'}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Add rate limiting
    const rateLimitedClient = rateLimit(client, { 
      maxRequests: this.config.rate_limit_requests || 100,
      perMilliseconds: this.config.rate_limit_window || 60000
    });

    // Request interceptor for authentication
    rateLimitedClient.interceptors.request.use(
      (config) => this.addAuthentication(config),
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    rateLimitedClient.interceptors.response.use(
      (response) => response,
      (error) => this.handleAPIError(error)
    );

    return rateLimitedClient;
  }

  async addAuthentication(config) {
    // Different authentication strategies
    switch (this.config.auth_type) {
      case 'bearer':
        config.headers.Authorization = `Bearer ${this.config.api_token}`;
        break;
      case 'api_key':
        config.headers['X-API-Key'] = this.config.api_key;
        break;
      case 'oauth2':
        const token = await this.getOAuth2Token();
        config.headers.Authorization = `Bearer ${token}`;
        break;
    }
    
    return config;
  }

  async handleAPIError(error) {
    if (error.response) {
      const { status, data, config } = error.response;
      
      // Log API errors with context
      console.error('API Error:', {
        status,
        url: config.url,
        method: config.method,
        data: data,
        headers: config.headers
      });

      // Handle specific error types
      switch (status) {
        case 401:
          // Token might be expired, try to refresh
          if (this.config.auth_type === 'oauth2') {
            await this.refreshOAuth2Token();
            // Retry the original request
            return this.client.request(config);
          }
          break;
        case 429:
          // Rate limited - implement backoff
          const retryAfter = error.response.headers['retry-after'] || 60;
          console.warn(`Rate limited. Retrying after ${retryAfter} seconds`);
          await this.sleep(retryAfter * 1000);
          return this.client.request(config);
        case 503:
          // Service unavailable - implement exponential backoff
          return this.retryWithBackoff(config);
      }
    }
    
    throw error;
  }

  async retryWithBackoff(config, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.sleep(baseDelay * Math.pow(2, attempt - 1));
        return await this.client.request(config);
      } catch (error) {
        if (attempt === maxRetries) throw error;
        console.warn(`Retry attempt ${attempt} failed, trying again...`);
      }
    }
  }
}
```

### 2. Webhook Handling

For real-time integrations, implement webhook support:

```javascript
const express = require('express');
const crypto = require('crypto');

class WebhookHandler {
  constructor(skill, config) {
    this.skill = skill;
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // Raw body parser for webhook verification
    this.app.use('/webhook', express.raw({ type: 'application/json' }));
    
    // Standard JSON parser for other routes
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Main webhook endpoint
    this.app.post('/webhook', async (req, res) => {
      try {
        // Verify webhook signature
        if (!this.verifySignature(req)) {
          return res.status(401).json({ error: 'Invalid signature' });
        }

        // Parse webhook payload
        const payload = JSON.parse(req.body.toString());
        
        // Process webhook event
        const result = await this.processWebhookEvent(payload, req.headers);
        
        res.json({ success: true, result });
        
      } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ 
          error: 'Webhook processing failed',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Webhook management endpoints
    this.app.post('/webhook/subscribe', this.handleSubscribe.bind(this));
    this.app.delete('/webhook/unsubscribe', this.handleUnsubscribe.bind(this));
    this.app.get('/webhook/subscriptions', this.listSubscriptions.bind(this));
  }

  verifySignature(req) {
    const signature = req.headers['x-webhook-signature'] || req.headers['x-hub-signature'];
    if (!signature || !this.config.webhook_secret) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhook_secret)
      .update(req.body, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  async processWebhookEvent(payload, headers) {
    const eventType = headers['x-event-type'] || payload.type;
    
    switch (eventType) {
      case 'document.uploaded':
        return await this.handleDocumentUploaded(payload);
      case 'processing.completed':
        return await this.handleProcessingCompleted(payload);
      case 'error.occurred':
        return await this.handleErrorOccurred(payload);
      default:
        console.warn('Unknown webhook event type:', eventType);
        return { acknowledged: true, processed: false };
    }
  }

  async handleDocumentUploaded(payload) {
    const { document_id, file_url, metadata } = payload;
    
    // Trigger document analysis
    const analysisResult = await this.skill.analyzeDocument({
      file_path: file_url,
      extract_images: true,
      language: metadata.language || 'en'
    });

    // Store results and notify interested parties
    await this.notifyAgents('document_analyzed', {
      document_id,
      analysis: analysisResult
    });

    return { document_id, status: 'processed' };
  }

  start(port = 3000) {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`Webhook server listening on port ${port}`);
          resolve(this.server);
        }
      });
    });
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }
  }
}
```

### 3. Caching and Performance

Implement intelligent caching for external API calls:

```javascript
const NodeCache = require('node-cache');
const Redis = require('redis');

class CachingAPIClient {
  constructor(config) {
    this.config = config;
    this.memoryCache = new NodeCache({ 
      stdTTL: config.memory_cache_ttl || 300,
      checkperiod: 60 
    });
    
    if (config.redis_url) {
      this.redisClient = Redis.createClient({ url: config.redis_url });
    }
  }

  async get(key, fetchFunction, options = {}) {
    const {
      ttl = 300,
      useMemory = true,
      useRedis = true,
      forceRefresh = false
    } = options;

    if (!forceRefresh) {
      // Try memory cache first
      if (useMemory) {
        const memoryResult = this.memoryCache.get(key);
        if (memoryResult !== undefined) {
          return memoryResult;
        }
      }

      // Try Redis cache
      if (useRedis && this.redisClient) {
        try {
          const redisResult = await this.redisClient.get(key);
          if (redisResult !== null) {
            const parsed = JSON.parse(redisResult);
            
            // Store in memory cache for faster subsequent access
            if (useMemory) {
              this.memoryCache.set(key, parsed, ttl);
            }
            
            return parsed;
          }
        } catch (error) {
          console.warn('Redis cache error:', error.message);
        }
      }
    }

    // Fetch fresh data
    const freshData = await fetchFunction();

    // Store in caches
    if (useMemory) {
      this.memoryCache.set(key, freshData, ttl);
    }

    if (useRedis && this.redisClient) {
      try {
        await this.redisClient.setEx(key, ttl, JSON.stringify(freshData));
      } catch (error) {
        console.warn('Redis cache set error:', error.message);
      }
    }

    return freshData;
  }

  async invalidate(pattern) {
    // Clear memory cache
    if (pattern.includes('*')) {
      const keys = this.memoryCache.keys().filter(key => 
        key.includes(pattern.replace('*', ''))
      );
      keys.forEach(key => this.memoryCache.del(key));
    } else {
      this.memoryCache.del(pattern);
    }

    // Clear Redis cache
    if (this.redisClient) {
      try {
        if (pattern.includes('*')) {
          const keys = await this.redisClient.keys(pattern);
          if (keys.length > 0) {
            await this.redisClient.del(keys);
          }
        } else {
          await this.redisClient.del(pattern);
        }
      } catch (error) {
        console.warn('Redis cache invalidation error:', error.message);
      }
    }
  }

  // Pre-warm cache with frequently accessed data
  async warmCache(warmupData) {
    for (const { key, fetchFunction, ttl } of warmupData) {
      try {
        await this.get(key, fetchFunction, { ttl, forceRefresh: true });
      } catch (error) {
        console.warn(`Cache warmup failed for ${key}:`, error.message);
      }
    }
  }

  getStats() {
    const memoryStats = this.memoryCache.getStats();
    
    return {
      memory: {
        keys: memoryStats.keys,
        hits: memoryStats.hits,
        misses: memoryStats.misses,
        hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) || 0
      },
      redis: this.redisClient ? { connected: this.redisClient.isReady } : null
    };
  }
}
```

## Channel Plugin Development {#channel-plugins}

Channel plugins enable OpenClaw agents to communicate through new platforms. Here's how to build a custom channel plugin:

### 1. Channel Plugin Architecture

```javascript
// Custom Slack Channel Plugin
class SlackChannelPlugin {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.activeConnections = new Map();
    this.messageQueue = [];
    this.isConnected = false;
  }

  async initialize() {
    const { WebClient, RTMClient } = require('@slack/web-api');
    
    // Initialize Slack web client
    this.client = new WebClient(this.config.slack_token);
    
    // Initialize real-time messaging
    this.rtmClient = new RTMClient(this.config.slack_token);
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Start connection
    await this.rtmClient.start();
    this.isConnected = true;
    
    console.log('Slack channel plugin initialized');
  }

  setupEventHandlers() {
    // Handle incoming messages
    this.rtmClient.on('message', async (event) => {
      if (event.subtype || event.bot_id) {
        return; // Ignore system messages and bot messages
      }

      await this.handleIncomingMessage(event);
    });

    // Handle connection events
    this.rtmClient.on('connected', () => {
      console.log('Connected to Slack RTM');
      this.isConnected = true;
    });

    this.rtmClient.on('disconnected', () => {
      console.log('Disconnected from Slack RTM');
      this.isConnected = false;
    });

    // Handle errors
    this.rtmClient.on('error', (error) => {
      console.error('Slack RTM error:', error);
      this.handleConnectionError(error);
    });
  }

  async handleIncomingMessage(event) {
    try {
      // Get channel and user information
      const channelInfo = await this.client.conversations.info({
        channel: event.channel
      });
      
      const userInfo = await this.client.users.info({
        user: event.user
      });

      // Create OpenClaw message format
      const message = {
        id: event.ts,
        text: event.text,
        sender: {
          id: userInfo.user.id,
          name: userInfo.user.real_name || userInfo.user.name,
          username: userInfo.user.name
        },
        channel: {
          id: channelInfo.channel.id,
          name: channelInfo.channel.name,
          type: channelInfo.channel.is_private ? 'private' : 'public'
        },
        timestamp: new Date(parseFloat(event.ts) * 1000).toISOString(),
        platform: 'slack'
      };

      // Check if this is a direct message to a bot
      const isDM = channelInfo.channel.is_im;
      const mentionsBots = this.extractBotMentions(event.text);
      
      if (isDM || mentionsBots.length > 0) {
        // Route to appropriate agent
        await this.routeToAgent(message, mentionsBots);
      }

    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  extractBotMentions(text) {
    // Extract @mentions that correspond to OpenClaw agents
    const mentionPattern = /<@(U[A-Z0-9]+)>/g;
    const mentions = [];
    let match;

    while ((match = mentionPattern.exec(text)) !== null) {
      const userId = match[1];
      // Check if this user ID corresponds to an OpenClaw agent
      const agent = this.findAgentBySlackUserId(userId);
      if (agent) {
        mentions.push(agent);
      }
    }

    return mentions;
  }

  async routeToAgent(message, mentionedAgents) {
    // If specific agents mentioned, route to them
    if (mentionedAgents.length > 0) {
      for (const agent of mentionedAgents) {
        await this.sendToOpenClaw(agent.id, message);
      }
    } else {
      // Use default routing logic
      const defaultAgent = this.config.default_agent || 'assistant';
      await this.sendToOpenClaw(defaultAgent, message);
    }
  }

  async sendToOpenClaw(agentId, message) {
    // Interface with OpenClaw Gateway to send message to agent
    const response = await this.makeOpenClawRequest('POST', `/agents/${agentId}/messages`, {
      content: message.text,
      sender: message.sender,
      channel: message.channel,
      platform: 'slack',
      message_id: message.id
    });

    // Store the conversation context
    this.storeConversationContext(message.channel.id, agentId, message);

    return response;
  }

  // Send message from agent back to Slack
  async sendMessage(channelId, content, options = {}) {
    try {
      const {
        thread_ts,
        attachments,
        blocks,
        unfurl_links = false,
        unfurl_media = true
      } = options;

      const result = await this.client.chat.postMessage({
        channel: channelId,
        text: content,
        thread_ts,
        attachments,
        blocks,
        unfurl_links,
        unfurl_media,
        as_user: false,
        username: this.config.bot_name || 'OpenClaw Agent'
      });

      return {
        success: true,
        message_id: result.ts,
        channel: result.channel
      };

    } catch (error) {
      console.error('Error sending Slack message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload files to Slack
  async uploadFile(filePath, channelId, options = {}) {
    try {
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(filePath);
      
      const result = await this.client.files.upload({
        channels: channelId,
        file: fileBuffer,
        filename: options.filename || path.basename(filePath),
        title: options.title,
        initial_comment: options.comment,
        thread_ts: options.thread_ts
      });

      return {
        success: true,
        file_id: result.file.id,
        url: result.file.url_private
      };

    } catch (error) {
      console.error('Error uploading file to Slack:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle interactive components (buttons, select menus, etc.)
  async handleInteraction(payload) {
    const { type, user, channel, actions, trigger_id } = payload;

    switch (type) {
      case 'button_click':
        return await this.handleButtonClick(payload);
      case 'select_menu':
        return await this.handleSelectMenu(payload);
      case 'dialog_submission':
        return await this.handleDialogSubmission(payload);
      case 'shortcut':
        return await this.handleShortcut(payload);
    }
  }

  async handleButtonClick(payload) {
    const { actions, user, channel } = payload;
    const action = actions[0];

    // Parse the action value to determine what to do
    const [actionType, ...params] = action.value.split(':');

    switch (actionType) {
      case 'agent_spawn':
        const agentType = params[0];
        return await this.spawnAgent(agentType, channel.id, user.id);
      
      case 'task_approve':
        const taskId = params[0];
        return await this.approveTask(taskId, user.id);
      
      case 'get_help':
        return await this.showHelpDialog(payload.trigger_id);
    }
  }

  // Create rich interactive messages
  createInteractiveMessage(text, blocks = []) {
    return {
      text,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: text
          }
        },
        ...blocks
      ]
    };
  }

  createActionBlock(buttons) {
    return {
      type: 'actions',
      elements: buttons.map(button => ({
        type: 'button',
        text: {
          type: 'plain_text',
          text: button.text
        },
        value: button.value,
        action_id: button.action_id,
        style: button.style || 'default'
      }))
    };
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.auth.test();
      return {
        status: 'healthy',
        connected: this.isConnected,
        team: response.team,
        user: response.user,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        connected: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  async shutdown() {
    if (this.rtmClient) {
      await this.rtmClient.disconnect();
    }
    this.isConnected = false;
    console.log('Slack channel plugin shut down');
  }
}

module.exports = SlackChannelPlugin;
```

### 2. Channel Plugin Registration

```javascript
// Plugin manifest for channel registration
const channelManifest = {
  "name": "slack-advanced",
  "version": "1.2.0", 
  "description": "Advanced Slack integration with interactive features",
  "type": "channel",
  "author": "Your Company <dev@yourcompany.com>",
  "platform": "slack",
  "capabilities": [
    "send_message",
    "receive_message", 
    "upload_file",
    "interactive_components",
    "real_time_messaging",
    "thread_support",
    "rich_formatting",
    "emoji_reactions"
  ],
  "configuration": {
    "slack_token": {
      "type": "secret",
      "description": "Slack Bot User OAuth Token",
      "required": true
    },
    "signing_secret": {
      "type": "secret",
      "description": "Slack app signing secret for request verification",
      "required": true
    },
    "default_agent": {
      "type": "string", 
      "description": "Default agent to route messages to",
      "default": "assistant"
    },
    "bot_name": {
      "type": "string",
      "description": "Display name for the bot",
      "default": "OpenClaw Agent"
    }
  },
  "events": {
    "message_received": "Triggered when a message is received",
    "message_sent": "Triggered when a message is sent",
    "file_uploaded": "Triggered when a file is uploaded",
    "interaction_received": "Triggered when user interacts with UI elements"
  },
  "entry_point": "./src/slack-channel.js"
};
```

## Testing and Debugging Skills {#testing-debugging}

Comprehensive testing is crucial for reliable skills:

### 1. Unit Testing Framework

```javascript
// tests/setup.js
const { TestEnvironment } = require('./test-environment');

let testEnv;

beforeAll(async () => {
  testEnv = new TestEnvironment();
  await testEnv.setup();
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(() => {
  testEnv.reset();
});

global.testEnv = testEnv;

// tests/test-environment.js
class TestEnvironment {
  constructor() {
    this.mockServices = {};
    this.testData = {};
    this.tempFiles = [];
  }

  async setup() {
    // Create test database
    this.db = await this.createTestDatabase();
    
    // Setup mock external services
    this.setupMockServices();
    
    // Create test files
    await this.createTestFiles();
  }

  setupMockServices() {
    // Mock S3 service
    this.mockServices.s3 = {
      upload: jest.fn().mockResolvedValue({
        Location: 'https://test-bucket.s3.amazonaws.com/test-file.pdf',
        ETag: '"test-etag"',
        Bucket: 'test-bucket',
        Key: 'test-file.pdf'
      }),
      
      headBucket: jest.fn().mockResolvedValue({}),
      
      getObject: jest.fn().mockResolvedValue({
        Body: Buffer.from('test file content'),
        ContentType: 'application/pdf',
        LastModified: new Date()
      })
    };

    // Mock HTTP client
    this.mockServices.httpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
  }

  async createTestFiles() {
    const fs = require('fs').promises;
    const path = require('path');
    
    const testDir = path.join(__dirname, 'fixtures');
    await fs.mkdir(testDir, { recursive: true });

    // Create test PDF (mock)
    const testPdfPath = path.join(testDir, 'sample.pdf');
    await fs.writeFile(testPdfPath, 'Mock PDF content');
    this.tempFiles.push(testPdfPath);

    // Create test DOCX (mock)
    const testDocxPath = path.join(testDir, 'sample.docx');
    await fs.writeFile(testDocxPath, 'Mock DOCX content');
    this.tempFiles.push(testDocxPath);

    this.testData.sampleFiles = {
      pdf: testPdfPath,
      docx: testDocxPath
    };
  }

  async cleanup() {
    // Remove test files
    const fs = require('fs').promises;
    for (const file of this.tempFiles) {
      try {
        await fs.unlink(file);
      } catch (error) {
        console.warn(`Could not remove test file ${file}:`, error.message);
      }
    }

    // Close database connection
    if (this.db && this.db.close) {
      await this.db.close();
    }
  }

  reset() {
    // Reset all mocks
    Object.values(this.mockServices).forEach(service => {
      Object.values(service).forEach(method => {
        if (jest.isMockFunction(method)) {
          method.mockClear();
        }
      });
    });
  }

  // Helper methods for test data
  createTestConfig(overrides = {}) {
    return {
      cloud_provider: 'aws',
      max_file_size: 10,
      aws_access_key: 'test-access-key',
      aws_secret_key: 'test-secret-key',
      s3_bucket: 'test-bucket',
      ...overrides
    };
  }

  createTestDocument(type = 'pdf') {
    return this.testData.sampleFiles[type];
  }
}
```

### 2. Integration Testing

```javascript
// tests/integration.test.js
describe('Document Processing Integration', () => {
  let processor;

  beforeEach(async () => {
    const { initialize } = require('../src/index');
    const config = testEnv.createTestConfig();
    processor = await initialize(config);
    
    // Inject mocks
    processor.s3 = testEnv.mockServices.s3;
  });

  describe('End-to-end document processing', () => {
    test('should process document from upload to cloud storage', async () => {
      const testFile = testEnv.createTestDocument('pdf');
      
      // Step 1: Analyze document
      const analysisResult = await processor.analyzeDocument({
        file_path: testFile,
        extract_images: false,
        language: 'en'
      });
      
      expect(analysisResult.success).toBe(true);
      expect(analysisResult.result.text_content).toBeDefined();
      
      // Step 2: Classify document
      const classificationResult = await processor.classifyDocument({
        text_content: analysisResult.result.text_content,
        confidence_threshold: 0.1
      });
      
      expect(classificationResult.success).toBe(true);
      
      // Step 3: Upload to cloud
      const uploadResult = await processor.uploadToCloud({
        file_path: testFile,
        metadata: {
          classification: classificationResult.classification.type,
          analyzed_at: new Date().toISOString()
        },
        folder: 'processed'
      });
      
      expect(uploadResult.success).toBe(true);
      expect(uploadResult.upload_url).toBeDefined();
      
      // Verify S3 upload was called
      expect(testEnv.mockServices.s3.upload).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: expect.stringContaining('processed/'),
          Metadata: expect.objectContaining({
            classification: classificationResult.classification.type
          })
        })
      );
    });
  });

  describe('Error handling', () => {
    test('should handle S3 upload failures gracefully', async () => {
      // Mock S3 failure
      testEnv.mockServices.s3.upload.mockRejectedValueOnce(
        new Error('S3 service unavailable')
      );
      
      const testFile = testEnv.createTestDocument('pdf');
      
      const result = await processor.uploadToCloud({
        file_path: testFile,
        folder: 'processed'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('S3 service unavailable');
    });
    
    test('should retry on transient failures', async () => {
      // Mock transient failure followed by success
      testEnv.mockServices.s3.upload
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce({
          Location: 'https://test-bucket.s3.amazonaws.com/retry-test.pdf'
        });
      
      const testFile = testEnv.createTestDocument('pdf');
      
      const result = await processor.uploadToCloud({
        file_path: testFile,
        folder: 'processed'
      });
      
      expect(result.success).toBe(true);
      expect(testEnv.mockServices.s3.upload).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance tests', () => {
    test('should process multiple documents concurrently', async () => {
      const testFiles = [
        testEnv.createTestDocument('pdf'),
        testEnv.createTestDocument('docx')
      ];
      
      const startTime = Date.now();
      
      const results = await Promise.all(
        testFiles.map(file => processor.analyzeDocument({
          file_path: file,
          extract_images: false,
          language: 'en'
        }))
      );
      
      const processingTime = Date.now() - startTime;
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // Should complete in reasonable time
      expect(processingTime).toBeLessThan(5000); // 5 seconds
    });
    
    test('should handle large files within memory limits', async () => {
      const testFile = testEnv.createTestDocument('pdf');
      
      // Monitor memory usage
      const initialMemory = process.memoryUsage();
      
      const result = await processor.analyzeDocument({
        file_path: testFile,
        extract_images: true,
        language: 'en'
      });
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      expect(result.success).toBe(true);
      
      // Memory increase should be reasonable (less than 100MB for test files)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });
});
```

### 3. Debugging Tools

```javascript
// debugging/skill-debugger.js
class SkillDebugger {
  constructor(skill, config) {
    this.skill = skill;
    this.config = config;
    this.traceLog = [];
    this.performanceMetrics = {};
  }

  // Wrap skill methods with debugging
  wrapSkillMethods() {
    const originalMethods = {};
    
    for (const [methodName, method] of Object.entries(this.skill.capabilities)) {
      originalMethods[methodName] = method;
      
      this.skill.capabilities[methodName] = async (processor, params) => {
        return await this.executeWithDebugging(
          methodName,
          () => originalMethods[methodName](processor, params),
          { params }
        );
      };
    }
    
    return originalMethods;
  }

  async executeWithDebugging(operationName, operation, context = {}) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    // Create trace entry
    const traceId = this.generateTraceId();
    const traceEntry = {
      trace_id: traceId,
      operation: operationName,
      started_at: new Date().toISOString(),
      context,
      status: 'running'
    };
    
    this.traceLog.push(traceEntry);
    
    try {
      console.log(`[DEBUG] Starting ${operationName}`, context);
      
      const result = await operation();
      
      // Calculate metrics
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      const duration = endTime - startTime;
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      
      // Update trace entry
      traceEntry.status = 'completed';
      traceEntry.completed_at = new Date().toISOString();
      traceEntry.duration_ms = duration;
      traceEntry.memory_delta_bytes = memoryDelta;
      traceEntry.result_summary = this.summarizeResult(result);
      
      // Update performance metrics
      this.updatePerformanceMetrics(operationName, duration, memoryDelta);
      
      console.log(`[DEBUG] Completed ${operationName}`, {
        duration_ms: duration,
        memory_delta_mb: Math.round(memoryDelta / 1024 / 1024 * 100) / 100,
        success: result.success
      });
      
      return result;
      
    } catch (error) {
      // Update trace entry with error
      traceEntry.status = 'failed';
      traceEntry.completed_at = new Date().toISOString();
      traceEntry.duration_ms = Date.now() - startTime;
      traceEntry.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
      
      console.error(`[DEBUG] Failed ${operationName}`, {
        error: error.message,
        duration_ms: Date.now() - startTime
      });
      
      throw error;
    }
  }

  summarizeResult(result) {
    if (typeof result !== 'object') {
      return { type: typeof result, value: result };
    }
    
    const summary = { type: 'object' };
    
    if (result.success !== undefined) {
      summary.success = result.success;
    }
    
    if (result.result) {
      summary.result_keys = Object.keys(result.result);
    }
    
    if (result.error) {
      summary.error = result.error;
    }
    
    return summary;
  }

  updatePerformanceMetrics(operationName, duration, memoryDelta) {
    if (!this.performanceMetrics[operationName]) {
      this.performanceMetrics[operationName] = {
        calls: 0,
        total_duration: 0,
        avg_duration: 0,
        min_duration: Infinity,
        max_duration: 0,
        total_memory_delta: 0,
        avg_memory_delta: 0
      };
    }
    
    const metrics = this.performanceMetrics[operationName];
    metrics.calls++;
    metrics.total_duration += duration;
    metrics.avg_duration = metrics.total_duration / metrics.calls;
    metrics.min_duration = Math.min(metrics.min_duration, duration);
    metrics.max_duration = Math.max(metrics.max_duration, duration);
    metrics.total_memory_delta += memoryDelta;
    metrics.avg_memory_delta = metrics.total_memory_delta / metrics.calls;
  }

  generateTraceId() {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export debugging data
  exportDebugData() {
    return {
      trace_log: this.traceLog,
      performance_metrics: this.performanceMetrics,
      config_summary: this.getConfigSummary(),
      system_info: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime()
      },
      exported_at: new Date().toISOString()
    };
  }

  getConfigSummary() {
    // Return config without sensitive information
    const summary = { ...this.config };
    const sensitiveFields = ['token', 'key', 'secret', 'password'];
    
    for (const field of Object.keys(summary)) {
      if (sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive))) {
        summary[field] = '[REDACTED]';
      }
    }
    
    return summary;
  }

  // Generate debug report
  generateReport() {
    const data = this.exportDebugData();
    
    let report = '# Skill Debug Report\n\n';
    report += `Generated: ${data.exported_at}\n`;
    report += `Node.js: ${data.system_info.node_version}\n`;
    report += `Platform: ${data.system_info.platform}\n\n`;
    
    report += '## Performance Metrics\n\n';
    for (const [operation, metrics] of Object.entries(data.performance_metrics)) {
      report += `### ${operation}\n`;
      report += `- Calls: ${metrics.calls}\n`;
      report += `- Avg Duration: ${Math.round(metrics.avg_duration)}ms\n`;
      report += `- Min/Max Duration: ${Math.round(metrics.min_duration)}ms / ${Math.round(metrics.max_duration)}ms\n`;
      report += `- Avg Memory Delta: ${Math.round(metrics.avg_memory_delta / 1024 / 1024 * 100) / 100}MB\n\n`;
    }
    
    report += '## Recent Traces\n\n';
    const recentTraces = data.trace_log.slice(-10);
    for (const trace of recentTraces) {
      report += `### ${trace.operation} (${trace.trace_id})\n`;
      report += `- Status: ${trace.status}\n`;
      report += `- Duration: ${trace.duration_ms || 'N/A'}ms\n`;
      if (trace.error) {
        report += `- Error: ${trace.error.message}\n`;
      }
      report += '\n';
    }
    
    return report;
  }

  // Save debug data to file
  async saveDebugData(filePath) {
    const fs = require('fs').promises;
    const data = this.exportDebugData();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  // Clear debug data
  clear() {
    this.traceLog = [];
    this.performanceMetrics = {};
  }
}

module.exports = SkillDebugger;
```

## Performance Optimization {#performance}

Optimize your skills for high-throughput production environments:

### 1. Memory Management

```javascript
class MemoryOptimizedProcessor {
  constructor(config) {
    this.config = config;
    this.memoryThresholds = {
      warning: (config.max_memory_mb || 512) * 1024 * 1024 * 0.8,
      critical: (config.max_memory_mb || 512) * 1024 * 1024 * 0.95
    };
    
    this.memoryMonitor = new MemoryMonitor(this.memoryThresholds);
    this.objectPool = new ObjectPool();
  }

  async processWithMemoryManagement(operation, data) {
    // Check memory before processing
    const memoryBefore = process.memoryUsage();
    
    if (memoryBefore.heapUsed > this.memoryThresholds.warning) {
      console.warn('High memory usage detected, triggering garbage collection');
      global.gc && global.gc();
    }
    
    if (memoryBefore.heapUsed > this.memoryThresholds.critical) {
      throw new Error('Memory usage too high, refusing to process more data');
    }

    try {
      // Use object pooling for frequent operations
      const processor = this.objectPool.acquire('processor');
      
      const result = await operation(processor, data);
      
      // Return object to pool
      this.objectPool.release('processor', processor);
      
      return result;
      
    } finally {
      // Monitor memory after processing
      const memoryAfter = process.memoryUsage();
      const memoryDelta = memoryAfter.heapUsed - memoryBefore.heapUsed;
      
      if (memoryDelta > 50 * 1024 * 1024) { // 50MB threshold
        console.warn('Large memory increase detected', {
          delta_mb: Math.round(memoryDelta / 1024 / 1024),
          heap_used_mb: Math.round(memoryAfter.heapUsed / 1024 / 1024)
        });
      }
    }
  }

  // Streaming processing for large files
  async processLargeFile(filePath, processor) {
    const fs = require('fs');
    const readline = require('readline');
    
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    const results = [];
    let lineCount = 0;
    const batchSize = this.config.batch_size || 1000;
    let batch = [];
    
    for await (const line of rl) {
      batch.push(line);
      lineCount++;
      
      // Process in batches to manage memory
      if (batch.length >= batchSize) {
        const batchResult = await processor.processBatch(batch);
        results.push(batchResult);
        
        // Clear batch and trigger garbage collection if needed
        batch = [];
        
        if (lineCount % (batchSize * 10) === 0) {
          global.gc && global.gc();
        }
      }
    }
    
    // Process remaining items
    if (batch.length > 0) {
      const finalResult = await processor.processBatch(batch);
      results.push(finalResult);
    }
    
    return results;
  }
}

class MemoryMonitor {
  constructor(thresholds) {
    this.thresholds = thresholds;
    this.isMonitoring = false;
    this.alertCallbacks = [];
  }

  start(intervalMs = 30000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.interval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isMonitoring = false;
  }

  checkMemoryUsage() {
    const usage = process.memoryUsage();
    
    if (usage.heapUsed > this.thresholds.critical) {
      this.alert('critical', usage);
    } else if (usage.heapUsed > this.thresholds.warning) {
      this.alert('warning', usage);
    }
  }

  alert(level, usage) {
    const alert = {
      level,
      usage,
      timestamp: new Date().toISOString()
    };
    
    console[level === 'critical' ? 'error' : 'warn']('Memory alert:', alert);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in memory alert callback:', error);
      }
    });
  }

  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }
}

class ObjectPool {
  constructor() {
    this.pools = {};
  }

  acquire(type) {
    if (!this.pools[type]) {
      this.pools[type] = [];
    }
    
    return this.pools[type].pop() || this.createObject(type);
  }

  release(type, obj) {
    if (!this.pools[type]) {
      this.pools[type] = [];
    }
    
    // Reset object state
    this.resetObject(type, obj);
    
    // Don't let pools grow too large
    if (this.pools[type].length < 10) {
      this.pools[type].push(obj);
    }
  }

  createObject(type) {
    switch (type) {
      case 'processor':
        return {
          processBatch: async (batch) => {
            // Processing logic here
            return batch.map(item => ({ processed: item }));
          },
          reset: function() {
            // Reset state
          }
        };
      default:
        return {};
    }
  }

  resetObject(type, obj) {
    if (obj.reset && typeof obj.reset === 'function') {
      obj.reset();
    }
  }
}
```

### 2. Concurrent Processing

```javascript
class ConcurrentProcessor {
  constructor(config) {
    this.config = config;
    this.maxConcurrency = config.max_concurrency || 4;
    this.semaphore = new Semaphore(this.maxConcurrency);
    this.taskQueue = [];
    this.activeRequests = new Map();
  }

  async processMany(items, processor) {
    const promises = items.map(item => 
      this.processWithConcurrencyLimit(item, processor)
    );
    
    return await Promise.allSettled(promises);
  }

  async processWithConcurrencyLimit(item, processor) {
    await this.semaphore.acquire();
    
    try {
      const taskId = this.generateTaskId();
      this.activeRequests.set(taskId, {
        started: Date.now(),
        item: item
      });
      
      const result = await processor(item);
      
      this.activeRequests.delete(taskId);
      return result;
      
    } finally {
      this.semaphore.release();
    }
  }

  // Batch processing with optimal concurrency
  async processBatches(items, batchSize, processor) {
    const batches = this.createBatches(items, batchSize);
    const results = [];
    
    for (const batch of batches) {
      const batchResults = await this.processMany(batch, processor);
      results.push(...batchResults);
      
      // Optional: delay between batches to prevent overwhelming downstream services
      if (this.config.batch_delay_ms) {
        await this.delay(this.config.batch_delay_ms);
      }
    }
    
    return results;
  }

  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  // Circuit breaker pattern for external service calls
  async processWithCircuitBreaker(operation, retryConfig = {}) {
    const {
      maxFailures = 5,
      resetTimeoutMs = 60000,
      fallbackFunction = null
    } = retryConfig;

    if (!this.circuitBreaker) {
      this.circuitBreaker = new CircuitBreaker(maxFailures, resetTimeoutMs);
    }

    if (this.circuitBreaker.isOpen()) {
      if (fallbackFunction) {
        return await fallbackFunction();
      }
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await operation();
      this.circuitBreaker.recordSuccess();
      return result;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      throw error;
    }
  }

  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus() {
    return {
      active_requests: this.activeRequests.size,
      available_slots: this.semaphore.available(),
      total_slots: this.maxConcurrency,
      queued_tasks: this.taskQueue.length
    };
  }
}

class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentConcurrency = 0;
    this.waitingQueue = [];
  }

  async acquire() {
    if (this.currentConcurrency < this.maxConcurrency) {
      this.currentConcurrency++;
      return;
    }

    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }

  release() {
    this.currentConcurrency--;
    
    if (this.waitingQueue.length > 0) {
      const resolve = this.waitingQueue.shift();
      this.currentConcurrency++;
      resolve();
    }
  }

  available() {
    return this.maxConcurrency - this.currentConcurrency;
  }
}

class CircuitBreaker {
  constructor(maxFailures, resetTimeoutMs) {
    this.maxFailures = maxFailures;
    this.resetTimeoutMs = resetTimeoutMs;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  isOpen() {
    if (this.state === 'OPEN') {
      // Check if we should try to recover
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.maxFailures) {
      this.state = 'OPEN';
    }
  }
}
```

## Security Considerations {#security}

Implement comprehensive security measures:

### 1. Input Validation and Sanitization

```javascript
const Joi = require('joi');
const DOMPurify = require('isomorphic-dompurify');
const validator = require('validator');

class SecurityManager {
  constructor(config) {
    this.config = config;
    this.setupValidationSchemas();
  }

  setupValidationSchemas() {
    this.schemas = {
      analyzeDocument: Joi.object({
        file_path: Joi.string().required().custom(this.validateFilePath),
        extract_images: Joi.boolean().default(false),
        language: Joi.string().valid('en', 'es', 'fr', 'de', 'it').default('en')
      }),
      
      classifyDocument: Joi.object({
        text_content: Joi.string().required().max(1000000), // 1MB text limit
        confidence_threshold: Joi.number().min(0).max(1).default(0.8)
      }),
      
      uploadToCloud: Joi.object({
        file_path: Joi.string().required().custom(this.validateFilePath),
        metadata: Joi.object().max(50), // Limit metadata object size
        folder: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).default('processed')
      })
    };
  }

  validateFilePath(value, helpers) {
    // Ensure file path is safe
    if (value.includes('..') || value.includes('~')) {
      return helpers.error('any.invalid');
    }
    
    // Check file extension
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.doc'];
    const extension = path.extname(value).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      return helpers.error('any.invalid');
    }
    
    // Ensure absolute path or within allowed directories
    const absolutePath = path.resolve(value);
    const allowedDirectories = this.config.allowed_directories || ['/tmp', '/uploads'];
    
    if (!allowedDirectories.some(dir => absolutePath.startsWith(path.resolve(dir)))) {
      return helpers.error('any.invalid');
    }
    
    return value;
  }

  async validateInput(capability, params) {
    const schema = this.schemas[capability];
    if (!schema) {
      throw new Error(`No validation schema found for capability: ${capability}`);
    }

    try {
      const { error, value } = schema.validate(params, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        throw new ValidationError('Input validation failed', error.details);
      }

      // Additional sanitization
      return this.sanitizeInput(value);
      
    } catch (error) {
      throw new ValidationError('Input validation error', error);
    }
  }

  sanitizeInput(input) {
    if (typeof input === 'string') {
      // HTML sanitization
      input = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
      
      // SQL injection prevention (basic)
      input = input.replace(/['";\\]/g, '');
      
      // Command injection prevention
      input = input.replace(/[;&|`$]/g, '');
    } else if (typeof input === 'object' && input !== null) {
      // Recursively sanitize object properties
      for (const [key, value] of Object.entries(input)) {
        input[key] = this.sanitizeInput(value);
      }
    }

    return input;
  }

  // Rate limiting per user/IP
  async checkRateLimit(identifier, capability) {
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const key = `${identifier}:${capability}`;
    const now = Date.now();
    const windowMs = this.config.rate_limit_window_ms || 60000; // 1 minute
    const maxRequests = this.getRateLimit(capability);

    let requests = this.rateLimitStore.get(key) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (requests.length >= maxRequests) {
      throw new RateLimitError(`Rate limit exceeded for ${capability}`);
    }

    requests.push(now);
    this.rateLimitStore.set(key, requests);
  }

  getRateLimit(capability) {
    const limits = {
      analyze_document: 10,
      classify_document: 50,
      upload_to_cloud: 5
    };
    
    return limits[capability] || 10;
  }

  // Secure file operations
  async validateFileAccess(filePath) {
    const fs = require('fs').promises;
    
    try {
      // Check if file exists and is readable
      await fs.access(filePath, fs.constants.R_OK);
      
      // Get file stats
      const stats = await fs.stat(filePath);
      
      // Security checks
      if (!stats.isFile()) {
        throw new SecurityError('Path is not a file');
      }
      
      // Check file size
      const maxSize = this.config.max_file_size_bytes || (50 * 1024 * 1024); // 50MB
      if (stats.size > maxSize) {
        throw new SecurityError('File too large');
      }
      
      // Check file permissions (Unix systems)
      if (process.platform !== 'win32') {
        const mode = stats.mode;
        // Ensure file is not world-writable
        if (mode & parseInt('002', 8)) {
          throw new SecurityError('File has unsafe permissions');
        }
      }
      
      return true;
      
    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      throw new SecurityError(`File access validation failed: ${error.message}`);
    }
  }

  // Sanitize file uploads
  async sanitizeUploadedFile(filePath) {
    const fs = require('fs').promises;
    const crypto = require('crypto');
    
    // Calculate file hash for integrity
    const fileBuffer = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Check against known malware signatures (simplified)
    const malwareSignatures = this.config.malware_signatures || [];
    if (malwareSignatures.includes(hash)) {
      throw new SecurityError('File matches known malware signature');
    }
    
    // Basic file content validation
    await this.validateFileContent(filePath, fileBuffer);
    
    return {
      hash,
      size: fileBuffer.length,
      safe: true
    };
  }

  async validateFileContent(filePath, buffer) {
    const extension = path.extname(filePath).toLowerCase();
    
    switch (extension) {
      case '.pdf':
        // Check PDF signature
        if (!buffer.subarray(0, 4).equals(Buffer.from('%PDF'))) {
          throw new SecurityError('Invalid PDF file signature');
        }
        break;
        
      case '.txt':
        // Check for binary content in text files
        if (buffer.includes(0)) {
          throw new SecurityError('Text file contains binary data');
        }
        break;
        
      // Add more file type validations as needed
    }
  }

  // Audit logging
  async logSecurityEvent(event, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      request_id: details.request_id || 'unknown',
      user_id: details.user_id || 'unknown',
      ip_address: details.ip_address || 'unknown',
      severity: this.getEventSeverity(event)
    };

    console.log('SECURITY_EVENT:', JSON.stringify(logEntry));
    
    // In production, send to security monitoring system
    if (this.config.security_webhook_url) {
      try {
        await this.sendToSecurityMonitoring(logEntry);
      } catch (error) {
        console.error('Failed to send security event to monitoring:', error);
      }
    }
  }

  getEventSeverity(event) {
    const severities = {
      'validation_failed': 'medium',
      'rate_limit_exceeded': 'medium',
      'file_access_denied': 'high',
      'malware_detected': 'critical',
      'authentication_failed': 'high'
    };
    
    return severities[event] || 'low';
  }

  async sendToSecurityMonitoring(logEntry) {
    const axios = require('axios');
    
    await axios.post(this.config.security_webhook_url, logEntry, {
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${this.config.security_webhook_token}`,
        'Content-Type': 'application/json'
      }
    });
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class SecurityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SecurityError';
  }
}

class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
  }
}
```

### 2. Encryption and Data Protection

```javascript
const crypto = require('crypto');
const bcrypt = require('bcrypt');

class EncryptionManager {
  constructor(config) {
    this.config = config;
    this.algorithm = 'aes-256-gcm';
    this.keyDerivationRounds = config.key_derivation_rounds || 100000;
  }

  // Encrypt sensitive data
  async encrypt(data, password) {
    const salt = crypto.randomBytes(32);
    const key = await this.deriveKey(password, salt);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(salt); // Additional authenticated data
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm
    };
  }

  // Decrypt sensitive data
  async decrypt(encryptedData, password) {
    const { encrypted, salt, iv, authTag, algorithm } = encryptedData;
    
    if (algorithm !== this.algorithm) {
      throw new Error('Unsupported encryption algorithm');
    }
    
    const key = await this.deriveKey(password, Buffer.from(salt, 'hex'));
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from(salt, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  async deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, this.keyDerivationRounds, 32, 'sha512', (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
  }

  // Hash passwords securely
  async hashPassword(password) {
    const saltRounds = this.config.bcrypt_rounds || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Generate secure random tokens
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Time-safe string comparison
  timeSafeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  // Secure configuration storage
  async storeSecureConfig(config, password) {
    const encrypted = await this.encrypt(config, password);
    
    // Store in secure location (platform-specific)
    const configPath = this.getSecureConfigPath();
    await fs.writeFile(configPath, JSON.stringify(encrypted), {
      mode: 0o600 // Owner read/write only
    });
    
    return configPath;
  }

  async loadSecureConfig(password) {
    const configPath = this.getSecureConfigPath();
    
    try {
      const encryptedData = JSON.parse(await fs.readFile(configPath, 'utf8'));
      return await this.decrypt(encryptedData, password);
    } catch (error) {
      throw new Error(`Failed to load secure config: ${error.message}`);
    }
  }

  getSecureConfigPath() {
    const os = require('os');
    const path = require('path');
    
    // Platform-specific secure storage
    switch (process.platform) {
      case 'darwin': // macOS
        return path.join(os.homedir(), 'Library', 'Application Support', 'OpenClaw', 'secure-config.json');
      case 'win32': // Windows
        return path.join(os.homedir(), 'AppData', 'Roaming', 'OpenClaw', 'secure-config.json');
      default: // Linux and others
        return path.join(os.homedir(), '.openclaw', 'secure-config.json');
    }
  }
}
```

## Publishing and Distribution {#publishing}

Package and distribute your skills:

### 1. Packaging Guidelines

```json
// package.json
{
  "name": "@your-org/openclaw-smart-document-processor",
  "version": "1.2.0",
  "description": "Advanced document processing skill for OpenClaw with cloud integration",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist/",
    "manifest.json",
    "README.md",
    "CHANGELOG.md",
    "config/"
  ],
  "scripts": {
    "build": "tsc && npm run copy-assets",
    "copy-assets": "cp manifest.json dist/ && cp -r config dist/",
    "test": "jest",
    "test:integration": "jest --config jest.integration.config.js",
    "lint": "eslint src/**/*.ts",
    "prepublishOnly": "npm run build && npm test",
    "postpack": "pinst --disable",
    "postinstall": "pinst --enable"
  },
  "keywords": [
    "openclaw",
    "skill",
    "document-processing",
    "pdf",
    "docx",
    "cloud-storage",
    "ai",
    "automation"
  ],
  "author": "Your Name <your.email@company.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/openclaw-smart-document-processor.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/openclaw-smart-document-processor/issues"
  },
  "homepage": "https://github.com/your-org/openclaw-smart-document-processor#readme",
  "peerDependencies": {
    "openclaw-sdk": "^2.0.0"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "aws-sdk": "^2.1490.0",
    "sharp": "^0.32.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "pinst": "^3.0.0"
  },
  "openclaw": {
    "skill": true,
    "category": "processing",
    "compatibility": ">=1.5.0",
    "manifest": "./manifest.json"
  }
}
```

### 2. Documentation Standards

```markdown
# OpenClaw Smart Document Processor

Advanced document processing skill for OpenClaw with cloud integration and AI-powered classification.

## Features

- 📄 **Multi-format Support**: PDF, DOCX, TXT document processing
- 🔍 **AI Classification**: Automatic document type detection
- ☁️ **Cloud Integration**: Seamless upload to AWS S3, Azure Blob, GCP Storage
- 🚀 **High Performance**: Concurrent processing and memory optimization
- 🔒 **Enterprise Security**: Encryption, validation, and audit logging
- 📊 **Analytics**: Detailed processing metrics and monitoring

## Installation

```bash
# Install via OpenClaw CLI
openclaw skills install @your-org/openclaw-smart-document-processor

# Or via npm
npm install @your-org/openclaw-smart-document-processor
```

## Quick Start

```javascript
// Basic usage
const result = await agent.use('smart-document-processor', 'analyze_document', {
  file_path: '/path/to/document.pdf',
  extract_images: true,
  language: 'en'
});

console.log('Analysis:', result.result.metadata);
```

## Configuration

Create a configuration file or set environment variables:

```json
{
  "cloud_provider": "aws",
  "aws_access_key": "your-access-key",
  "aws_secret_key": "your-secret-key", 
  "s3_bucket": "your-documents-bucket",
  "max_file_size": 50
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENCLAW_SDP_CLOUD_PROVIDER` | Cloud provider (aws/azure/gcp) | `aws` |
| `OPENCLAW_SDP_MAX_FILE_SIZE` | Max file size in MB | `50` |
| `OPENCLAW_SDP_AWS_ACCESS_KEY` | AWS access key | Required |
| `OPENCLAW_SDP_AWS_SECRET_KEY` | AWS secret key | Required |
| `OPENCLAW_SDP_S3_BUCKET` | S3 bucket name | Required |

## Capabilities

### `analyze_document`

Extract text and metadata from documents.

**Parameters:**
- `file_path` (string, required): Path to the document file
- `extract_images` (boolean, optional): Extract embedded images
- `language` (string, optional): Document language for processing

**Returns:**
```typescript
{
  success: boolean;
  result: {
    text_content: string;
    metadata: {
      pages?: number;
      word_count: number;
      character_count: number;
      keywords: string[];
      readability_score: number;
      estimated_reading_time: number;
    };
    images?: Array<{
      index: number;
      width: number;
      height: number;
      format: string;
    }>;
  };
}
```

### `classify_document`

Classify document type using AI.

**Parameters:**
- `text_content` (string, required): Text content to classify
- `confidence_threshold` (number, optional): Minimum confidence (0-1)

**Returns:**
```typescript
{
  success: boolean;
  classification: {
    type: 'contract' | 'invoice' | 'report' | 'technical' | 'correspondence' | 'unknown';
    confidence: number;
    matched_keywords: string[];
  };
}
```

### `upload_to_cloud`

Upload processed documents to cloud storage.

**Parameters:**
- `file_path` (string, required): Path to file to upload
- `metadata` (object, optional): Additional metadata to store
- `folder` (string, optional): Cloud storage folder

**Returns:**
```typescript
{
  success: boolean;
  upload_url: string;
  s3_key: string;
  bucket: string;
  file_size: number;
  uploaded_at: string;
}
```

## Advanced Usage

### Batch Processing

```javascript
const documents = ['/path/to/doc1.pdf', '/path/to/doc2.docx'];

const results = await Promise.all(
  documents.map(doc => 
    agent.use('smart-document-processor', 'analyze_document', {
      file_path: doc,
      extract_images: false
    })
  )
);
```

### Error Handling

```javascript
try {
  const result = await agent.use('smart-document-processor', 'analyze_document', {
    file_path: '/path/to/document.pdf'
  });
  
  if (!result.success) {
    console.error('Processing failed:', result.error);
  }
} catch (error) {
  console.error('Skill error:', error.message);
}
```

### Performance Monitoring

```javascript
// Enable detailed logging
process.env.OPENCLAW_SDP_DEBUG = 'true';

// Monitor processing metrics
const result = await agent.use('smart-document-processor', 'analyze_document', {
  file_path: '/path/to/large-document.pdf'
});

console.log('Processing time:', result.processing_time);
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/your-org/openclaw-smart-document-processor.git
cd openclaw-smart-document-processor
npm install
npm test
```

## License

MIT © [Your Organization](https://github.com/your-org)

## Support

- 📚 [Documentation](https://docs.openclaw.com/skills/smart-document-processor)
- 🐛 [Issue Tracker](https://github.com/your-org/openclaw-smart-document-processor/issues)
- 💬 [Discord Community](https://discord.gg/openclaw)
- 📧 [Email Support](mailto:support@yourcompany.com)
```

### 3. Publishing Checklist

```bash
#!/bin/bash
# publish-checklist.sh

echo "OpenClaw Skill Publishing Checklist"
echo "===================================="

# 1. Version check
echo "✓ Version check..."
npm version --no-git-tag-version patch
VERSION=$(node -p "require('./package.json').version")
echo "Publishing version: $VERSION"

# 2. Build
echo "✓ Building..."
npm run build

# 3. Tests
echo "✓ Running tests..."
npm test
npm run test:integration

# 4. Linting
echo "✓ Linting..."
npm run lint

# 5. Security audit
echo "✓ Security audit..."
npm audit --audit-level high

# 6. Manifest validation
echo "✓ Validating manifest..."
openclaw skills validate ./manifest.json

# 7. Documentation check
echo "✓ Checking documentation..."
if [ ! -f "README.md" ]; then
  echo "❌ README.md is required"
  exit 1
fi

if [ ! -f "CHANGELOG.md" ]; then
  echo "❌ CHANGELOG.md is required"
  exit 1
fi

# 8. Package contents
echo "✓ Checking package contents..."
npm pack --dry-run

# 9. Local testing
echo "✓ Local testing..."
openclaw skills install ./

# 10. Publish
echo "✓ Publishing..."
read -p "Ready to publish? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm publish --access public
  
  # Tag git release
  git tag "v$VERSION"
  git push origin "v$VERSION"
  
  echo "✅ Published successfully!"
  echo "📦 Package: https://npmjs.com/package/@your-org/openclaw-smart-document-processor"
  echo "🏷️  Version: $VERSION"
else
  echo "❌ Publish cancelled"
fi
```

## Conclusion

Building advanced OpenClaw skills requires understanding the full ecosystem - from architecture patterns to security considerations. This comprehensive guide has covered:

- **Skill Architecture**: Understanding the plugin system and component relationships
- **Development Patterns**: Building maintainable, scalable, and reliable skills
- **API Integrations**: Best practices for external service connections
- **Channel Plugins**: Extending OpenClaw to new communication platforms
- **Testing & Debugging**: Comprehensive quality assurance approaches
- **Performance Optimization**: Scaling skills for production workloads
- **Security**: Protecting integrations and user data
- **Distribution**: Publishing and maintaining skills

### Next Steps

1. **Start Small**: Begin with a simple skill using the patterns shown
2. **Iterate**: Add features incrementally with proper testing
3. **Share**: Publish your skills to help the OpenClaw community grow
4. **Contribute**: Submit improvements and new patterns back to the ecosystem

### Resources

- **OpenClaw SDK**: Complete development toolkit
- **Skill Registry**: Browse existing skills for inspiration
- **Community Forums**: Get help from other developers
- **Best Practices Guide**: Stay updated with evolving patterns

The future of AI automation lies in building modular, reusable capabilities that agents can compose into complex workflows. Master these patterns, and you'll be creating the building blocks of tomorrow's AI systems.

---

*Ready to build enterprise-grade OpenClaw skills? Join the [developer community](https://discord.gg/openclaw) and showcase your creations.*