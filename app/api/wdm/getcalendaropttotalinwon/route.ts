import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const wr_shopcode = searchParams.get("wr_shopcode");

    console.log("getcalendaropttotalinwonparam: ", wr_shopcode)

    if (!wr_shopcode) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        const res = await axios.get(`${API_BASE_URL}/api/getcalendaropttotalinwon`, {
            params: { wr_shopcode },
        });
        return NextResponse.json(res.data);
    } catch (error) {
        return NextResponse.json({ error: "getcalendaropttotalinwon 데이터 요청 실패" }, { status: 500 });
    }
}