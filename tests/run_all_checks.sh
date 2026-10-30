#!/usr/bin/env bash
# ==============================================================================
# NecroLink: Autonomous End-to-End Verification Pipeline
# Runs Python PyTest, Monorepo TypeCheck, CLI Smoke Tests, and Workflow Execution
# ==============================================================================

set -e

echo "🕯️ [NecroLink Verification] Commencing end-to-end autonomous checks..."
echo "----------------------------------------------------------------------"

# 1. Python PyTest on TabPFN Microservice
echo "Step 1: Running Python PyTest on TabPFN-3.5 Mortality Service..."
if [ -f "./.venv/Scripts/pytest.exe" ]; then
  ./.venv/Scripts/pytest.exe tests/test_analysis.py
elif [ -f "./.venv/bin/pytest" ]; then
  ./.venv/bin/pytest tests/test_analysis.py
else
  pytest tests/test_analysis.py
fi
echo "✅ Step 1 Passed: TabPFN Mortality Service tests passed cleanly."

# 2. Strict TypeScript Monorepo Check
echo "Step 2: Running Strict TypeScript Compilation across all workspaces..."
npm run typecheck
echo "✅ Step 2 Passed: Monorepo TypeScript strict check passed cleanly."

# 3. CLI, Agent & GitHub Webhook Integration Smoke Tests
echo "Step 3: Running CLI, Tools, Webhook, and Durable Workflow Integration Tests..."
npm test
npm run test:webhook
echo "✅ Step 3 Passed: CLI, Agent, and Webhook smoke tests passed cleanly."

# 4. End-to-End Command Smoke Validations
echo "Step 4: Executing NecroLink CLI commands..."
npx tsx cli/bin/necrolink.ts analyze unix-v6-legacy
npx tsx cli/bin/necrolink.ts eulogy fortran-matrix-v1
npx tsx cli/bin/necrolink.ts altar
npx tsx cli/bin/necrolink.ts simulate-archive fortran-matrix-v1
npx tsx cli/bin/necrolink.ts resurrect unix-v6-legacy --silent
echo "✅ Step 4 Passed: All CLI commands completed successfully."

echo "----------------------------------------------------------------------"
echo "🕯️ All NecroLink Autonomous Verification Checks PASSED (100% Green)."
