#!/bin/bash

echo "--- Language Server Memory Verification ---"

# 1. Check if ignore files exist
if [[ -f ".geminiignore" && -f ".aiexclude" ]]; then
    echo "[PASS] AI Ignore files found."
else
    echo "[FAIL] AI Ignore files missing."
fi

# 2. Check workspace settings
if grep -qF '"**/node_modules": true' .vscode/settings.json; then
    echo "[PASS] node_modules hidden in workspace settings."
else
    echo "[FAIL] node_modules NOT hidden in workspace settings."
fi

# 3. Check memory usage of language_server_macos_x64
PROCESS_INFO=$(ps aux | grep language_server_macos_x64 | grep -v grep)
if [[ -z "$PROCESS_INFO" ]]; then
    echo "[INFO] Language Server not running yet. Please reload window."
else
    PID=$(echo "$PROCESS_INFO" | awk '{print $2}')
    MEM_RSS=$(echo "$PROCESS_INFO" | awk '{print $6}') # RSS in KB
    MEM_MB=$(echo "$MEM_RSS / 1024" | bc)
    
    echo "Current PID: $PID"
    echo "Current Memory Usage: ${MEM_MB} MB"
    
    if [ "$MEM_MB" -lt 1024 ]; then
        echo "[SUCCESS] Memory usage is under 1 GB limit."
    else
        echo "[WARNING] Memory usage is still high (${MEM_MB} MB). Ensure cache purge and restart were completed."
    fi
fi

echo "-------------------------------------------"
