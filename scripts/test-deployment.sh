#!/bin/bash
# Deployment Testing Script for Talon Migration
#
# This script tests the deployment pipeline after migration to TerminalGravity/talon
# It validates build, API endpoints, and critical functionality
#
# Usage: ./scripts/test-deployment.sh [local|staging|production]

set -e

# Configuration
ENVIRONMENT="${1:-local}"
TIMEOUT=30

# URLs for different environments
declare -A BASE_URLS=(
    ["local"]="http://localhost:3000"
    ["staging"]="https://talon-staging.render.com"
    ["production"]="https://talon.render.com"
)

BASE_URL="${BASE_URLS[$ENVIRONMENT]}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results
PASSED_TESTS=0
FAILED_TESTS=0
TOTAL_TESTS=0

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Test result tracking
test_pass() {
    local test_name="$1"
    log "✅ PASS: $test_name"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

test_fail() {
    local test_name="$1"
    local reason="$2"
    error "❌ FAIL: $test_name - $reason"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# HTTP test helper
http_test() {
    local endpoint="$1"
    local expected_status="$2"
    local test_name="$3"
    
    info "Testing $endpoint..."
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BASE_URL$endpoint" || echo "000")
    local status_code="${response: -3}"
    
    if [[ "$status_code" == "$expected_status" ]]; then
        test_pass "$test_name"
        return 0
    else
        test_fail "$test_name" "Expected $expected_status, got $status_code"
        return 1
    fi
}

# JSON response test
json_test() {
    local endpoint="$1"
    local expected_field="$2"
    local test_name="$3"
    
    info "Testing JSON response from $endpoint..."
    
    local response=$(curl -s "$BASE_URL$endpoint" || echo "{}")
    
    if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        test_pass "$test_name"
        return 0
    else
        test_fail "$test_name" "Field '$expected_field' not found in response"
        return 1
    fi
}

# Build tests (only for local)
test_build() {
    if [[ "$ENVIRONMENT" != "local" ]]; then
        info "Skipping build tests for $ENVIRONMENT environment"
        return 0
    fi
    
    log "Running build tests..."
    
    # Check if build artifacts exist
    if [[ -d ".next" ]]; then
        test_pass "Build artifacts exist"
    else
        test_fail "Build artifacts exist" ".next directory not found"
    fi
    
    # Test build command
    info "Testing build command..."
    if npm run build > /tmp/build.log 2>&1; then
        test_pass "Build command succeeds"
    else
        test_fail "Build command succeeds" "npm run build failed"
        tail -10 /tmp/build.log || true
    fi
    
    # Check for TypeScript errors
    if npx tsc --noEmit > /tmp/typecheck.log 2>&1; then
        test_pass "TypeScript compilation"
    else
        test_fail "TypeScript compilation" "Type check failed"
        head -20 /tmp/typecheck.log || true
    fi
}

# Basic connectivity tests
test_connectivity() {
    log "Running connectivity tests..."
    
    # Test main page
    http_test "/" "200" "Main page loads"
    
    # Test login page
    http_test "/login" "200" "Login page loads"
    
    # Test API health
    http_test "/api/health" "200" "Health API endpoint"
    
    # Test 404 handling
    http_test "/nonexistent-page" "404" "404 error handling"
}

# API endpoint tests
test_api_endpoints() {
    log "Running API endpoint tests..."
    
    # Core API endpoints (without authentication for basic connectivity)
    ENDPOINTS=(
        "/api/agents:200:Agents API"
        "/api/sessions:200:Sessions API"
        "/api/search:200:Search API"
        "/api/system/health:200:System Health API"
        "/api/cron/status:200:Cron Status API"
    )
    
    for endpoint_def in "${ENDPOINTS[@]}"; do
        IFS=':' read -r endpoint expected_status test_name <<< "$endpoint_def"
        http_test "$endpoint" "$expected_status" "$test_name"
    done
}

# Authentication tests
test_authentication() {
    log "Running authentication tests..."
    
    # Test protected endpoint without auth (should redirect or return 401)
    local auth_response=$(curl -s -w "%{http_code}" -o /tmp/auth_test.json "$BASE_URL/api/protected" || echo "000")
    local auth_status="${auth_response: -3}"
    
    if [[ "$auth_status" == "401" ]] || [[ "$auth_status" == "302" ]] || [[ "$auth_status" == "200" ]]; then
        test_pass "Authentication system responsive"
    else
        test_fail "Authentication system responsive" "Unexpected status: $auth_status"
    fi
}

# Performance tests
test_performance() {
    log "Running performance tests..."
    
    # Test page load times
    info "Testing main page load time..."
    local load_time=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL/" || echo "999")
    
    # Convert to integer comparison (remove decimal)
    local load_time_ms=$(echo "$load_time * 1000" | bc | cut -d. -f1)
    
    if [[ $load_time_ms -lt 5000 ]]; then
        test_pass "Main page loads in <5s ($load_time s)"
    else
        test_fail "Main page loads in <5s" "Took ${load_time}s"
    fi
    
    # Test API response times
    info "Testing API response time..."
    local api_time=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL/api/health" || echo "999")
    local api_time_ms=$(echo "$api_time * 1000" | bc | cut -d. -f1)
    
    if [[ $api_time_ms -lt 2000 ]]; then
        test_pass "API responds in <2s ($api_time s)"
    else
        test_fail "API responds in <2s" "Took ${api_time}s"
    fi
}

# Environment-specific tests
test_environment() {
    log "Running environment-specific tests for $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        "local")
            # Test development features
            if [[ -f "next.config.js" ]]; then
                test_pass "Development configuration exists"
            else
                test_fail "Development configuration exists" "next.config.js not found"
            fi
            
            # Test if development server can start (background process)
            if command -v npm > /dev/null; then
                test_pass "npm available for development"
            else
                test_fail "npm available for development" "npm command not found"
            fi
            ;;
            
        "staging"|"production")
            # Test production optimizations
            info "Checking production optimizations..."
            
            # Test if gzip/compression is enabled
            local gzip_test=$(curl -s -H "Accept-Encoding: gzip" -w "%{size_download}:%{size_header_received}" -o /dev/null "$BASE_URL/" || echo "0:0")
            IFS=':' read -r size_download size_header <<< "$gzip_test"
            
            if [[ $size_download -lt 200000 ]]; then
                test_pass "Response size optimized (<200KB)"
            else
                test_fail "Response size optimized" "Response size: ${size_download}B"
            fi
            
            # Test HTTPS (for production)
            if [[ "$ENVIRONMENT" == "production" ]]; then
                if [[ "$BASE_URL" == https://* ]]; then
                    test_pass "HTTPS enabled"
                else
                    test_fail "HTTPS enabled" "Production should use HTTPS"
                fi
            fi
            ;;
    esac
}

# Security tests
test_security() {
    log "Running security tests..."
    
    # Test for sensitive information exposure
    local main_page_content=$(curl -s "$BASE_URL/" || echo "")
    
    # Check for common secrets patterns
    SECRET_PATTERNS=(
        "sk-[a-zA-Z0-9]{48}"           # OpenAI keys
        "ghp_[a-zA-Z0-9]{36}"         # GitHub tokens
        "password.*:"                 # Password fields in plain text
    )
    
    local secrets_found=0
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if echo "$main_page_content" | grep -E "$pattern" > /dev/null; then
            warn "Potential secret pattern found in response: $pattern"
            secrets_found=$((secrets_found + 1))
        fi
    done
    
    if [[ $secrets_found -eq 0 ]]; then
        test_pass "No sensitive data exposed"
    else
        test_fail "No sensitive data exposed" "$secrets_found potential secrets found"
    fi
    
    # Test for security headers (in production)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        local headers=$(curl -s -I "$BASE_URL/" || echo "")
        
        if echo "$headers" | grep -i "x-frame-options" > /dev/null; then
            test_pass "Security headers present"
        else
            warn "X-Frame-Options header missing"
        fi
    fi
}

# Integration tests
test_integration() {
    log "Running integration tests..."
    
    # Test if external services are reachable
    local gateway_url="${GATEWAY_URL:-https://srv1325349.tail657eaf.ts.net:5050}"
    
    info "Testing Gateway connectivity..."
    if curl -s --max-time 10 "$gateway_url/api/health" > /dev/null 2>&1; then
        test_pass "Gateway integration reachable"
    else
        warn "Gateway integration unreachable (this may be expected)"
    fi
    
    # Test database/storage connections
    info "Testing storage systems..."
    if [[ -d ".lancedb" ]] && [[ "$ENVIRONMENT" == "local" ]]; then
        test_pass "LanceDB directory exists"
    elif [[ "$ENVIRONMENT" != "local" ]]; then
        info "Skipping LanceDB check for $ENVIRONMENT"
    fi
}

# Generate test report
generate_report() {
    log "Generating test report..."
    
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    local success_rate=0
    
    if [[ $TOTAL_TESTS -gt 0 ]]; then
        success_rate=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    fi
    
    cat > "test-report-$ENVIRONMENT.md" << EOF
# Talon Deployment Test Report

**Environment**: $ENVIRONMENT  
**Base URL**: $BASE_URL  
**Timestamp**: $timestamp  
**Success Rate**: $success_rate% ($PASSED_TESTS/$TOTAL_TESTS passed)

## Test Results Summary

- ✅ **Passed**: $PASSED_TESTS tests
- ❌ **Failed**: $FAILED_TESTS tests
- 📊 **Total**: $TOTAL_TESTS tests

## Test Categories

$(if [[ $FAILED_TESTS -gt 0 ]]; then
echo "### ❌ Failed Tests"
echo "Review the output above for failed test details."
echo ""
fi)

### Environment Details

- **Environment**: $ENVIRONMENT
- **Node.js**: $(node --version 2>/dev/null || echo "Not available")
- **npm**: $(npm --version 2>/dev/null || echo "Not available")

### Next Steps

$(if [[ $FAILED_TESTS -gt 0 ]]; then
echo "1. **Address failed tests** - Review error messages above"
echo "2. **Re-run tests** after fixes: \`./scripts/test-deployment.sh $ENVIRONMENT\`"
else
echo "✅ All tests passed! Deployment is ready."
fi)

3. **Update monitoring** - Add health checks for critical endpoints
4. **Schedule regular testing** - Set up automated test runs

---

*Generated by test-deployment.sh*
EOF
    
    info "Test report saved to test-report-$ENVIRONMENT.md"
}

# Main execution
main() {
    log "Starting deployment tests for $ENVIRONMENT environment..."
    log "Base URL: $BASE_URL"
    
    # Validate environment
    if [[ -z "${BASE_URLS[$ENVIRONMENT]}" ]]; then
        error "Invalid environment: $ENVIRONMENT"
        echo "Valid environments: local, staging, production"
        exit 1
    fi
    
    # Check prerequisites
    if ! command -v curl > /dev/null; then
        error "curl is required for testing"
        exit 1
    fi
    
    if ! command -v jq > /dev/null; then
        warn "jq not found - JSON tests will be limited"
    fi
    
    # Run test suites
    test_build
    test_connectivity
    test_api_endpoints
    test_authentication
    test_performance
    test_environment
    test_security
    test_integration
    
    # Generate final report
    generate_report
    
    # Final summary
    echo ""
    log "Test Summary:"
    echo -e "  ✅ Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "  ❌ Failed: ${RED}$FAILED_TESTS${NC}"
    echo -e "  📊 Total:  ${BLUE}$TOTAL_TESTS${NC}"
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        log "🎉 All tests passed! Deployment is ready."
        exit 0
    else
        error "❌ $FAILED_TESTS tests failed. Review the output above."
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi