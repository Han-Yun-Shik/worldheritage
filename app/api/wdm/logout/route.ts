import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, UserSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = new NextResponse(); // ✅ 응답 객체 생성
  const session = await getIronSession<UserSession>(req, res, sessionOptions);
  await session.destroy();        // ✅ 세션 제거
  return res;                     // ✅ 응답으로 반환해야 쿠키 삭제됨
}

