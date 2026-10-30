/**
 * Automated Test Suite for GitHub Webhook Ingestion & Memorial Dispatcher
 * Validates HMAC SHA-256 signature verification, archival event handling,
 * ping handshakes, and markdown memorial artifact output.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  verifyGitHubWebhookSignature,
  processGitHubWebhook,
  formatMemorialPostMortem
} from "../agent/src/tools/githubWebhookTool.js";

async function runWebhookTests() {
  console.log("🧪 [GitHub Webhook Test Suite] Commencing verification...\n");
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

  const testSecret = "necro-secret-super-secure-key-123";

  // Test 1: HMAC SHA-256 Signature Verification - Valid
  try {
    const rawBody = JSON.stringify({ action: "archived", repository: { name: "vintage-lib" } });
    const signature = `sha256=${crypto
      .createHmac("sha256", testSecret)
      .update(rawBody)
      .digest("hex")}`;

    const isValid = verifyGitHubWebhookSignature(rawBody, signature, testSecret);
    assert(isValid, "HMAC SHA-256 signature validates correctly with matching secret");
  } catch (err: any) {
    assert(false, `Signature test error: ${err.message}`);
  }

  // Test 2: HMAC SHA-256 Signature Verification - Tampered Body
  try {
    const rawBody = JSON.stringify({ action: "archived", repository: { name: "vintage-lib" } });
    const tamperedBody = JSON.stringify({ action: "archived", repository: { name: "tampered-lib" } });
    const signature = `sha256=${crypto
      .createHmac("sha256", testSecret)
      .update(rawBody)
      .digest("hex")}`;

    const isValid = verifyGitHubWebhookSignature(tamperedBody, signature, testSecret);
    assert(!isValid, "HMAC SHA-256 signature rejects tampered payload");
  } catch (err: any) {
    assert(false, `Tampered signature test error: ${err.message}`);
  }

  // Test 3: Ping Handshake
  try {
    const pingPayload = JSON.stringify({ zen: "Design for failure.", hook_id: 42 });
    const result = await processGitHubWebhook(pingPayload, { "x-github-event": "ping" });
    assert(result.status === "ping_acknowledged", "GitHub ping event acknowledged");
    assert(result.message.includes("Design for failure"), "Ping response includes zen message");
  } catch (err: any) {
    assert(false, `Ping event test error: ${err.message}`);
  }

  // Test 4: Ignored Event (e.g. star created)
  try {
    const starPayload = JSON.stringify({ action: "created", repository: { name: "active-repo" } });
    const result = await processGitHubWebhook(starPayload, { "x-github-event": "star" });
    assert(result.status === "ignored", "Non-archival events are ignored");
  } catch (err: any) {
    assert(false, `Star event test error: ${err.message}`);
  }

  // Test 5: Real repository.archived Event Ingestion
  const tempMemorialsDir = path.resolve(process.cwd(), "memorials-test");
  try {
    const archivePayload = JSON.stringify({
      action: "archived",
      repository: {
        name: "ancient-pascal-core",
        full_name: "ancestors/ancient-pascal-core",
        archived: true,
        description: "Archived Turbo Pascal engine from 1989"
      },
      sender: {
        login: "original-founder"
      }
    });

    const result = await processGitHubWebhook(
      archivePayload,
      { "x-github-event": "repository" },
      { memorialsDir: tempMemorialsDir }
    );

    assert(result.status === "processed", "Webhook processor processed repository.archived");
    assert(result.repoName === "ancient-pascal-core", "Identified correct target repository");
    assert(typeof result.memorialPayload?.mortality.abandonment_risk === "number", "Calculated TabPFN mortality score");
    assert(Boolean(result.memorialMarkdown?.includes("DIGITAL OFRENDA MEMORIAL POST-MORTEM")), "Formatted Markdown post-mortem title");
    assert(Boolean(result.memorialMarkdown?.includes("TabPFN-3.5 Mortality")), "Includes TabPFN mortality diagnostic table");
    assert(result.artifactPath !== undefined && fs.existsSync(result.artifactPath), "Saved memorial markdown artifact to disk");

    // Clean up test memorials directory
    if (result.artifactPath && fs.existsSync(result.artifactPath)) {
      fs.unlinkSync(result.artifactPath);
    }
    if (fs.existsSync(tempMemorialsDir)) {
      fs.rmdirSync(tempMemorialsDir);
    }
  } catch (err: any) {
    assert(false, `Archival webhook test error: ${err.message}`);
  }

  // Test 6: Issue labeled 'memorial'
  try {
    const issuePayload = JSON.stringify({
      action: "labeled",
      repository: {
        name: "unix-v6-legacy"
      },
      issue: {
        number: 101,
        title: "Please honor this codebase",
        labels: [{ name: "memorial" }]
      }
    });

    const result = await processGitHubWebhook(
      issuePayload,
      { "x-github-event": "issues" }
    );

    assert(result.status === "processed", "Issue labeled 'memorial' triggers post-mortem processing");
  } catch (err: any) {
    assert(false, `Issue labeled test error: ${err.message}`);
  }

  console.log(`\n🏁 [Webhook Results]: ${passed}/${total} checks passed cleanly.\n`);
  if (passed !== total) {
    throw new Error(`Webhook test failures: ${total - passed} failed.`);
  }
}

runWebhookTests().catch((err) => {
  console.error("Webhook test execution failed:", err);
  process.exit(1);
});
