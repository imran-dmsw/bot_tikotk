#!/bin/bash
# DMSW — Lance l'agent TikTok en mode standalone
# Cron : 0 17 * * 1,3,5 /Users/imran/dmsw-tiktok/run-agent.sh

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

cd /Users/imran/dmsw-tiktok/agent
export AGENT_MODE=standalone

node node_modules/.bin/tsx src/index.ts >> /tmp/dmsw-agent.log 2>&1
