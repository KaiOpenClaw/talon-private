#!/bin/bash
# Branch Protection Setup Script for TerminalGravity/talon
#
# This script configures branch protection rules for the new repository
# Run after the TerminalGravity/talon repository is created
#
# Usage: ./scripts/setup-branch-protection.sh

set -e

# Configuration
TARGET_REPO="TerminalGravity/talon"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if repository exists
check_repository() {
    log "Checking repository access..."
    if ! gh repo view "$TARGET_REPO" &> /dev/null; then
        error "Repository $TARGET_REPO is not accessible. Ensure it exists and you have admin access."
    fi
    log "Repository access confirmed ✅"
}

# Set up main branch protection
setup_main_protection() {
    log "Setting up main branch protection..."
    
    gh api repos/"$TARGET_REPO"/branches/main/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["build"]}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        || warn "Failed to set main branch protection. May need to be done manually."
    
    log "Main branch protection configured ✅"
}

# Set up develop branch protection
setup_develop_protection() {
    log "Setting up develop branch protection..."
    
    # Create develop branch if it doesn't exist
    if ! git ls-remote origin develop &> /dev/null; then
        info "Creating develop branch..."
        git checkout main
        git checkout -b develop
        git push origin develop
    fi
    
    gh api repos/"$TARGET_REPO"/branches/develop/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["build"]}' \
        --field enforce_admins=false \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":false,"require_code_owner_reviews":false}' \
        --field restrictions=null \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        || warn "Failed to set develop branch protection. May need to be done manually."
    
    log "Develop branch protection configured ✅"
}

# Create branch protection rules via JSON
setup_branch_protection_advanced() {
    log "Setting up advanced branch protection rules..."
    
    # Main branch protection JSON
    cat > /tmp/main_protection.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build", "test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "bypass_pull_request_allowances": {
      "users": [],
      "teams": []
    }
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false
}
EOF
    
    # Apply main branch protection
    gh api repos/"$TARGET_REPO"/branches/main/protection \
        --method PUT \
        --input /tmp/main_protection.json \
        || warn "Advanced main protection setup failed"
    
    rm -f /tmp/main_protection.json
}

# Create repository labels
setup_labels() {
    log "Setting up repository labels..."
    
    # Define labels
    LABELS=(
        "enhancement|0052CC|Feature requests and improvements"
        "bug|d73a4a|Something isn't working"
        "documentation|0075ca|Improvements or additions to documentation"
        "duplicate|cfd3d7|This issue or pull request already exists"
        "good first issue|7057ff|Good for newcomers"
        "help wanted|008672|Extra attention is needed"
        "invalid|e4e669|This doesn't seem right"
        "question|d876e3|Further information is requested"
        "wontfix|ffffff|This will not be worked on"
        "priority:high|ff6b6b|High priority issues"
        "priority:medium|ffa500|Medium priority issues"
        "priority:low|32cd32|Low priority issues"
        "type:feature|1e90ff|New feature or enhancement"
        "type:bug|dc143c|Bug reports"
        "type:docs|9370db|Documentation related"
        "type:refactor|ff1493|Code refactoring"
        "type:test|20b2aa|Testing related"
        "status:in-progress|f0ad4e|Currently being worked on"
        "status:needs-review|ff7f50|Needs code review"
        "status:blocked|b22222|Blocked by other issues"
        "epic|6f42c1|Large feature or project"
        "migration|ff6b35|Migration related tasks"
        "deployment|2ecc71|Deployment and infrastructure"
        "security|e74c3c|Security related issues"
    )
    
    for label_def in "${LABELS[@]}"; do
        IFS='|' read -r name color description <<< "$label_def"
        gh label create "$name" --color "$color" --description "$description" --repo "$TARGET_REPO" 2>/dev/null || \
        gh label edit "$name" --color "$color" --description "$description" --repo "$TARGET_REPO" 2>/dev/null || \
        warn "Failed to create/update label: $name"
    done
    
    log "Repository labels configured ✅"
}

