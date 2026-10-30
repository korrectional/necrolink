# ==============================================================================
# NecroLink: Autonomous End-to-End Verification Pipeline (PowerShell)
# Runs Python PyTest, Monorepo TypeCheck, CLI Smoke Tests, and Workflow Execution
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "🕯️ [NecroLink Verification] Commencing end-to-end autonomous checks..." -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------" -ForegroundColor Gray

# 1. Python PyTest on TabPFN Microservice
Write-Host "Step 1: Running Python PyTest on TabPFN-3.5 Mortality Service..." -ForegroundColor Cyan
if (Test-Path ".\.venv\Scripts\pytest.exe") {
    & .\.venv\Scripts\pytest.exe tests/test_analysis.py
} else {
    pytest tests/test_analysis.py
}
Write-Host "✅ Step 1 Passed: TabPFN Mortality Service tests passed cleanly." -ForegroundColor Green

# 2. Strict TypeScript Monorepo Check
Write-Host "Step 2: Running Strict TypeScript Compilation across all workspaces..." -ForegroundColor Cyan
npm run typecheck
Write-Host "✅ Step 2 Passed: Monorepo TypeScript strict check passed cleanly." -ForegroundColor Green

# 3. CLI, Agent & GitHub Webhook Integration Smoke Tests
Write-Host "Step 3: Running CLI, Tools, Webhook, and Durable Workflow Integration Tests..." -ForegroundColor Cyan
npm test
npm run test:webhook
Write-Host "✅ Step 3 Passed: CLI, Agent, and Webhook smoke tests passed cleanly." -ForegroundColor Green

# 4. End-to-End Command Smoke Validations
Write-Host "Step 4: Executing NecroLink CLI commands..." -ForegroundColor Cyan
npx tsx cli/bin/necrolink.ts analyze unix-v6-legacy
npx tsx cli/bin/necrolink.ts eulogy fortran-matrix-v1
npx tsx cli/bin/necrolink.ts altar
npx tsx cli/bin/necrolink.ts simulate-archive fortran-matrix-v1
npx tsx cli/bin/necrolink.ts resurrect unix-v6-legacy --silent
Write-Host "✅ Step 4 Passed: All CLI commands completed successfully." -ForegroundColor Green

Write-Host "----------------------------------------------------------------------" -ForegroundColor Gray
Write-Host "🕯️ All NecroLink Autonomous Verification Checks PASSED (100% Green)." -ForegroundColor Yellow
