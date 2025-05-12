// app/api/wdm/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, UserSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getIronSession<UserSession>(req, new NextResponse(), sessionOptions);

  if (session?.wr_id) {
    return NextResponse.json({ isLoggedIn: true, user: session });
  } else {
    return NextResponse.json({ isLoggedIn: false });
  }
}
