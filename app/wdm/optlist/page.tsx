"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface ShopData {
    wr_shopcode: string;
    wr_shopnm: string;
}

interface OptData {
    wr_seq: number;
    wr_shopcode: string;
    wr_optcode: string;
    wr_optnm: string;
    wr_inwon: number;
    shopargs?: ShopData | null; // 단일 객체로 변경
}

export default function Slist() {
    const [data, setData] = useState<OptData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get("/api/wdm/optlist");
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

    console.log(data)

    const handleDelete = async (wr_optcode?: string) => {
        if (!wr_optcode) return;
        
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
        try {
            const res = await axios.delete(`/api/wdm/optdelete?id=${wr_optcode}`);
            if (res.status === 200) {
                alert("삭제되었습니다.");
                setData(prevData => prevData.filter(item => item.wr_optcode !== wr_optcode)); // 화면에서 즉시 제거
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
                <div className="w_con_title">옵션 목록</div>
                <div style={{ textAlign: "right" }}>
                    <Link href="/wdm/optwrite" className="btn btn-secondary">등록</Link>
                </div>
            </div>

            <table className="table">
                <thead className="table-secondary">
                    <tr>
                        <th style={{ textAlign: "center", width: "70px", fontWeight: "400" }}>번호</th>
                        <th style={{ textAlign: "center", fontWeight: "400" }}>상품명</th>
                        <th style={{ textAlign: "center", width: "250px", fontWeight: "400" }}>옵션명</th>
                        <th style={{ textAlign: "center", width: "70px", fontWeight: "400" }}>인원</th>
                        <th style={{ textAlign: "center", width: "200px", fontWeight: "400" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.wr_seq}>
                            <td style={{ textAlign: "center" }}>{item.wr_seq}</td>
                            <td style={{ textAlign: "left" }}>
                                {item.shopargs ? item.shopargs.wr_shopnm : "정보 없음"}
                            </td>
                            <td style={{ textAlign: "center" }}>{item.wr_optnm}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_inwon.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link href={`/wdm/optupdate/${item.wr_optcode}`} className="btn btn-sm btn-primary mx-2">
                                    Edit
                                </Link>
                                <button onClick={() => handleDelete(item.wr_optcode)} className="btn btn-sm btn-danger">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
