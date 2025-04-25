import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.search; // ?wr_shopcode=...
    const fullUrl = `${API_BASE_URL}/api/optlist${query}`;

    console.log("[proxy] 요청 URL:", fullUrl);

    const res = await axios.get(fullUrl);
    return NextResponse.json(res.data);
  } catch (error) {
    console.error("API 프록시 오류:", error);
    return NextResponse.json({ error: "데이터 요청 실패" }, { status: 500 });
  }
}