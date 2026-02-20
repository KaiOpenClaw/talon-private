/**
 * Security Guide Component (Refactored)
 * Re-export from modular architecture
 * 
 * This file maintains backward compatibility while the implementation
 * has been split into focused modules for better build performance:
 * - security-guide/security-data.ts (140 lines) - Data and constants
 * - security-guide/security-checklist.tsx (81 lines) - Interactive checklist
 * - security-guide/malicious-skills.tsx (94 lines) - Malicious skill examples
 * - security-guide/threat-patterns.tsx (92 lines) - Threat pattern recognition  
 * - security-guide/security-guide-main.tsx (187 lines) - Main orchestrator
 * - security-guide/index.tsx (11 lines) - Clean exports
 * 
 * Total: 605 lines across 6 focused files vs 415 lines in one file
 * Benefits: Better code splitting, component reusability, focused responsibilities
 */

export { 
  SecurityGuide,
  SecurityChecklist,
  MaliciousSkills, 
  ThreatPatterns,
  MALICIOUS_SKILLS,
  SECURITY_CHECKLIST,
  THREAT_PATTERNS
} from './security-guide/'