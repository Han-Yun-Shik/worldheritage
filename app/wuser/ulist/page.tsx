"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { REGDATE_STR } from "@/app/utils";
import Navi from "@/components/Navi";


interface FileData {
    file_seq: number;
    wr_code: string;
    file_path: string;
}

interface ShopData {
    wr_seq: number;
    wr_shopcode: string;
    wr_shopnm: string;
    wr_intro: string;
    wr_price: number;
    wr_regdate: string;
    files: FileData[]; // 파일 데이터 배열
}

export default function Ulist() {
    const [data, setData] = useState<ShopData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get("/api/wdm/slist");
                if (Array.isArray(res.data)) {
                    setData(res.data);
                } else {
                    console.error("데이터 형식이 올바르지 않습니다:", res.data);
                }
            } catch (error) {
                console.error("데이터 불러오기 오류:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleDelete = async (wr_shopcode?: string) => {
        if (!wr_shopcode) return;
        
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
        try {
            const res = await axios.delete(`/api/wdm/sdelete?id=${wr_shopcode}`);
            if (res.status === 200) {
                alert("삭제되었습니다.");
                setData(prevData => prevData.filter(item => item.wr_shopcode !== wr_shopcode)); // 화면에서 즉시 제거
            } else {
                alert("삭제 실패");
            }
        } catch (error) {
            console.error("삭제 오류:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navi />
            <h1>상품 목록</h1>
            <table className="table">
                {/* 헤더 */}
                <thead className="table-secondary">
                    <tr>
                        <th style={{ textAlign: "center" }}>번호</th>
                        <th style={{ textAlign: "center" }}>이미지</th>
                        <th style={{ textAlign: "center" }}>상품명</th>
                        <th style={{ textAlign: "center" }}>간략소개</th>
                        <th style={{ textAlign: "center" }}>금액</th>
                        <th style={{ textAlign: "center" }}>등록일</th>
                        <th style={{ textAlign: "center" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.wr_seq}>
                            <td style={{ textAlign: "center" }}>{item.wr_seq}</td>
                            <td style={{ textAlign: "center" }}>
                                이미지
                            </td>
                            <td style={{ textAlign: "left" }}>{item.wr_shopnm}</td>
                            <td style={{ textAlign: "left" }}>{item.wr_intro}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_price.toLocaleString()}원</td>
                            <td style={{ textAlign: "center" }}>{REGDATE_STR(item.wr_regdate)}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link href={`/wuser/ucalendar/${item.wr_shopcode}`} className="btn btn-sm btn-primary mx-2">
                                    예약
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
