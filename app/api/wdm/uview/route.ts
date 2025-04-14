import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // JSON 데이터 읽기
    const { rsvymd, shopcode, optcode, rsvinwon } = body;

    console.log("body: ", body)

    return NextResponse.json({ rsvymd, shopcode, optcode, rsvinwon }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error processing request" }, { status: 500 });
  }
}

// GET 요청 막기 (선택 사항)
export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}