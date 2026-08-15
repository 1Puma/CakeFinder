import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message:
      "Instagram connects only for a decorator who opts in with their own business account. Discovery of other people's posts is not available.",
  });
}
