import { NextRequest, NextResponse } from "next/server";
import { runStandaloneWorkflow } from "../../../../../workflows/src/worker.js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const repoIdentifier = body.repoIdentifier || "unix-v6-legacy";

    const result = await runStandaloneWorkflow({
      repoIdentifier,
      forceFreshAnalysis: true
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to resurrect repository"
      },
      { status: 500 }
    );
  }
}
