import { NextResponse } from "next/server";
import { getMuapiPredictionResult } from "@/lib/muapi";

export async function GET(_request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const result = await getMuapiPredictionResult(requestId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "MUAPI result request failed." },
      { status: 500 }
    );
  }
}
