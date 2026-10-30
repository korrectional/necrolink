/**
 * Durable Workflow Activities for Temporal SDK
 * Encapsulates reliable retries, backoff, and idempotent step execution.
 */

import { parseGitRepository, ExtractedGitData } from "../../agent/src/tools/gitParserTool.js";
import { runTabPFNAnalysis, TabPFNResult, TabPFNMetrics } from "../../agent/src/tools/tabpfnTool.js";
import { fetchHistoricalContext, ArchivalContextResult } from "../../agent/src/tools/browserbaseTool.js";
import { gemma } from "../../agent/src/gemmaProvider.js";

export interface ResurrectPayload {
  repoName: string;
  gitData: ExtractedGitData;
  mortality: TabPFNResult;
  archives: ArchivalContextResult;
  eulogy: string;
  resurrectedAt: string;
}

/**
 * Activity: Clones or inspects repository archive with exponential retry.
 */
export async function fetchRepoArchive(repoIdentifier: string): Promise<{ repoPath: string; repoName: string }> {
  // In a live environment, clones git repo or retrieves bundle.
  // For local or synthetic tests, resolves directory path.
  const repoName = repoIdentifier.split("/").pop()?.replace(".git", "") || repoIdentifier;
  return {
    repoPath: repoIdentifier,
    repoName
  };
}

/**
 * Activity: Extracts tabular commit metrics and contributor history.
 */
export async function extractGitMetrics(repoPath: string): Promise<ExtractedGitData> {
  return await parseGitRepository(repoPath);
}

/**
 * Activity: Invokes TabPFN-3.5 abandonment risk scoring and inflection point detection.
 */
export async function executeTabPFNAnalysis(
  repoName: string,
  metrics: TabPFNMetrics
): Promise<TabPFNResult> {
  return await runTabPFNAnalysis(repoName, metrics);
}

/**
 * Activity: Synthesizes complete memorial payload with Gemma 2 eulogy and Usenet archives.
 */
export async function generateMemorialPayload(
  repoName: string,
  gitData: ExtractedGitData,
  mortality: TabPFNResult
): Promise<ResurrectPayload> {
  const archives = await fetchHistoricalContext(repoName);
  const eulogy = await gemma.generateMemorialEpitaph(repoName, gitData.metrics);

  return {
    repoName,
    gitData,
    mortality,
    archives,
    eulogy,
    resurrectedAt: new Date().toISOString()
  };
}
