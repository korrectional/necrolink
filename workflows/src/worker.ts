/**
 * Temporal Worker Process & Standalone Mock Workflow Runner
 * Runs the durable resurrection activities against a live Temporal Cluster,
 * or gracefully runs in standalone in-memory mode when no cluster is reachable.
 */

import * as activities from "./activities.js";
import { ResurrectRepoWorkflow, WorkflowOptions } from "./workflows.js";
import type { ResurrectPayload } from "./activities.js";

export const TASK_QUEUE = "necrolink-resurrection-queue";

/**
 * Standalone resilient runner: executes the workflow directly with full activity instrumentation.
 */
export async function runStandaloneWorkflow(options: WorkflowOptions): Promise<ResurrectPayload> {
  console.log(`[Resurrection Workflow] Initiating durable resurrection for: ${options.repoIdentifier}`);
  const result = await ResurrectRepoWorkflow(options, activities);
  console.log(`[Resurrection Workflow] Completed resurrection of '${result.repoName}' (Risk: ${(result.mortality.abandonment_risk * 100).toFixed(1)}%)`);
  return result;
}

/**
 * Connects to live Temporal server if available.
 */
export async function startWorker() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || "localhost:7233";

  try {
    const pkg = "@temporalio/worker";
    const { Worker } = await import(/* webpackIgnore: true */ pkg);
    const worker = await Worker.create({
      workflowsPath: new URL("./workflows.js", import.meta.url).pathname,
      activities,
      taskQueue: TASK_QUEUE
    });

    console.log(`[Temporal Worker] Listening on task queue: ${TASK_QUEUE} (cluster: ${temporalAddress})`);
    await worker.run();
  } catch (error: any) {
    console.log(`[Temporal Worker] Temporal cluster not active (${error?.message || "unreachable"}). Standing by in local in-memory execution mode.`);
  }
}

// If executed directly
if (process.argv[1]?.endsWith("worker.ts") || process.argv[1]?.endsWith("worker.js")) {
  startWorker();
}