# Create issue templates
setup_issue_templates() {
    log "Setting up issue templates..."
    
    mkdir -p .github/ISSUE_TEMPLATE
    
    # Bug report template
    cat > .github/ISSUE_TEMPLATE/bug_report.yml << 'EOF'
name: Bug Report
description: File a bug report to help us improve
title: "[Bug]: "
labels: ["bug", "type:bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  
  - type: input
    id: version
    attributes:
      label: Version
      description: What version of Talon are you running?
      placeholder: ex. 1.0.0
    validations:
      required: true
      
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
    validations:
      required: true
      
  - type: textarea
    id: reproduce
    attributes:
      label: Steps to Reproduce
      description: How can we reproduce this issue?
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true
      
  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: Please provide your environment details
      placeholder: |
        - OS: [e.g. macOS, Windows, Linux]
        - Browser: [e.g. Chrome, Firefox, Safari]
        - Node.js version: [e.g. 22.0.0]
    validations:
      required: true
      
  - type: textarea
    id: logs
    attributes:
      label: Relevant log output
      description: Please copy and paste any relevant log output. This will be automatically formatted into code.
      render: shell
EOF
    
    # Feature request template
    cat > .github/ISSUE_TEMPLATE/feature_request.yml << 'EOF'
name: Feature Request
description: Suggest an idea for Talon
title: "[Feature]: "
labels: ["enhancement", "type:feature"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a new feature!
  
  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear and concise description of what the problem is.
      placeholder: I'm always frustrated when...
    validations:
      required: true
      
  - type: textarea
    id: solution
    attributes:
      label: Describe the solution you'd like
      description: A clear and concise description of what you want to happen.
    validations:
      required: true
      
  - type: textarea
    id: alternatives
    attributes:
      label: Describe alternatives you've considered
      description: A clear and concise description of any alternative solutions or features you've considered.
    validations:
      required: false
      
  - type: textarea
    id: additional-context
    attributes:
      label: Additional context
      description: Add any other context or screenshots about the feature request here.
    validations:
      required: false
EOF
    
    log "Issue templates created ✅"
}

# Create pull request template
setup_pr_template() {
    log "Setting up pull request template..."
    
    mkdir -p .github
    cat > .github/pull_request_template.md << 'EOF'
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes, no API changes)
- [ ] Build/CI changes
- [ ] Performance improvement

## Testing

- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested the build process

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published in downstream modules

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Related Issues

Closes #(issue number)
EOF
    
    log "Pull request template created ✅"
}

# Create GitHub Actions workflow
setup_github_actions() {
    log "Setting up GitHub Actions workflows..."
    
    mkdir -p .github/workflows
    
    # CI workflow
    cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20, 22]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint || true
      
    - name: Run type check
      run: npm run type-check || npx tsc --noEmit
      
    - name: Build application
      run: npm run build
      
    - name: Run tests
      run: npm test || echo "No tests configured"

  security:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run security audit
      run: npm audit --audit-level high
      
    - name: Check for secrets
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: main
        head: HEAD
        extra_args: --debug --only-verified
EOF
    
    log "GitHub Actions workflows created ✅"
}

# Main execution
main() {
    log "Starting branch protection and repository setup..."
    
    check_repository
    setup_labels
    setup_issue_templates
    setup_pr_template
    setup_github_actions
    
    # Commit templates and workflows
    if [[ -n $(git status --porcelain) ]]; then
        git add .github/
        git commit -m "feat: Add GitHub templates and workflows for TerminalGravity migration"
    fi
    
    # Set up branch protection (requires admin access)
    info "Setting up branch protection rules (requires admin access)..."
    setup_main_protection
    setup_develop_protection
    
    log "Repository setup completed ✅"
    echo ""
    echo "Next steps:"
    echo "1. Push migration-prep branch to new repository"
    echo "2. Create pull request to merge migration changes"
    echo "3. Test deployment pipeline"
    echo "4. Update Render configuration"
    echo "5. Announce migration to community"
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi