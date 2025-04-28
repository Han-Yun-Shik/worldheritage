"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
    shopargs?: ShopData[];
}

export default function Slist() {
    const [data, setData] = useState<OptData[]>([]);
    const [shopData, setShopData] = useState<ShopData[]>([]);
    const [shopcode, setShopcode] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // ✅ 이걸로 통합
    const fetchAllData = async (shopcode: string, page: number) => {
        try {
            // ashop 데이터
            const shopRes = await axios.get("/api/wdm/getashop");
            if (Array.isArray(shopRes.data)) {
                setShopData(shopRes.data);
            } else {
                console.error("ashop 데이터 오류:", shopRes.data);
            }

            // optlist 데이터
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", itemsPerPage.toString());
            if (shopcode) params.append("wr_shopcode", shopcode);

            const optRes = await axios.get(`/api/wdm/optlist?${params.toString()}`);
            if (optRes.data && Array.isArray(optRes.data.data)) {
                setData(optRes.data.data);
                setTotalCount(optRes.data.total);
            } else {
                console.error("optlist 데이터 오류:", optRes.data);
            }
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchAllData(shopcode, 1);
    };

    const handleReset = () => {
        setShopcode("");
        setCurrentPage(1);
        fetchAllData("", 1);
    };

    const handleDelete = async (wr_optcode?: string) => {
        if (!wr_optcode) return;
        if (!window.confirm("정말 삭제하시겠습니까?")) return;

        try {
            const res = await axios.delete(`/api/wdm/optdelete?id=${wr_optcode}`);
            if (res.status === 200) {
                alert("삭제되었습니다.");
                setData(prev => prev.filter(item => item.wr_optcode !== wr_optcode));
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
            {/* ✅ SearchParamsFetcher는 Suspense 안에서 동작 */}
            <Suspense fallback={<div>Loading SearchParams...</div>}>
                <SearchParamsFetcher
                    setShopcode={setShopcode}
                    setCurrentPage={setCurrentPage}
                    fetchAllData={fetchAllData}
                />
            </Suspense>

            <div className="w_con_navi_wrap">
                <div className="w_con_title">옵션 목록</div>
                <div style={{ textAlign: "right" }}>
                    <Link href="/wdm/optwrite" className="btn btn-secondary">등록</Link>&nbsp;
                    <button onClick={handleSearch} className="btn btn-secondary">검색</button>&nbsp;
                    <button onClick={handleReset} className="btn btn-secondary">초기화</button>
                </div>
            </div>

            {/* 검색 영역 */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <label htmlFor="shopnm" className="block text-sm font-medium text-gray-700 mb-1">
                    상품명
                </label>
                <select
                    id="shopcode"
                    value={shopcode}
                    onChange={(e) => setShopcode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">선택해 주세요</option>
                    {shopData.map((item, index) => (
                        <option key={index} value={item.wr_shopcode}>
                            {item.wr_shopnm}
                        </option>
                    ))}
                </select>
            </div>

            {/* 테이블 */}
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
                    {data.map((item, index) => (
                        <tr key={item.wr_seq}>
                            <td style={{ textAlign: "center" }}>{totalCount - ((currentPage - 1) * itemsPerPage + index)}</td>
                            <td style={{ textAlign: "left" }}>{item.shopargs?.[0]?.wr_shopnm || "정보 없음"}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_optnm}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_inwon.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link
                                    href={{
                                        pathname: `/wdm/optupdate/${item.wr_optcode}`,
                                        query: {
                                            shopcode,
                                            currentPage: currentPage.toString(),
                                        },
                                    }}
                                    className="btn btn-sm btn-primary mx-2"
                                >
                                    수정
                                </Link>
                                <button onClick={() => handleDelete(item.wr_optcode)} className="btn btn-sm btn-danger">
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 페이징 */}
            <div className="mt-6 flex justify-center items-center gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                    이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm border rounded ${currentPage === page ? "bg-blue-500 text-white" : ""}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                    다음
                </button>
            </div>
        </div>
    );
}

// ✨ Suspense 안에서 searchParams 처리하는 컴포넌트
function SearchParamsFetcher({ setShopcode, setCurrentPage, fetchAllData }: any) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const shopcode = searchParams.get("shopcode") || "";
        const currentPageQuery = parseInt(searchParams.get("currentPage") || "1", 10);

        setShopcode(shopcode);
        setCurrentPage(currentPageQuery);
        fetchAllData(shopcode, currentPageQuery);
    }, [searchParams]);

    return null;
}
