"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { REGDATE_STR } from "@/app/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


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

export default function Slist() {
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
            <div className="w_con_navi_wrap">
                <div className="w_con_title">여행상품 목록</div>
                <div style={{ textAlign: "right" }}>
                    <Link href="/wdm/swrite" className="btn btn-secondary">등록</Link>
                </div>
            </div>


            <table className="table">
                {/* 헤더 */}
                <thead className="table-secondary">
                    <tr>
                        <th style={{ textAlign: "center", width: "70px", fontWeight: "400" }}>번호</th>
                        <th style={{ textAlign: "center", width: "100px", fontWeight: "400" }}>이미지</th>
                        <th style={{ textAlign: "center", fontWeight: "400" }}>상품명</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>금액</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>등록일</th>
                        <th style={{ textAlign: "center", width: "200px", fontWeight: "400" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.wr_seq}>
                            <td style={{ textAlign: "center" }}>{item.wr_seq}</td>
                            <td style={{ textAlign: "center" }}>
                                {item.files.length > 0 ? (

                                    (() => {
                                        const imageUrl = encodeURIComponent(`${API_BASE_URL}${item.files[0].file_path}`);
                                        return (
                                            <img src={`/api/wdm/image-proxy?url=${imageUrl}`} alt="Gallery Image" style={{ width: "50px", height: "50px", display: "block", margin: "0 auto" }} />
                                        );
                                    })()

                                ) : (
                                "이미지 없음"
                                )}

                            </td>
                            <td style={{ textAlign: "left" }}>{item.wr_shopnm}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_price.toLocaleString()}원</td>
                            <td style={{ textAlign: "center" }}>{REGDATE_STR(item.wr_regdate)}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link href={`/wdm/supdate/${item.wr_shopcode}`} className="btn btn-sm btn-primary mx-2">
                                    수정/상세
                                </Link>
                                <button onClick={() => handleDelete(item.wr_shopcode)} className="btn btn-sm btn-danger">삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
