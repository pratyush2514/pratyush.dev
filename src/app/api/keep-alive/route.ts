import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://nqysiprpmxxombsdvdkh.supabase.co/storage/v1/object/public/portfolio/PratyushRastogiResume.pdf",
      {
        method: "HEAD",
        cache: "no-store",
      }
    );

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
      },
      { status: 500 }
    );
  }
}
