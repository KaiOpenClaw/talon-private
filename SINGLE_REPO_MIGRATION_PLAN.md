# Talon Single Repository Architecture Migration Plan

*Date: February 18th, 2026*  
*Status: PLANNING PHASE*

## Executive Summary

Migrate Talon from a dual-repo architecture (`KaiOpenClaw/talon-private` + `TerminalGravity/talon-private`) to a single transparent public repository under the TerminalGravity organization. This will streamline development, enhance community engagement, and improve the open-source experience.

## Current Architecture Analysis

### Repository Status
- **Current Repo**: `KaiOpenClaw/talon-private` (public)
- **Target Org**: `TerminalGravity` (doesn't exist yet)
- **Repository State**: ✅ Clean working tree, up to date with origin/main
- **Sensitive Files**: ✅ Properly ignored via .gitignore
- **Security Status**: ✅ No hardcoded secrets found in source code

### Current Structure
```
/root/clawd/talon-private/
├── src/                    # Next.js application code
├── public/                 # Static assets
├── scripts/               # Build and utility scripts
├── docs/                  # Documentation
├── content/               # Marketing content
├── .github/               # GitHub workflows (if any)
├── .env.example           # Environment template
├── .env.production.template
├── .gitignore             # ✅ Properly configured
├── package.json           # Dependencies and scripts
├── render.yaml            # Deployment configuration
├── README.md              # Documentation
├── CHANGELOG.md           # Version history
└── CONTRIBUTING.md        # Development guide
```

### Build & Deployment Status
- **Build Health**: ✅ 37 pages + 24 API routes compile successfully
- **Bundle Size**: ✅ 112kB first load (optimal)
- **Dependencies**: 273 packages (0 security vulnerabilities)
- **TypeScript**: ✅ No compilation errors
- **Deployment**: Render-ready via render.yaml

## Migration Strategy

### Phase 1: Organization Setup & Repository Creation
**Timeline**: Day 1
**Owner**: @higgy (GitHub admin access required)

#### 1.1 Create TerminalGravity Organization
- [ ] Create GitHub organization: `https://github.com/TerminalGravity`
- [ ] Set up organization profile and branding
- [ ] Configure organization settings and permissions
- [ ] Add team members with appropriate roles

#### 1.2 Create Public Repository
- [ ] Create `TerminalGravity/talon` (note: dropping "-private" suffix)
- [ ] Initialize with MIT license
- [ ] Set up repository settings and features
- [ ] Configure branch protection rules (see Phase 3)

### Phase 2: Content Migration & Sanitization
**Timeline**: Day 1-2
**Owner**: @talon

#### 2.1 Content Preparation
- [ ] **Security Audit**: Final scan for any hardcoded credentials
- [ ] **Documentation Update**: Update all GitHub links and organization references
- [ ] **README Enhancement**: Update repo paths, organization branding
- [ ] **CHANGELOG Update**: Document the migration process
- [ ] **Environment Templates**: Ensure .env.example is comprehensive

#### 2.2 Content Transfer
```bash
# Add new remote
git remote add terminalgravity https://github.com/TerminalGravity/talon.git

# Push all branches and tags
git push terminalgravity main
git push terminalgravity --all
git push terminalgravity --tags
```

#### 2.3 Migration Validation
- [ ] **Build Test**: Verify builds work in new repository
- [ ] **Deployment Test**: Test Render deployment from new repo
- [ ] **Documentation Links**: Verify all internal links work correctly
- [ ] **Issue Migration**: Transfer or recreate critical open issues

### Phase 3: Branch Strategy & Protection Rules
**Timeline**: Day 2
**Owner**: @higgy + @talon

#### 3.1 Branch Structure
```
main/                      # Production-ready code
├── develop/               # Integration branch for features  
├── feature/*             # Feature development branches
├── hotfix/*              # Critical bug fixes
├── release/*             # Release preparation branches
└── docs/*                # Documentation updates
```

#### 3.2 Branch Protection Rules

**main branch**:
- [ ] Require pull request reviews (1 reviewer minimum)
- [ ] Require status checks to pass
- [ ] Require branches to be up to date before merging
- [ ] Restrict pushes to main (require PRs)
- [ ] Include administrators in restrictions
- [ ] Allow force pushes: ❌
- [ ] Allow deletions: ❌

**develop branch**:
- [ ] Require pull request reviews (1 reviewer minimum)
- [ ] Require status checks to pass
- [ ] Allow administrators to bypass: ✅
- [ ] Auto-merge when requirements met: ✅

#### 3.3 GitHub Actions Workflows
- [ ] **CI Pipeline**: Build and test on PR
- [ ] **Security Scanning**: CodeQL analysis
- [ ] **Dependency Updates**: Dependabot configuration
- [ ] **Deployment**: Auto-deploy main to Render

### Phase 4: Deployment Pipeline Migration
**Timeline**: Day 2-3
**Owner**: @talon

#### 4.1 Render Configuration Update
- [ ] **Repository Connection**: Connect Render to `TerminalGravity/talon`
- [ ] **Environment Variables**: Transfer all production secrets
- [ ] **Build Settings**: Verify build commands and root directory
- [ ] **Deploy Settings**: Configure auto-deploy from main branch

#### 4.2 Environment Variables Checklist
```bash
GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050
GATEWAY_TOKEN=<secure-token>
TALON_API_URL=<production-api-url>
TALON_API_TOKEN=<secure-token>
OPENAI_API_KEY=<openai-key>
TALON_AUTH_TOKEN=<auth-secret>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=<production-url>
```

#### 4.3 Deployment Testing
- [ ] **Build Verification**: Successful build on Render
- [ ] **Health Check**: All API endpoints respond correctly
- [ ] **Integration Test**: Gateway and OpenClaw connectivity
- [ ] **Performance Test**: Load times and bundle size optimization

### Phase 5: Community & Development Workflow
**Timeline**: Day 3-4
**Owner**: @talon

#### 5.1 Issue Templates & Automation
- [ ] **Bug Report Template**: Structured issue reporting
- [ ] **Feature Request Template**: Community enhancement requests
- [ ] **PR Template**: Consistent pull request format
- [ ] **Labels System**: Organize issues by type/priority
- [ ] **Project Boards**: Track development milestones

#### 5.2 Community Documentation
- [ ] **CONTRIBUTING.md**: Development setup and guidelines
- [ ] **CODE_OF_CONDUCT.md**: Community standards
- [ ] **SECURITY.md**: Security disclosure policy
- [ ] **DEVELOPMENT.md**: Architecture and technical details

#### 5.3 Migration Communication
- [ ] **Migration Notice**: Post in all relevant Discord channels
- [ ] **Documentation Update**: Update all references to new repo
- [ ] **Community Announcement**: Inform contributors of new workflow

### Phase 6: Validation & Go-Live
**Timeline**: Day 4-5
**Owner**: @talon

#### 6.1 End-to-End Testing
- [ ] **Development Workflow**: Test feature branch → PR → merge flow
- [ ] **Deployment Pipeline**: Verify auto-deploy works correctly
- [ ] **Community Features**: Test issue creation, PR submission
- [ ] **Documentation**: Verify all links and guides work

#### 6.2 Old Repository Management
- [ ] **Archive Notice**: Add deprecation notice to `KaiOpenClaw/talon-private`
- [ ] **Redirect Setup**: Archive old repo with link to new location
- [ ] **Issue Migration**: Close duplicate issues, redirect to new repo
- [ ] **Community Notification**: Final announcement of migration completion

## Technical Implementation Details

### Git Migration Commands
```bash
# Step 1: Clone current repository
git clone https://github.com/KaiOpenClaw/talon-private.git talon-migration
cd talon-migration

# Step 2: Add new remote (after TerminalGravity/talon is created)
git remote add new-origin https://github.com/TerminalGravity/talon.git

# Step 3: Push all content
git push new-origin main
git push new-origin --all
git push new-origin --tags

# Step 4: Verify migration
git ls-remote new-origin
```

### Render Deployment Update
```bash
# Update render.yaml if needed
name: talon
type: web
env: node
buildCommand: npm run build
startCommand: npm start
branch: main
repo: https://github.com/TerminalGravity/talon
```

### GitHub Actions Template (Optional)
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

## Risk Assessment & Mitigation

### High Risk Items
1. **Deployment Downtime**: 
   - **Mitigation**: Keep old deployment running until new one is verified
   - **Rollback**: Quick revert to KaiOpenClaw repo if issues arise

2. **Broken Links/References**: 
   - **Mitigation**: Comprehensive find/replace of all GitHub references
   - **Testing**: Automated link checking in CI pipeline

3. **Community Confusion**: 
   - **Mitigation**: Clear communication plan across Discord channels
   - **Documentation**: Migration guide for contributors

### Medium Risk Items
1. **GitHub Actions/Automation**: 
   - **Mitigation**: Test all workflows in new repo before go-live
   - **Fallback**: Manual deployment available if automation fails

2. **Third-party Integrations**: 
   - **Mitigation**: Update all webhook URLs and service connections
   - **Testing**: Verify integrations post-migration

## Success Metrics

### Technical Metrics
- [ ] ✅ Build success rate: 100%
- [ ] ✅ Deployment pipeline: Fully automated
- [ ] ✅ Performance maintained: <3s page loads
- [ ] ✅ Security status: 0 vulnerabilities

### Community Metrics
- [ ] 🎯 Issue migration: >90% preserved
- [ ] 🎯 Documentation completeness: 100% working links
- [ ] 🎯 Contributor workflow: <5min setup time
- [ ] 🎯 Community engagement: Positive feedback

## Timeline Summary

| Day | Phase | Key Activities | Owner |
|-----|-------|----------------|-------|
| 1 | Setup | Organization creation, repo setup | @higgy |
| 1-2 | Migration | Content transfer, sanitization | @talon |
| 2 | Governance | Branch protection, workflows | @higgy + @talon |
| 2-3 | Deployment | Pipeline migration, testing | @talon |
| 3-4 | Community | Documentation, templates | @talon |
| 4-5 | Validation | End-to-end testing, go-live | @talon |

**Total Duration**: 5 days
**Critical Path**: Organization setup → Content migration → Deployment testing

## Next Steps

1. **Immediate**: Create GitHub issue for tracking this migration
2. **Day 1**: @higgy to create TerminalGravity organization and repository
3. **Day 1**: @talon to begin content preparation and security audit
4. **Ongoing**: Regular progress updates in Discord #development channel

---

*This document serves as the single source of truth for the Talon single-repo migration project.*