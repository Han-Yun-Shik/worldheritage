import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function PUT(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const wr_optcode = searchParams.get("id");

        if (!wr_optcode) {
            return NextResponse.json({ error: "ID 누락" }, { status: 400 });
        }

        const formData = await req.formData();
        console.log("전송 데이터:", formData); // ✅ 데이터 확인 로그 추가

        const data = new FormData();
        formData.forEach((value, key) => {
            data.append(key, value);
        });

        // ✅ 경로 수정 ("/api/supdate"와 wr_shopcode 사이에 `/` 추가)
        const res = await axios.put(`${API_BASE_URL}/api/optupdate/${wr_optcode}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return NextResponse.json(res.data);
    } catch (error) {
        console.error("API 요청 오류:", error);
        return NextResponse.json({ error: "데이터 전송 실패" }, { status: 500 });
    }
}