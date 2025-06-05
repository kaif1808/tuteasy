#!/bin/bash

# TutEasy Backend API Test Script
# This script tests the basic functionality of the backend APIs

echo "🚀 TutEasy Backend API Testing"
echo "==============================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="http://localhost:5000"

# Test 1: Health Check
echo -e "\n1. Testing Health Check..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "$BACKEND_URL/health")
HTTP_CODE=${HEALTH_RESPONSE: -3}

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    cat /tmp/health_response.json
    echo
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_CODE)${NC}"
fi

# Test 2: User Registration
echo -e "\n2. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/register_response.json \
  -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-user-'$(date +%s)'@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "STUDENT"
  }')
HTTP_CODE=${REGISTER_RESPONSE: -3}

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Registration test passed${NC}"
    cat /tmp/register_response.json
    echo
else
    echo -e "${RED}❌ Registration test failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/register_response.json
    echo
fi

# Test 3: Search API - Get Filters (requires authentication)
echo -e "\n3. Testing Search API - Get Filters..."
# Note: This will fail without authentication, but tests the endpoint exists
FILTERS_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/filters_response.json \
  "$BACKEND_URL/api/search/filters")
HTTP_CODE=${FILTERS_RESPONSE: -3}

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${YELLOW}⚠️  Search filters endpoint exists but requires authentication (expected)${NC}"
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Search filters test passed${NC}"
    cat /tmp/filters_response.json
    echo
else
    echo -e "${RED}❌ Search filters test failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/filters_response.json
    echo
fi

# Test 4: Search API - Tutor Search (requires authentication)
echo -e "\n4. Testing Search API - Tutor Search..."
SEARCH_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/search_response.json \
  "$BACKEND_URL/api/search/tutors")
HTTP_CODE=${SEARCH_RESPONSE: -3}

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${YELLOW}⚠️  Tutor search endpoint exists but requires authentication (expected)${NC}"
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Tutor search test passed${NC}"
    cat /tmp/search_response.json
    echo
else
    echo -e "${RED}❌ Tutor search test failed (HTTP $HTTP_CODE)${NC}"
    cat /tmp/search_response.json
    echo
fi

# Test 5: Invalid endpoint (should return 404)
echo -e "\n5. Testing Invalid Endpoint..."
INVALID_RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/invalid_response.json \
  "$BACKEND_URL/api/nonexistent")
HTTP_CODE=${INVALID_RESPONSE: -3}

if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✅ Invalid endpoint correctly returns 404${NC}"
else
    echo -e "${RED}❌ Invalid endpoint test failed (expected 404, got $HTTP_CODE)${NC}"
fi

# Summary
echo -e "\n📊 Test Summary"
echo "==============="
echo -e "${GREEN}✅ Tests that should pass:${NC}"
echo "  - Health check (200 OK)"
echo "  - User registration (200/201)"
echo "  - Invalid endpoint (404)"
echo ""
echo -e "${YELLOW}⚠️  Expected authentication errors:${NC}"
echo "  - Search endpoints (401 Unauthorized without JWT)"
echo ""
echo -e "${RED}❌ If you see other errors:${NC}"
echo "  - Check that backend is running on port 5000"
echo "  - Check database connection"
echo "  - Check environment variables"

# Cleanup
rm -f /tmp/health_response.json /tmp/register_response.json /tmp/filters_response.json /tmp/search_response.json /tmp/invalid_response.json

echo -e "\n🎯 Quick Frontend Test:"
echo "Open http://localhost:5173/test/components in your browser"
echo "This will test all UI components without requiring backend setup." 