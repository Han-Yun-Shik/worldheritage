import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const wr_tourdate = searchParams.get("wr_tourdate");
    const wr_shopcode = searchParams.get("wr_shopcode");
    const wr_optcode = searchParams.get("wr_optcode");

    //console.log("param: ", wr_tourdate, wr_optcode)

    if (!wr_tourdate || !wr_shopcode || !wr_optcode) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        const res = await axios.get(`${API_BASE_URL}/api/getdaytotalinwon`, {
            params: { wr_tourdate, wr_shopcode, wr_optcode },
        });
        return NextResponse.json(res.data);
    } catch (error) {
        return NextResponse.json({ error: "데이터 요청 실패" }, { status: 500 });
    }
}