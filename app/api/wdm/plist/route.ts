import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("전송 데이터:", body);

        const res = await axios.post(`${API_BASE_URL}/api/plist`, body, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return NextResponse.json(res.data);
    } catch (error) {
        console.error("API 요청 오류:", error);
        return NextResponse.json({ error: "데이터 전송 실패" }, { status: 500 });
    }
}