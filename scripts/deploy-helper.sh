#!/bin/bash

# Talon Deployment Helper Script
# Assists with Render deployment by gathering environment variables and testing deployment

set -e

echo "🚀 Talon Deployment Helper"
echo "=========================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "render.yaml" ]; then
    print_error "Must run from talon-private root directory"
    exit 1
fi

echo ""
echo "📋 Step 1: Environment Variables"
echo "================================"

# Generate secure auth token
TALON_AUTH_TOKEN=$(openssl rand -hex 32)
print_status "Generated secure TALON_AUTH_TOKEN"

# Check for OpenClaw config
if [ -f "$HOME/.openclaw/openclaw.json" ]; then
    GATEWAY_TOKEN=$(cat ~/.openclaw/openclaw.json | jq -r '.gateway.auth.token' 2>/dev/null || echo "")
    if [ -n "$GATEWAY_TOKEN" ] && [ "$GATEWAY_TOKEN" != "null" ]; then
        print_status "Found GATEWAY_TOKEN in OpenClaw config"
    else
        print_warning "OpenClaw config exists but no gateway token found"
        GATEWAY_TOKEN="[manual-setup-required]"
    fi
else
    print_warning "OpenClaw config not found at ~/.openclaw/openclaw.json"
    GATEWAY_TOKEN="[manual-setup-required]"
fi

# Check for OpenAI API key
if [ -f "$HOME/.env.openai" ]; then
    source ~/.env.openai
    if [ -n "$OPENAI_API_KEY" ]; then
        print_status "Found OPENAI_API_KEY in ~/.env.openai"
        OPENAI_KEY_PREVIEW="${OPENAI_API_KEY:0:10}..."
    else
        print_warning "~/.env.openai exists but OPENAI_API_KEY not set"
        OPENAI_API_KEY="[manual-setup-required]"
        OPENAI_KEY_PREVIEW="[not-found]"
    fi
else
    print_warning "OpenAI env file not found at ~/.env.openai"
    OPENAI_API_KEY="[manual-setup-required]"
    OPENAI_KEY_PREVIEW="[not-found]"
fi

echo ""
echo "📝 Environment Variables for Render:"
echo "===================================="
cat << EOF
# Core Configuration
NODE_ENV=production
PORT=10000

# OpenClaw Gateway Connection
GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050
GATEWAY_TOKEN=$GATEWAY_TOKEN

# Talon API (Agent Workspaces)  
TALON_API_URL=https://institutions-indicating-limit-were.trycloudflare.com
TALON_API_TOKEN=talon-7k9m2x4pqr8w

# Semantic Search & Authentication
OPENAI_API_KEY=$OPENAI_API_KEY
TALON_AUTH_TOKEN=$TALON_AUTH_TOKEN
EOF

echo ""
echo "🔧 Step 2: Pre-Deployment Verification"
echo "======================================"

# Test build
echo "Testing production build..."
if npm run build > /dev/null 2>&1; then
    print_status "Build successful"
else
    print_error "Build failed - check build output"
    exit 1
fi

# Check critical files
critical_files=(
    "src/app/api/health/route.ts"
    "src/middleware.ts" 
    "render.yaml"
    "DEPLOY.md"
    "Dockerfile"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file missing"
        exit 1
    fi
done

# Check package.json scripts
if jq -e '.scripts.build' package.json > /dev/null && jq -e '.scripts.start' package.json > /dev/null; then
    print_status "Required npm scripts present"
else
    print_error "Missing required npm scripts (build/start)"
    exit 1
fi

echo ""
echo "🌐 Step 3: Deployment Instructions"  
echo "=================================="
echo ""
echo "Manual steps (requires web browser):"
echo ""
echo "1. Go to: https://render.com/dashboard"
echo "2. Click: 'New +' → 'Web Service'"
echo "3. Connect: KaiOpenClaw/talon-private"
echo "4. Configure:"
echo "   - Name: talon"
echo "   - Region: Oregon"
echo "   - Branch: main" 
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm run start"
echo "   - Plan: Starter ($7/month)"
echo "5. Add environment variables (from above)"
echo "6. Deploy!"
echo ""

# Test function for post-deployment
cat << 'EOF' > /tmp/test-deployment.sh
#!/bin/bash
# Test deployment once URL is available

if [ -z "$1" ]; then
    echo "Usage: $0 <render-service-url>"
    echo "Example: $0 https://talon-abc123.onrender.com"
    exit 1
fi

URL="$1"
echo "🧪 Testing deployment at: $URL"

# Test health endpoint
echo "Testing health endpoint..."
if curl -s "$URL/api/health" | grep -q "ok"; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed"
fi

# Test main page
echo "Testing main page..."
if curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "200"; then
    echo "✅ Main page loads"
else
    echo "❌ Main page failed"
fi

echo "🔍 Manual testing checklist:"
echo "- [ ] Dashboard loads in browser"
echo "- [ ] Login page appears (if auth enabled)"
echo "- [ ] Agent list shows 27 agents"
echo "- [ ] Search functionality works"
echo "- [ ] WebSocket connection established"
EOF

chmod +x /tmp/test-deployment.sh
print_status "Created deployment test script at /tmp/test-deployment.sh"

echo ""
echo "📊 Step 4: Post-Deploy Testing"
echo "=============================="
echo ""
echo "Once deployed, run: /tmp/test-deployment.sh <your-render-url>"
echo ""
print_status "Deployment helper complete!"
echo ""
echo "🎯 Next: Create Render web service manually using the config above"
echo ""