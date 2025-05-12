import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const wr_id = searchParams.get("id");

        if (!wr_id) {
            return NextResponse.json({ error: "ID 누락" }, { status: 400 });
        }

        const res = await axios.get(`${API_BASE_URL}/api/memread/${wr_id}`);
        return NextResponse.json(res.data);
    } catch (error) {
        console.error("API 요청 오류:", error);
        return NextResponse.json({ error: "데이터 요청 실패" }, { status: 500 });
    }
}