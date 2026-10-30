import { NextRequest, NextResponse } from "next/server";
import { processGitHubWebhook, GitHubWebhookHeaders } from "../../../../../../agent/src/tools/githubWebhookTool.js";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const headers: GitHubWebhookHeaders = {
      "x-github-event": req.headers.get("x-github-event") || undefined,
      "x-github-delivery": req.headers.get("x-github-delivery") || undefined,
      "x-hub-signature-256": req.headers.get("x-hub-signature-256") || undefined,
    };

    const result = await processGitHubWebhook(rawBody, headers);

    if (result.status === "invalid_signature") {
      return NextResponse.json(
        {
          success: false,
          error: result.message
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process GitHub webhook"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "necrolink-github-webhook-receiver",
    status: "listening",
    supportedEvents: ["repository.archived", "issues.labeled", "ping", "simulate_archived"],
    ofrendaEndpoint: "https://ofrenda.necrolink.tech"
  });
}
