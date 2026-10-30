/**
 * GitHub Webhook Ingestion & Automated Memorial Dispatcher
 * Verifies HMAC SHA-256 webhook signatures, listens for repository deprecation & archival events
 * (e.g. `repository.archived`, `public_archived`, `issues.labeled`), executes the durable resurrection
 * workflow, and dispatches a digital ofrenda post-mortem tribute.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { telemetry } from "../telemetry.js";
import { runStandaloneWorkflow } from "../../../workflows/src/worker.js";
import type { ResurrectPayload } from "../../../workflows/src/activities.js";

export interface GitHubWebhookHeaders {
  "x-github-event"?: string;
  "x-github-delivery"?: string;
  "x-hub-signature-256"?: string;
  [key: string]: string | undefined;
}

export interface GitHubWebhookPayload {
  action?: string;
  repository?: {
    name: string;
    full_name: string;
    html_url?: string;
    description?: string;
    archived?: boolean;
    default_branch?: string;
    owner?: {
      login: string;
    };
  };
  sender?: {
    login: string;
  };
  issue?: {
    number: number;
    title: string;
    labels?: Array<{ name: string }>;
  };
  zen?: string; // Ping event
  hook_id?: number;
}

export interface WebhookProcessingResult {
  status: "processed" | "ignored" | "ping_acknowledged" | "invalid_signature";
  eventType: string;
  repoName?: string;
  memorialPayload?: ResurrectPayload;
  memorialMarkdown?: string;
  dispatchedTo?: "github_api" | "local_archive" | "simulated";
  artifactPath?: string;
  message: string;
}

/**
 * Validates HMAC SHA-256 signature from GitHub webhook header `x-hub-signature-256`.
 */
export function verifyGitHubWebhookSignature(
  rawBody: string,
  signatureHeader?: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.GITHUB_WEBHOOK_SECRET;

  // If no secret is configured, allow in development/testing mode
  if (!webhookSecret) {
    return true;
  }

  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = `sha256=${crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex")}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Generates an evocative Markdown memorial post-mortem ready for GitHub Issues, PRs, or local archival.
 */
export function formatMemorialPostMortem(payload: ResurrectPayload): string {
  const m = payload.gitData.metrics;
  const riskPct = (payload.mortality.abandonment_risk * 100).toFixed(1);
  const statusBadge = payload.mortality.abandonment_risk >= 0.70
    ? "🪦 **STATUS: FATALLY ARCHIVED**"
    : "🍂 **STATUS: DORMANT RELIC**";

  const contributorsTable = payload.gitData.topContributors
    .map(
      (c, i) =>
        `| #${i + 1} | **${c.name}** | ${c.commits} | ${c.lastActive} |`
    )
    .join("\n");

  const fatalFactorsList = payload.mortality.fatal_factors.length > 0
    ? payload.mortality.fatal_factors.map((f) => `- 🥀 ${f}`).join("\n")
    : "- 🕯️ Maintainer transitioned to other priorities after years of service";

  return `<!-- NecroLink Digital Ofrenda Memorial -->
# 🕯️ DIGITAL OFRENDA MEMORIAL POST-MORTEM: \`${payload.repoName}\`

> *"In Mexican Día de los Muertos tradition, the dead never truly perish until the living cease to speak their names. In open source, an archive lives as long as its commits are read."*

---

### ${statusBadge}
- **ML Anomaly Engine**: \`${payload.mortality.engine}\`
- **Computed Abandonment Risk**: **${riskPct}%**
- **Fatal Inflection Point**: ${payload.mortality.inflection_point?.description || "Historical retirement"}
- **Resurrection Ritual Completed**: \`${payload.resurrectedAt}\`

---

## 📜 Ancestral Epitaph & Eulogy
${payload.eulogy}

---

## 📊 TabPFN-3.5 Mortality & Cadence Diagnostic
| Cadence Metric | Observed Historical Value | Preservation Analysis |
| :--- | :--- | :--- |
| **Average Commit Gap** | \`${m.commit_interval_days} days\` | ${m.commit_interval_days > 60 ? "Critical Stagnation" : "Active Cadence"} |
| **Maintainer Count (Bus Factor)** | \`${m.author_count}\` maintainer(s) | ${m.author_count <= 1 ? "Solo Author Isolation" : "Collaborative"} |
| **Code Refactoring Deletions** | \`${(m.deletions_ratio * 100).toFixed(1)}%\` | ${m.deletions_ratio < 0.05 ? "Ossification" : "Refactored"} |
| **Issue Resolution Latency** | \`${m.issue_resolution_latency} days\` | ${m.issue_resolution_latency > 90 ? "Frozen Backlog" : "Responsive"} |

### Diagnosed Causes of Deprecation
${fatalFactorsList}

---

## 🏆 Preserved Maintainers & Contributor Honor Roll
| Rank | Maintainer / Contributor | Historical Commits | Last Active |
| :---: | :--- | :---: | :--- |
${contributorsTable}

---

## 🌾 The Living Memory Ritual
Living engineers seeking to carry this torch forward:
1. **Fork with Reverence**: Preserve original copyright and author credits in the codebase header.
2. **Compile Vintage Builds**: Run modern linters and transmute outdated C/FORTRAN pointers into memory-safe Rust.
3. **Offer a Marigold**: Speak the creator's name into your terminal shell.

*Que descansen en paz los bytes sagrados.* 🕯️
`;
}

