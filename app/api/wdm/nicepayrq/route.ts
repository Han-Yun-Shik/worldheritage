import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: Request) {
    const url = new URL(req.url);
    const amt = url.searchParams.get("amt");
    const goodsName = url.searchParams.get("goodsName");
    const moid = url.searchParams.get("moid");
    const buyerName = url.searchParams.get("buyerName");
    const buyerEmail = url.searchParams.get("buyerEmail");
    const buyerTel = url.searchParams.get("buyerTel");

    try {
        const res = await axios.get(`${API_BASE_URL}/payment`, {
            params: {
                amt,
                goodsName,
                moid,
                buyerName,
                buyerEmail,
                buyerTel,
            },
            responseType: 'text', // 나이스페이 HTML을 그대로 반환
        });

        return new NextResponse(res.data, {
            headers: {
                "Content-Type": "text/html; charset=utf-8"
            }
        });
    } catch (error) {
        console.error("서버 오류:", error);
        return NextResponse.json({ error: "데이터 요청 실패" }, { status: 500 });
    }
}
