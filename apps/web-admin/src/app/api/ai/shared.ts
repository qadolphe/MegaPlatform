import { NextResponse } from "next/server";

// Temporary cost-control switch: blocks all Gemini-backed AI endpoints.
const DISABLE_GEMINI_AI = true;

export function getAiDisabledResponse() {
  if (!DISABLE_GEMINI_AI) {
    return null;
  }

  return NextResponse.json(
    {
      error: "AI features are temporarily disabled to prevent Gemini token usage.",
      disabled: true,
    },
    { status: 503 }
  );
}