/**
 * Processes incoming GitHub Webhooks and dispatches memorial actions.
 */
export async function processGitHubWebhook(
  rawBody: string,
  headers: GitHubWebhookHeaders,
  options: { secret?: string; memorialsDir?: string } = {}
): Promise<WebhookProcessingResult> {
  const startTime = Date.now();
  const event = headers["x-github-event"] || "repository";
  const signature = headers["x-hub-signature-256"];

  return telemetry.traceSpan(
    { op: "webhook.github_ingest", name: "Process_GitHub_Webhook", data: { event } },
    async () => {
      // 1. Signature Verification
      const isValid = verifyGitHubWebhookSignature(rawBody, signature, options.secret);
      if (!isValid) {
        return {
          status: "invalid_signature",
          eventType: event,
          message: "Invalid or mismatched HMAC SHA-256 signature in X-Hub-Signature-256."
        };
      }

      let payload: GitHubWebhookPayload;
      try {
        payload = JSON.parse(rawBody);
      } catch (err: any) {
        return {
          status: "ignored",
          eventType: event,
          message: `Malformed JSON payload: ${err.message}`
        };
      }

      // 2. Handle GitHub Ping Handshake
      if (event === "ping") {
        return {
          status: "ping_acknowledged",
          eventType: event,
          message: `GitHub webhook ping received successfully. Zen: "${payload.zen || 'Open Source Eternal'}"`
        };
      }

      // 3. Detect Archival / Memorial Triggers
      const isArchivedAction =
        (event === "repository" && payload.action === "archived") ||
        payload.repository?.archived === true;

      const hasMemorialLabel =
        (event === "issues" || event === "pull_request") &&
        payload.issue?.labels?.some(
          (l) => l.name.toLowerCase() === "memorial" || l.name.toLowerCase() === "resurrect"
        );

      const isManualResurrect = event === "resurrect" || event === "simulate_archived";

      if (!isArchivedAction && !hasMemorialLabel && !isManualResurrect) {
        return {
          status: "ignored",
          eventType: event,
          message: `Event [${event}:${payload.action || 'default'}] does not trigger resurrection.`
        };
      }

      // 4. Resolve Target Repository Name
      const repoName =
        payload.repository?.name ||
        payload.repository?.full_name?.split("/").pop() ||
        "legacy-open-source-project";

      // 5. Run Durable Resurrection Workflow
      const memorial = await runStandaloneWorkflow({
        repoIdentifier: repoName,
        forceFreshAnalysis: true
      });

      // 6. Generate Memorial Markdown Document
      const markdown = formatMemorialPostMortem(memorial);

      // 7. Dispatch: If GITHUB_TOKEN is available, post comment; else save to memorials directory
      let dispatchedTo: "github_api" | "local_archive" | "simulated" = "local_archive";
      let artifactPath: string | undefined;

      const githubToken = process.env.GITHUB_TOKEN;
      if (githubToken && payload.repository?.full_name && payload.issue?.number) {
        try {
          const commentUrl = `https://api.github.com/repos/${payload.repository.full_name}/issues/${payload.issue.number}/comments`;
          const res = await fetch(commentUrl, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${githubToken}`,
              "Content-Type": "application/json",
              "User-Agent": "NecroLink-Digital-Ofrenda-Agent"
            },
            body: JSON.stringify({ body: markdown })
          });
          if (res.ok) {
            dispatchedTo = "github_api";
          }
        } catch {
          // Fall through to local archive saving
        }
      }

      // Save local memorial artifact
      const targetDir = options.memorialsDir || path.resolve(process.cwd(), "memorials");
      try {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        artifactPath = path.join(targetDir, `${repoName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-memorial.md`);
        fs.writeFileSync(artifactPath, markdown, "utf-8");
      } catch {
        // If filesystem fails, keep in-memory
      }

      telemetry.recordToolCall("githubWebhookTool", "success", Date.now() - startTime);

      return {
        status: "processed",
        eventType: event,
        repoName,
        memorialPayload: memorial,
        memorialMarkdown: markdown,
        dispatchedTo,
        artifactPath,
        message: `Successfully processed ${event} for '${repoName}'. Memorial created.`
      };
    }
  );
}
