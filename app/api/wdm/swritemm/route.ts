import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        console.log("전송 데이터:", formData); 

        const data = new FormData();
        formData.forEach((value, key) => {
            if (value instanceof Blob) {
                data.append(key, value, value.name); // 파일일 경우 파일명 포함
            } else {
                data.append(key, value as string);
            }
        });

        const res = await axios.post(`${API_BASE_URL}/api/swritemm`, data, {
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
