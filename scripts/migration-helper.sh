#!/bin/bash
# Talon Single Repository Migration Helper Script
# 
# This script assists with the migration from KaiOpenClaw/talon-private 
# to TerminalGravity/talon public repository
#
# Usage: ./scripts/migration-helper.sh [phase]
# Phases: audit, prepare, migrate, validate

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CURRENT_REPO="KaiOpenClaw/talon-private"
TARGET_ORG="TerminalGravity"
TARGET_REPO="TerminalGravity/talon"
MIGRATION_BRANCH="migration-prep"

# Helper functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
        error "This script must be run from the talon project root directory"
    fi
    
    # Check GitHub CLI
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI (gh) is required but not installed"
    fi
    
    # Check authentication
    if ! gh auth status &> /dev/null; then
        error "GitHub CLI is not authenticated. Run 'gh auth login'"
    fi
    
    # Check git status
    if [[ -n $(git status --porcelain) ]]; then
        warn "Working directory is not clean. Consider committing changes first."
    fi
    
    log "Prerequisites check completed ✅"
}

# Phase 1: Security audit
security_audit() {
    log "Starting security audit..."
    
    # Check for hardcoded secrets
    info "Scanning for hardcoded credentials..."
    
    # Common secret patterns
    SECRET_PATTERNS=(
        "ghp_[a-zA-Z0-9]{36}"           # GitHub tokens
        "sk-[a-zA-Z0-9]{48}"           # OpenAI API keys
        "['\"]password['\"]:\s*['\"]"   # Password fields
        "MTQ3ODgwNTQyNDMwMjQ1Njk0Mw"   # Known Discord token
        "Bearer\s+[a-zA-Z0-9+/]+"      # Bearer tokens
    )
    
    FOUND_SECRETS=0
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -r -E "$pattern" --include="*.ts" --include="*.js" --include="*.jsx" --include="*.tsx" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.env*" . 2>/dev/null; then
            warn "Found potential secret pattern: $pattern"
            FOUND_SECRETS=$((FOUND_SECRETS + 1))
        fi
    done
    
    if [[ $FOUND_SECRETS -eq 0 ]]; then
        log "No hardcoded secrets found ✅"
    else
        warn "Found $FOUND_SECRETS potential secrets. Please review before migration."
    fi
    
    # Check .gitignore coverage
    info "Validating .gitignore coverage..."
    SENSITIVE_PATTERNS=(
        ".env"
        ".env.local"
        ".env.production"
        "*.key"
        "*.secret"
        ".lancedb/"
    )
    
    for pattern in "${SENSITIVE_PATTERNS[@]}"; do
        if ! grep -q "^$pattern" .gitignore; then
            warn ".gitignore missing pattern: $pattern"
        fi
    done
    
    log "Security audit completed"
}

# Phase 2: Prepare migration content
prepare_migration() {
    log "Preparing migration content..."
    
    # Create migration branch
    info "Creating migration preparation branch..."
    git checkout -b "$MIGRATION_BRANCH" || git checkout "$MIGRATION_BRANCH"
    
    # Update documentation links
    info "Updating GitHub organization references..."
    
    # Files to update
    FILES_TO_UPDATE=(
        "README.md"
        "CONTRIBUTING.md"
        "CHANGELOG.md"
        "package.json"
        "docs/API.md"
    )
    
    for file in "${FILES_TO_UPDATE[@]}"; do
        if [[ -f "$file" ]]; then
            info "Updating $file..."
            sed -i.bak "s|KaiOpenClaw/talon-private|$TARGET_REPO|g" "$file"
            sed -i.bak "s|github.com/KaiOpenClaw|github.com/$TARGET_ORG|g" "$file"
            rm -f "$file.bak"
        fi
    done
    
    # Update package.json repository field
    if [[ -f "package.json" ]]; then
        info "Updating package.json repository field..."
        sed -i.bak "s|\"repository\":.*|\"repository\": \"https://github.com/$TARGET_REPO.git\",|" package.json
        sed -i.bak "s|\"homepage\":.*|\"homepage\": \"https://github.com/$TARGET_REPO#readme\",|" package.json
        rm -f package.json.bak
    fi
    
    # Create organization-specific documentation
    info "Creating TerminalGravity-specific documentation..."
    
    cat > "ORGANIZATION.md" << EOF
# TerminalGravity Organization

Welcome to the official TerminalGravity organization on GitHub!

## About

TerminalGravity develops cutting-edge terminal and AI-powered development tools, with a focus on:

- **OpenClaw Integration**: Seamless AI agent management
- **Developer Experience**: Tools that enhance productivity
- **Open Source**: Community-driven development

## Repositories

- **talon**: OpenClaw dashboard and command center
- More repositories coming soon...

## Community

- **Discord**: Join our development discussions
- **Issues**: Report bugs and request features
- **Contributing**: See CONTRIBUTING.md for guidelines

## Contact

- Website: [Coming Soon]
- Discord: #development channel
- Email: [Coming Soon]

---

Built with ❤️ by the TerminalGravity team.
EOF
    
    # Create migration checklist
    info "Creating migration validation checklist..."
    
    cat > "MIGRATION_CHECKLIST.md" << EOF
# Migration Validation Checklist

Use this checklist to verify the migration was successful.

## Pre-Migration ✅
- [ ] Security audit completed
- [ ] All sensitive files properly ignored
- [ ] Documentation updated with new organization links
- [ ] Build passing locally
- [ ] All tests passing

## Migration Process
- [ ] TerminalGravity organization created
- [ ] Repository TerminalGravity/talon created
- [ ] All branches pushed to new repository
- [ ] All tags transferred
- [ ] Issue templates configured
- [ ] Branch protection rules set up

## Post-Migration Validation
- [ ] Build successful in new repository
- [ ] All GitHub links working
- [ ] Render deployment updated and working
- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] Community documentation complete

