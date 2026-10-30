/**
 * Sentry Agent Tracing & Observability Harness
 * Instruments Mastra workflows, LLM generation spans, and tool execution.
 * Tracks latency waterfalls, token usage, and mortality prediction telemetry.
 */

import * as Sentry from "@sentry/node";

export interface SpanContext {
  op: string;
  name: string;
  data?: Record<string, any>;
}

export class AgentTelemetry {
  private static instance: AgentTelemetry;
  private isInitialized = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): AgentTelemetry {
    if (!AgentTelemetry.instance) {
      AgentTelemetry.instance = new AgentTelemetry();
    }
    return AgentTelemetry.instance;
  }

  private init() {
    const dsn = process.env.SENTRY_DSN || "https://mock@sentry.io/4500000000000000";
    try {
      Sentry.init({
        dsn,
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV || "development",
        release: "necrolink@1.0.0",
        beforeSend(event) {
          // Sanitizer to protect repository tokens and private paths
          if (event.request?.headers) {
            delete event.request.headers["authorization"];
          }
          return event;
        }
      });
      this.isInitialized = true;
    } catch {
      this.isInitialized = false;
    }
  }

  /**
   * Tracks an asynchronous agent operation within an active Sentry span.
   */
  public async traceSpan<T>(
    context: SpanContext,
    fn: (span: any) => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      return await Sentry.startSpan(
        {
          name: context.name,
          op: context.op,
          attributes: context.data || {}
        },
        async (span) => {
          const result = await fn(span);
          const duration = Date.now() - startTime;
          span?.setAttribute("duration_ms", duration);
          return result;
        }
      );
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: {
          op: context.op,
          name: context.name,
          metadata: context.data
        }
      });
      throw error;
    }
  }

  /**
   * Captures LLM prompt and completion token statistics.
   */
  public recordTokenMetrics(params: {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
  }) {
    Sentry.setMeasurement("llm.prompt_tokens", params.promptTokens, "none");
    Sentry.setMeasurement("llm.completion_tokens", params.completionTokens, "none");
    Sentry.setMeasurement("llm.total_tokens", params.totalTokens, "none");
    Sentry.setMeasurement("llm.latency_ms", params.latencyMs, "millisecond");

    Sentry.addBreadcrumb({
      category: "ai.inference",
      message: `Completed ${params.model} generation in ${params.latencyMs}ms (${params.totalTokens} tokens)`,
      level: "info",
      data: params
    });
  }

  /**
   * Records tool call execution telemetry.
   */
  public recordToolCall(toolName: string, status: "success" | "failure", durationMs: number) {
    Sentry.addBreadcrumb({
      category: "ai.tool",
      message: `Tool [${toolName}] finished with status: ${status}`,
      level: status === "success" ? "info" : "error",
      data: { toolName, status, durationMs }
    });
  }
}

export const telemetry = AgentTelemetry.getInstance();
