"use client";

import { useEffect, useState } from "react";
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
    shopargs?: ShopData[];  // ✅ 배열로 선언
}

export default function Slist() {
    const [data, setData] = useState<OptData[]>([]);
    const [shopData, setShopData] = useState<ShopData[]>([]);
    const [loading, setLoading] = useState(true);
    const [shopcode, setShopcode] = useState("");

    // 페이징 상태
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // 1페이지 5개

    // 현재 페이지 기준으로 데이터 잘라서 표시
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // ✅ 서버에서 받은 totalCount로 페이지 수 계산
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // ✅ 전체 페이지 버튼 생성
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const searchParams = useSearchParams();

    // ashop 데이터 가져오기
    const fetchShopData = async () => {
        try {
            const res = await axios.get("/api/wdm/getashop");
            if (Array.isArray(res.data)) {
                setShopData(res.data);
            } else {
                console.error("데이터 형식이 올바르지 않습니다:", res.data);
            }
        } catch (error) {
            console.error("데이터 불러오기 오류:", error);
        }
    };
    useEffect(() => {
        fetchShopData();
    }, []);

    useEffect(() => {
        fetchData({
            shopcode,
            page: currentPage
        });
    }, [currentPage]); // ✅ currentPage 변경될 때마다 fetchData 실행

    useEffect(() => {
        const shopcode = searchParams.get("shopcode") || "";
        const currentPageQuery = parseInt(searchParams.get("currentPage") || "1", 10);
    
        setShopcode(shopcode);
        setCurrentPage(currentPageQuery);
    
        fetchData({ shopcode, page: currentPageQuery });
    }, [searchParams]); // ✅ 반드시 searchParams가 바뀔 때마다 재호출
    

    const fetchData = async (searchParamsObj?: {
        shopcode?: string;
        page?: number;
    }) => {
        try {
            const params = new URLSearchParams();

            const page = searchParamsObj?.page || currentPage;

            if (searchParamsObj?.shopcode) params.append("wr_shopcode", searchParamsObj.shopcode);
            params.append("page", page.toString());
            params.append("limit", itemsPerPage.toString());

            const res = await axios.get(`/api/wdm/optlist?${params.toString()}`);

            if (res.data && Array.isArray(res.data.data)) {
                setData(res.data.data);
                setTotalCount(res.data.total);
            } else {
                console.error("응답 형식이 올바르지 않습니다:", res.data);
            }
        } catch (error) {
            console.error("데이터 불러오기 오류:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const shopcode = searchParams.get("shopcode") || "";
        const currentPageQuery = parseInt(searchParams.get("currentPage") || "1", 10);

        setShopcode(shopcode);
        setCurrentPage(currentPageQuery);

        fetchData({ shopcode, page: currentPageQuery });
    }, []);

    const handleSearch = () => {
        setCurrentPage(1); // 검색은 항상 1페이지부터
        fetchData({
            shopcode,
            page: 1
        });
    };

    const handleReset = () => {
        setCurrentPage(1); // 검색은 항상 1페이지부터
        setShopcode("");
        fetchData({
            shopcode: "",
            page: 1
        });
    };

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
                    <Link href="/wdm/optwrite" className="btn btn-secondary">등록</Link>&nbsp;
                    <button onClick={handleSearch} className="btn btn-secondary">검색</button>&nbsp;
                    <button onClick={handleReset} className="btn btn-secondary">초기화</button>
                </div>
            </div>

            {/* 검색영역 s */}
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
            {/* 검색영역 e */}

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
                            <td style={{ textAlign: "left" }}>
                                {item.shopargs?.[0]?.wr_shopnm || "정보 없음"}
                            </td>
                            <td style={{ textAlign: "center" }}>{item.wr_optnm}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_inwon.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link
                                    href={{
                                        pathname: `/wdm/optupdate/${item.wr_optcode}`,
                                        query: {
                                            shopcode,
                                            currentPage: currentPage.toString(), // 페이지 정보도 포함
                                        },
                                    }}
                                    className="btn btn-sm btn-primary mx-2"
                                >
                                    수정
                                </Link>
                                <button onClick={() => handleDelete(item.wr_optcode)} className="btn btn-sm btn-danger">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 페이징 영역 s */}
            <div className="mt-6 flex justify-center items-center gap-2">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                    이전
                </button>

                {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm border rounded ${currentPage === page ? "bg-blue-500 text-white" : ""
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalCount / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                    다음
                </button>
            </div>
            {/* 페이징 영역 e */}
        </div>
    );
}
