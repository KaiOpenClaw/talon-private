#!/bin/bash

# Post-Deployment Validation Script
# Usage: ./test-deployment.sh https://your-service.onrender.com

DEPLOY_URL="$1"
if [ -z "$DEPLOY_URL" ]; then
    echo "Usage: $0 https://your-service.onrender.com"
    exit 1
fi

echo "🧪 Testing deployment at: $DEPLOY_URL"
echo "=========================="

tests=0
passed=0

test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local expected="$3"
    
    tests=$((tests + 1))
    echo -n "Testing $name: "
    
    response=$(curl -s -w "%{http_code}" "$DEPLOY_URL$endpoint" -o /dev/null)
    if [ "$response" = "$expected" ]; then
        echo "✅ PASS ($response)"
        passed=$((passed + 1))
    else
        echo "❌ FAIL (expected $expected, got $response)"
    fi
}

# Run tests
test_endpoint "Dashboard" "/" "200"
test_endpoint "Health Check" "/api/health" "200"  
test_endpoint "Agents API" "/api/agents" "200"
test_endpoint "Sessions API" "/api/sessions" "200"
test_endpoint "Search Page" "/search" "200"
test_endpoint "Login Page" "/login" "200"

echo ""
echo "Results: $passed/$tests tests passed"
if [ $passed -eq $tests ]; then
    echo "🎉 ALL TESTS PASSED - Deployment successful!"
    exit 0
else
    echo "⚠️  Some tests failed - Check logs and configuration"
    exit 1
fi
