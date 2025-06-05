import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    const aiResponse = await fetch(`${process.env.AI_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.json();
      return NextResponse.json(
        { error: errorBody },
        { status: aiResponse.status }
      );
    }

    const aiResult = await aiResponse.json();
    return NextResponse.json(aiResult, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}