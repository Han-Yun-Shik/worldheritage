import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const session_code = searchParams.get("id");

        if (!session_code) {
            return NextResponse.json({ error: "session_code 누락" }, { status: 400 });
        }

        const { data } = await axios.delete(`${API_BASE_URL}/api/rsvtmpdelete/${session_code}`);
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("삭제 요청 실패:", error.response?.data || error.message);
        return NextResponse.json({ error: "서버 삭제 실패" }, { status: 500 });
    }
}
