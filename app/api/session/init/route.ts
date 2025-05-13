import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const res = new NextResponse(); // 초기 응답 (쿠키 저장용)
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.session_id) {
    session.session_id = uuidv4();
    await session.save(); // 쿠키 저장됨
  }

  // 새 응답 객체에 저장된 쿠키 헤더 포함
  return new NextResponse(
    JSON.stringify({ session_id: session.session_id }),
    {
      status: 200,
      headers: res.headers, // 기존 헤더 복사 (쿠키 포함)
    }
  );
}
