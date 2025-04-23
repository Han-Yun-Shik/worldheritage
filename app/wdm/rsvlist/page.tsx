"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { REGDATE_STR, WR_STATE_ARR } from "@/app/utils";

interface RsvData {
    wr_seq: number;
    wr_code: string;
    wr_tourdate: string;
    wr_shopnm: string;
    wr_optnm: string;
    wr_name: string;
    wr_tel: string;
    wr_totinwon: number;
    wr_totprice: number;
    wr_state: number;
    wr_regdate: string;
}

export default function Rsvlist() {
    const [data, setData] = useState<RsvData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get("/api/wdm/rsvlist");
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

    const handleDelete = async (wr_code?: string) => {
        if (!wr_code) return;
        
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
        try {
            const res = await axios.delete(`/api/wdm/rsvdelete?id=${wr_code}`);
            if (res.status === 200) {
                alert("삭제되었습니다.");
                setData(prevData => prevData.filter(item => item.wr_code !== wr_code)); // 화면에서 즉시 제거
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
                <div className="w_con_title">예약 관리</div>
                <div style={{ textAlign: "right" }}>
                    <Link href="" className="btn btn-secondary">검색</Link>
                </div>
            </div>

            <table className="table">
                <thead className="table-secondary">
                    <tr>
                        <th style={{ textAlign: "center", width: "70px", fontWeight: "400" }}>번호</th>
                        <th style={{ textAlign: "center", width: "120px", fontWeight: "400" }}>여행일</th>
                        <th style={{ textAlign: "center", fontWeight: "400" }}>상품명</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>옵션명</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>이름</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>연락처</th>
                        <th style={{ textAlign: "center", width: "70px", fontWeight: "400" }}>총인원</th>
                        <th style={{ textAlign: "center", width: "100px", fontWeight: "400" }}>결제금액</th>
                        <th style={{ textAlign: "center", width: "100px", fontWeight: "400" }}>진행상태</th>
                        <th style={{ textAlign: "center", width: "100px", fontWeight: "400" }}>등록일</th>
                        <th style={{ textAlign: "center", width: "200px", fontWeight: "400" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item.wr_seq}>
                            <td style={{ textAlign: "center" }}>{item.wr_seq}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_tourdate}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_shopnm}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_optnm}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_name}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_tel}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_totinwon.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_totprice.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>{WR_STATE_ARR[item.wr_state]}</td>
                            <td style={{ textAlign: "center" }}>{REGDATE_STR(item.wr_regdate)}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link href={`/wdm/rsvupdate/${item.wr_code}`} className="btn btn-sm btn-primary mx-2">
                                    수정
                                </Link>
                                <button onClick={() => handleDelete(item.wr_code)} className="btn btn-sm btn-danger">삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
