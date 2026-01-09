#!/bin/bash

# Workflow Enforcement Helper
# This script helps enforce verification steps in workflows

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verification checkpoint function
checkpoint() {
    local step_name="$1"
    local verification_command="$2"
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}CHECKPOINT: ${step_name}${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    if [ -n "$verification_command" ]; then
        echo "Running verification: $verification_command"
        eval "$verification_command"
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            echo -e "\n${GREEN}✓ Checkpoint passed${NC}\n"
            return 0
        else
            echo -e "\n${RED}✗ Checkpoint FAILED${NC}"
            echo -e "${RED}Cannot proceed until this checkpoint passes${NC}\n"
            return 1
        fi
    else
        echo -e "${YELLOW}Manual verification required.${NC}"
        echo -e "${YELLOW}Have you completed this step? (yes/no)${NC}"
        read -r response
        
        if [[ "$response" =~ ^[Yy] ]]; then
            echo -e "${GREEN}✓ Checkpoint confirmed${NC}\n"
            return 0
        else
            echo -e "${RED}✗ Checkpoint not confirmed${NC}"
            echo -e "${RED}Cannot proceed${NC}\n"
            return 1
        fi
    fi
}

# Usage example:
# checkpoint "Schema Validation" "pnpm exec sanity schema validate"
# checkpoint "Studio UI Refreshed and Verified"  # Manual verification

# Export for use in other scripts
export -f checkpoint