## Community Communication
- [ ] Discord announcement posted
- [ ] Old repository archived with redirect
- [ ] Contributors notified
- [ ] Documentation links verified

## Rollback Plan (if needed)
- [ ] Restore KaiOpenClaw/talon-private as primary
- [ ] Revert Render deployment configuration
- [ ] Notify community of rollback
- [ ] Address migration blockers

---

**Migration Date**: $(date +'%Y-%m-%d')
**Migration Lead**: @talon
**GitHub Issue**: #93
EOF
    
    log "Migration preparation completed"
}

# Phase 3: Execute migration (requires manual steps)
execute_migration() {
    log "Starting migration execution..."
    
    info "This phase requires manual intervention for organization creation."
    echo ""
    echo "Manual steps required:"
    echo "1. Create TerminalGravity organization on GitHub (requires admin access)"
    echo "2. Create public repository: TerminalGravity/talon"
    echo "3. Run the following commands to push content:"
    echo ""
    echo "   git remote add terminalgravity https://github.com/TerminalGravity/talon.git"
    echo "   git push terminalgravity main"
    echo "   git push terminalgravity --all"
    echo "   git push terminalgravity --tags"
    echo ""
    
    read -p "Have you completed the manual organization setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warn "Skipping migration execution. Complete manual steps first."
        return 0
    fi
    
    # Add new remote if not exists
    if ! git remote | grep -q "terminalgravity"; then
        info "Adding TerminalGravity remote..."
        git remote add terminalgravity "https://github.com/$TARGET_REPO.git"
    fi
    
    # Push content
    info "Pushing all branches to new repository..."
    git push terminalgravity main || error "Failed to push main branch"
    git push terminalgravity --all || warn "Some branches failed to push"
    git push terminalgravity --tags || warn "Some tags failed to push"
    
    log "Content migration completed"
}

# Phase 4: Validate migration
validate_migration() {
    log "Starting migration validation..."
    
    # Check if target repository exists and is accessible
    info "Validating target repository..."
    if ! gh repo view "$TARGET_REPO" &> /dev/null; then
        error "Target repository $TARGET_REPO is not accessible"
    fi
    
    # Check if main branch exists
    info "Checking main branch..."
    if ! git ls-remote terminalgravity main &> /dev/null; then
        error "Main branch not found in target repository"
    fi
    
    # Validate build on new repository (if possible)
    info "Build validation should be done manually in the new repository"
    
    # Check documentation links
    info "Validating documentation links..."
    if command -v linkchecker &> /dev/null; then
        linkchecker README.md || warn "Some documentation links may be broken"
    else
        warn "linkchecker not available, skipping link validation"
    fi
    
    log "Migration validation completed"
}

# Main execution
main() {
    local phase="${1:-help}"
    
    case $phase in
        "audit")
            check_prerequisites
            security_audit
            ;;
        "prepare")
            check_prerequisites
            prepare_migration
            ;;
        "migrate")
            check_prerequisites
            execute_migration
            ;;
        "validate")
            check_prerequisites
            validate_migration
            ;;
        "all")
            check_prerequisites
            security_audit
            prepare_migration
            info "Manual organization setup required before proceeding"
            info "Run './scripts/migration-helper.sh migrate' after org setup"
            ;;
        *)
            echo "Talon Migration Helper Script"
            echo ""
            echo "Usage: $0 <phase>"
            echo ""
            echo "Phases:"
            echo "  audit    - Run security audit and prerequisites check"
            echo "  prepare  - Prepare migration content (update docs, create branch)"
            echo "  migrate  - Execute migration (requires manual org setup)"
            echo "  validate - Validate migration success"
            echo "  all      - Run audit and prepare phases"
            echo ""
            echo "GitHub Issue: https://github.com/KaiOpenClaw/talon-private/issues/93"
            ;;
    esac
}

main "$@"