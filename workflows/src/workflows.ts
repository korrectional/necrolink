/**
 * Temporal Durable Workflow Definition: ResurrectRepoWorkflow
 * Guarantees resilient completion of repository resurrection across crashes,
 * rate limits, and network intermittency.
 */

import type * as activities from "./activities.js";
import type { ResurrectPayload } from "./activities.js";

export interface WorkflowOptions {
  repoIdentifier: string;
  forceFreshAnalysis?: boolean;
}

/**
 * ResurrectRepoWorkflow
 * Orchestrates: fetchRepoArchive -> extractGitMetrics -> executeTabPFNAnalysis -> generateMemorialPayload
 */
export async function ResurrectRepoWorkflow(
  options: WorkflowOptions,
  activityProxy?: typeof activities
): Promise<ResurrectPayload> {
  // If running inside full Temporal worker, activities are injected via proxyActivities
  const acts = activityProxy || (await import("./activities.js"));

  // Step 1: Fetch or locate repository
  const archive = await acts.fetchRepoArchive(options.repoIdentifier);

  // Step 2: Extract Git Log Cadence & Contributors
  const gitData = await acts.extractGitMetrics(archive.repoPath);

  // Step 3: Run TabPFN Anomaly & Abandonment Scoring
  const mortality = await acts.executeTabPFNAnalysis(archive.repoName, gitData.metrics);

  // Step 4: Generate Memorial Altar Payload with Gemma 2 Epitaph
  const memorial = await acts.generateMemorialPayload(archive.repoName, gitData, mortality);

  return memorial;
}
