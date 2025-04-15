import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const wr_shopcode = searchParams.get("wr_shopcode");

    console.log("param: ", year, month, wr_shopcode)

    if (!year || !month || !wr_shopcode) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        const res = await axios.get(`${API_BASE_URL}/api/getcalendarrsvtotalinwon`, {
            params: { year, month, wr_shopcode },
        });
        return NextResponse.json(res.data);
    } catch (error) {
        return NextResponse.json({ error: "getcalendarrsvtotalinwon데이터 요청 실패" }, { status: 500 });
    }
}