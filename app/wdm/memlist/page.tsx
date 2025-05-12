"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { REGDATE_STR } from "@/app/utils";

interface MemData {
    wr_seq: number;
    wr_id: string;
    wr_pw: string;
    wr_name: string;
    wr_level: number;
    wr_regdate: string;
}

export default function Memlist() {
    const [data, setData] = useState<MemData[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get("/api/wdm/memlist");
                if (Array.isArray(res.data)) {
                    setData(res.data);
                } else {
                    console.error("데이터 형식이 올바르지 않습니다:", res.data);
                }
            } catch (error) {
                console.error("데이터 불러오기 오류:", error);
            }
        }
        fetchData();
    }, []);

    const handleDelete = async (wr_id?: string) => {
        if (!wr_id) return;
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            const res = await axios.delete(`/api/wdm/memdelete?id=${wr_id}`);
            if (res.status === 200) {
                alert("삭제되었습니다.");
                setData(prev => prev.filter(item => item.wr_id !== wr_id));
            } else {
                alert("삭제 실패");
            }
        } catch (error) {
            console.error("삭제 오류:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };


    return (
        <div>

            <div className="w_con_navi_wrap">
                <div className="w_con_title">회원관리</div>
                <div style={{ textAlign: "right" }}>
                    <Link href="/wdm/memwrite" className="btn btn-secondary">등록</Link>
                </div>
            </div>

            {/* 테이블 */}
            <table className="table">
                <thead className="table-secondary">
                    <tr>
                        <th style={{ textAlign: "center" }}>아이디</th>
                        <th style={{ textAlign: "center" }}>이름</th>
                        <th style={{ textAlign: "center" }}>레벨</th>
                        <th style={{ textAlign: "center" }}>등록일</th>
                        <th style={{ textAlign: "center" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.wr_seq}>
                            <td style={{ textAlign: "center" }}>{item.wr_id}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_name}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_level.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>{REGDATE_STR(item.wr_regdate)}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link href={`/wdm/memupdate/${item.wr_id}`} className="btn btn-sm btn-primary mx-1">수정</Link>
                                <button onClick={() => handleDelete(item.wr_id)} className="btn btn-sm btn-danger">삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}