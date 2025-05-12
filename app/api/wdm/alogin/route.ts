import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, UserSession } from "@/lib/session";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { wr_id, wr_pw } = body;

  const loginRes = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/alogin`, {
    wr_id,
    wr_pw,
  });

  if (!loginRes.data.success) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const user = loginRes.data.user;

  const res = NextResponse.json({ success: true });
  const session = await getIronSession<UserSession>(req, res, sessionOptions);
  session.wr_id = user.wr_id;
  session.wr_name = user.wr_name;
  await session.save();

  return res;
}
