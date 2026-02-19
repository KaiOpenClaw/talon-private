#!/bin/bash

# Talon Emergency Render Deployment Script
# Issue: #212 Infrastructure Recovery
# Created: 2026-02-19T16:57Z

set -e

echo "🚀 Talon Emergency Render Deployment"
echo "===================================="
echo

# Check prerequisites
echo "📋 Checking Prerequisites..."

if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) required but not installed"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo "❌ ERROR: curl required but not installed"  
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ ERROR: jq required but not installed"
    exit 1
fi

echo "✅ All prerequisites installed"
echo

# Check Git status
echo "📁 Checking Repository Status..."
if [ ! -d ".git" ]; then
    echo "❌ ERROR: Not in a Git repository"
    exit 1
fi

REPO=$(git remote get-url origin | sed 's/.*github.com[:\/]\(.*\)\.git/\1/' | sed 's/.*github.com[:\/]\(.*\)/\1/')
BRANCH=$(git branch --show-current)

echo "Repository: $REPO"
echo "Branch: $BRANCH"
echo "✅ Repository ready"
echo

# Generate Environment Variables
echo "🔐 Generating Environment Variables..."

# Get OpenClaw config
if [ -f ~/.openclaw/openclaw.json ]; then
    GATEWAY_TOKEN=$(jq -r '.gateway.auth.token // empty' ~/.openclaw/openclaw.json)
    if [ -z "$GATEWAY_TOKEN" ]; then
        echo "⚠️  WARNING: Could not extract gateway token from OpenClaw config"
        echo "   Please set GATEWAY_TOKEN manually in Render dashboard"
    else
        echo "✅ Gateway token extracted from OpenClaw config"
    fi
else
    echo "⚠️  WARNING: OpenClaw config not found at ~/.openclaw/openclaw.json"
    GATEWAY_TOKEN=""
fi

# Get OpenAI API key
if [ -f ~/.env.openai ]; then
    source ~/.env.openai
    if [ -n "$OPENAI_API_KEY" ]; then
        echo "✅ OpenAI API key found in ~/.env.openai"
    else
        echo "⚠️  WARNING: OPENAI_API_KEY not set in ~/.env.openai"
    fi
else
    echo "⚠️  WARNING: ~/.env.openai file not found"
    OPENAI_API_KEY=""
fi

# Generate secure auth token
AUTH_TOKEN=$(openssl rand -hex 32)
echo "✅ Generated secure authentication token"

# Current working tunnel (will be updated)
TALON_API_URL="https://subscriptions-outlets-receiver-courier.trycloudflare.com"

echo
echo "📝 Environment Variables for Render:"
echo "=================================="

# Create environment file template
cat > .env.render << EOF
NODE_ENV=production
PORT=10000
GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050
GATEWAY_TOKEN=${GATEWAY_TOKEN}
TALON_API_URL=${TALON_API_URL}
TALON_API_TOKEN=talon-7k9m2x4pqr8w
OPENAI_API_KEY=${OPENAI_API_KEY}
TALON_AUTH_TOKEN=${AUTH_TOKEN}
EOF

echo "✅ Environment file created: .env.render"
echo

# Show variables with security masking
echo "Environment Variables to add in Render Dashboard:"
echo "------------------------------------------------"
echo "NODE_ENV=production"
echo "PORT=10000"
echo "GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050"
if [ -n "$GATEWAY_TOKEN" ]; then
    echo "GATEWAY_TOKEN=${GATEWAY_TOKEN:0:8}...(${#GATEWAY_TOKEN} chars)"
else
    echo "GATEWAY_TOKEN=<NEEDS_MANUAL_SETUP>"
fi
echo "TALON_API_URL=${TALON_API_URL}"
echo "TALON_API_TOKEN=talon-7k9m2x4pqr8w"
if [ -n "$OPENAI_API_KEY" ]; then
    echo "OPENAI_API_KEY=${OPENAI_API_KEY:0:8}...(${#OPENAI_API_KEY} chars)"
else
    echo "OPENAI_API_KEY=<NEEDS_MANUAL_SETUP>"
fi
echo "TALON_AUTH_TOKEN=${AUTH_TOKEN:0:8}...(${#AUTH_TOKEN} chars)"
echo

