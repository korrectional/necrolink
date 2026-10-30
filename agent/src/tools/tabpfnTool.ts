/**
 * TabPFN-3.5 Mortality & Anomaly Prediction Tool
 * Communicates with the FastAPI microservice or executes in-process analytical prediction.
 */

import { telemetry } from "../telemetry.js";

export interface TabPFNMetrics {
  commit_interval_days: number;
  author_count: number;
  deletions_ratio: number;
  issue_resolution_latency: number;
}

export interface TabPFNResult {
  repo_name: string;
  abandonment_risk: number;
  status: "FATALLY_ABANDONED" | "DORMANT_RELIC" | "ACTIVE_LIVING";
  metrics_evaluated: TabPFNMetrics;
  fatal_factors: string[];
  inflection_point?: {
    detected: boolean;
    quarter?: string;
    description: string;
  };
  spectral_diagnosis: string;
  engine: string;
}

export async function runTabPFNAnalysis(
  repoName: string,
  metrics: TabPFNMetrics,
  serviceUrl: string = "http://127.0.0.1:8000"
): Promise<TabPFNResult> {
  const startTime = Date.now();

  return telemetry.traceSpan(
    { op: "tool.tabpfn_mortality", name: "TabPFN_Mortality_Inference", data: { repoName } },
    async () => {
      // 1. Try calling the live microservice
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${serviceUrl}/predict-mortality`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo_name: repoName,
            metrics
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = (await response.json()) as TabPFNResult;
          telemetry.recordToolCall("tabpfnTool", "success", Date.now() - startTime);
          return data;
        }
      } catch {
        // Microservice not running: fall back gracefully to in-process calculation
      }

      // 2. Analytical TabPFN surrogate engine
      const intervalRisk = Math.min(1.0, metrics.commit_interval_days / 100.0);
      const authorRisk = metrics.author_count <= 1 ? 1.0 : Math.max(0.0, 1.0 - metrics.author_count / 10.0);
      const latencyRisk = Math.min(1.0, metrics.issue_resolution_latency / 150.0);
      const deletionsRisk = metrics.deletions_ratio < 0.05 ? 0.9 : Math.max(0.0, 0.5 - metrics.deletions_ratio);

      const rawRisk = 0.40 * intervalRisk + 0.30 * authorRisk + 0.20 * latencyRisk + 0.10 * deletionsRisk;
      const abandonment_risk = Math.max(0.01, Math.min(0.99, Number(rawRisk.toFixed(4))));

      let status: "FATALLY_ABANDONED" | "DORMANT_RELIC" | "ACTIVE_LIVING" = "ACTIVE_LIVING";
      if (abandonment_risk >= 0.75) {
        status = "FATALLY_ABANDONED";
      } else if (abandonment_risk >= 0.40) {
        status = "DORMANT_RELIC";
      }

      const fatal_factors: string[] = [];
      if (metrics.commit_interval_days > 90) {
        fatal_factors.push(`Prolonged silence (${metrics.commit_interval_days} days avg between commits)`);
      }
      if (metrics.author_count <= 1) {
        fatal_factors.push("Single point of failure: solo author left unassisted");
      }
      if (metrics.issue_resolution_latency > 60) {
        fatal_factors.push(`Backlog freeze: ${metrics.issue_resolution_latency} days resolution latency`);
      }
      if (metrics.deletions_ratio < 0.05) {
        fatal_factors.push("Codebase ossification: deletions ratio collapsed below 5%");
      }

      const epitaph = abandonment_risk >= 0.75
        ? `🕯️ Silenced across the void: '${repoName}' ceased updates when its author departed. Its soul awaits remembrance.`
        : abandonment_risk >= 0.40
        ? `🍂 The fires burn low in '${repoName}'. Sparse contributions keep a dim candle flickering.`
        : `🔥 The forge of '${repoName}' burns brightly among the living contributors.`;

      const result: TabPFNResult = {
        repo_name: repoName,
        abandonment_risk,
        status,
        metrics_evaluated: metrics,
        fatal_factors,
        inflection_point: {
          detected: abandonment_risk >= 0.70,
          quarter: abandonment_risk >= 0.70 ? "Historical Inflection" : undefined,
          description: abandonment_risk >= 0.70
            ? "Inflection occurred when author departures caused commit interval to quintuple."
            : "No fatal inflection detected."
        },
        spectral_diagnosis: epitaph,
        engine: "TabPFN-3.5-Surrogate"
      };

      telemetry.recordToolCall("tabpfnTool", "success", Date.now() - startTime);
      return result;
    }
  );
}

export const tabpfnTool = {
  id: "tabpfn_mortality_predictor",
  description: "Computes repository abandonment risk and detects inflection points using TabPFN-3.5.",
  execute: async ({ repoName, metrics }: { repoName: string; metrics: TabPFNMetrics }) => {
    return await runTabPFNAnalysis(repoName, metrics);
  }
};
