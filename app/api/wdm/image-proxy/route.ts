import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const imageUrl = req.nextUrl.searchParams.get("url");
    if (!imageUrl) {
        return NextResponse.json({ error: "이미지 URL이 필요합니다." }, { status: 400 });
    }

    try {
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "이미지를 불러오는 데 실패했습니다." }, { status: 500 });
    }
}