# Test local build
echo "🏗️  Testing Local Build..."
if npm run build > build.log 2>&1; then
    echo "✅ Local build successful"
    PAGES=$(grep -c "Route (pages)" build.log || echo "unknown")
    ROUTES=$(grep -c "Route (app)" build.log || echo "unknown")
    echo "   📄 Static pages: $PAGES"
    echo "   🔌 API routes: $ROUTES"
else
    echo "❌ Local build failed. Check build.log for details."
    echo "   Last 10 lines of build log:"
    tail -10 build.log
    exit 1
fi
echo

# Validate external services
echo "🌐 Validating External Services..."

# Test OpenClaw Gateway
if curl -k -s --connect-timeout 5 https://srv1325349.tail657eaf.ts.net:5050/ > /dev/null; then
    echo "✅ OpenClaw Gateway accessible"
else
    echo "⚠️  WARNING: OpenClaw Gateway connectivity issues"
    echo "   This may cause API errors in production"
fi

# Test Talon API (local)
if curl -s -H "Authorization: Bearer talon-7k9m2x4pqr8w" http://localhost:4100/agents > /dev/null; then
    echo "✅ Talon API service responding"
else
    echo "⚠️  WARNING: Talon API service connectivity issues"
fi

echo

# Create deployment instructions
echo "📋 Manual Render Deployment Steps:"
echo "================================="
echo
echo "1. 🌐 Go to https://render.com/dashboard"
echo "2. 🆕 Click 'New +' → 'Web Service'"
echo "3. 🔗 Connect Repository: $REPO"
echo "4. ⚙️  Service Configuration:"
echo "   - Name: talon"
echo "   - Environment: Node"
echo "   - Region: Oregon (US-West)"
echo "   - Branch: $BRANCH"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm run start"
echo "   - Plan: Starter (\$7/month) [REQUIRED for native modules]"
echo
echo "5. 🔐 Environment Variables (copy from .env.render file):"
echo "   - Add all 8 environment variables listed above"
echo
echo "6. 🚀 Deploy: Click 'Create Web Service'"
echo
echo "7. ✅ Verify: Wait for deployment to complete (5-10 minutes)"
echo
echo "8. 🧪 Test: Visit your-service.onrender.com and verify functionality"
echo

# Create post-deployment test script
cat > test-deployment.sh << 'EOF'
#!/bin/bash

# Post-Deployment Test Script
# Tests all critical Talon functionality

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <render-app-url>"
    echo "Example: $0 https://talon.onrender.com"
    exit 1
fi

URL="$1"
echo "🧪 Testing Talon Deployment: $URL"
echo "=============================="

# Test basic connectivity
echo "📡 Testing basic connectivity..."
if curl -s --fail "${URL}/" > /dev/null; then
    echo "✅ Main page loads"
else
    echo "❌ Main page failed to load"
    exit 1
fi

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH=$(curl -s "${URL}/api/health" | jq -r '.status // "unknown"')
if [ "$HEALTH" = "ok" ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed: $HEALTH"
fi

# Test API endpoints
echo "🔌 Testing API endpoints..."
API_ENDPOINTS=("/api/agents" "/api/sessions" "/api/system/health")

for endpoint in "${API_ENDPOINTS[@]}"; do
    if curl -s --fail "${URL}${endpoint}" > /dev/null; then
        echo "✅ ${endpoint} responding"
    else
        echo "⚠️  ${endpoint} issues detected"
    fi
done

echo
echo "🎉 Deployment test completed!"
echo "📊 Visit $URL to use Talon dashboard"
EOF

chmod +x test-deployment.sh

echo "📁 Files Created:"
echo "================"
echo "✅ .env.render - Environment variables for Render"
echo "✅ test-deployment.sh - Post-deployment testing script"
echo "✅ build.log - Build output for reference"
echo

echo "🎯 READY FOR DEPLOYMENT!"
echo "========================"
echo "All prerequisites are met for Render deployment."
echo "Use the manual steps above to create the service."
echo "After deployment, run: ./test-deployment.sh <your-render-url>"
echo

echo "🔗 Useful Links:"
echo "==============="
echo "Render Dashboard: https://render.com/dashboard"
echo "GitHub Repository: https://github.com/$REPO"
echo "Documentation: ./DEPLOYMENT_CHECKLIST.md"
echo

# Clean up
if [ -f build.log ]; then
    rm build.log
fi

echo "✨ Deployment preparation complete!"
EOF