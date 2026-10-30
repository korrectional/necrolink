/**
 * Automated Smoke and Integration Tests for NecroLink CLI & Workflows
 * Validates Git parsing, TabPFN agent tool, mock Gemma, and durable workflow execution.
 */

import { parseGitRepository } from "../agent/src/tools/gitParserTool.js";
import { runTabPFNAnalysis } from "../agent/src/tools/tabpfnTool.js";
import { fetchHistoricalContext } from "../agent/src/tools/browserbaseTool.js";
import { mockGemma } from "../cli/lib/mockGemma.js";
import { runStandaloneWorkflow } from "../workflows/src/worker.js";

async function runCliTests() {
  console.log("🧪 [NecroLink Test Suite] Starting CLI & Agent verification...\n");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  // Test 1: Git Parser Tool
  try {
    const gitResult = await parseGitRepository(".");
    assert(typeof gitResult.metrics.commit_interval_days === "number", "Git Parser extracts commit interval");
    assert(gitResult.metrics.author_count >= 1, "Git Parser extracts author count");
    assert(gitResult.topContributors.length > 0, "Git Parser extracts top contributors");
  } catch (err: any) {
    assert(false, `Git Parser threw error: ${err.message}`);
  }

  // Test 2: TabPFN Mortality Tool
  try {
    const legacyMetrics = {
      commit_interval_days: 195.0,
      author_count: 1,
      deletions_ratio: 0.02,
      issue_resolution_latency: 280.0
    };
    const tabpfnResult = await runTabPFNAnalysis("unix-v6-legacy", legacyMetrics);
    assert(tabpfnResult.abandonment_risk >= 0.70, "TabPFN classifies abandoned repo with risk >= 70%");
    assert(tabpfnResult.status === "FATALLY_ABANDONED", "TabPFN status is FATALLY_ABANDONED");
    assert(tabpfnResult.fatal_factors.length > 0, "TabPFN provides diagnostic fatal factors");
  } catch (err: any) {
    assert(false, `TabPFN Tool threw error: ${err.message}`);
  }

  // Test 3: Archival Context Tool
  try {
    const archives = await fetchHistoricalContext("unix-v6-legacy");
    assert(archives.threads.length > 0, "Archival Scraper retrieves historical threads");
    assert(archives.threads[0].snippet.length > 10, "Historical thread contains informative snippet");
  } catch (err: any) {
    assert(false, `Archival Tool threw error: ${err.message}`);
  }

  // Test 4: Mock Gemma Persona & Translation
  try {
    const lore = mockGemma.generateResponse("lore");
    assert(lore.includes("🕯️"), "Mock Gemma emits spectral persona format");

    const eulogy = mockGemma.composeEulogy("fortran-matrix-v1", { commit_interval_days: 300, author_count: 1 });
    assert(eulogy.includes("cempasúchil") || eulogy.includes("OFRENDA"), "Eulogy contains Día de los Muertos motifs");
  } catch (err: any) {
    assert(false, `Mock Gemma threw error: ${err.message}`);
  }

  // Test 5: End-to-End Durable Resurrection Workflow
  try {
    const resurrection = await runStandaloneWorkflow({ repoIdentifier: "historical-compiler-v1" });
    assert(resurrection.repoName === "historical-compiler-v1", "Workflow completes for target repo");
    assert(typeof resurrection.mortality.abandonment_risk === "number", "Workflow outputs TabPFN risk");
    assert(resurrection.eulogy.length > 20, "Workflow synthesizes complete eulogy");
  } catch (err: any) {
    assert(false, `Resurrection Workflow threw error: ${err.message}`);
  }

  console.log(`\n🏁 [Test Results]: ${passed}/${total} checks passed cleanly.\n`);
  if (passed !== total) {
    throw new Error(`Smoke test failures: ${total - passed} failed.`);
  }
}

runCliTests().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
