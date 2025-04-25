"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { REGDATE_STR } from "@/app/utils";
import { useSearchParams } from "next/navigation";

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
    wr_maxinwon: number;
    aoptinwon: number;
    wr_regdate: string;
    files: FileData[]; // 파일 데이터 배열
}

export default function Slist() {
    const [data, setData] = useState<ShopData[]>([]);
    const [loading, setLoading] = useState(true);
    const [shopnm, setShopnm] = useState("");

    //--########## paging s ##########--//
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
    //--########## paging e ##########--//

    const searchParams = useSearchParams();

    useEffect(() => {
        fetchData({
            shopnm,
            page: currentPage
        });
    }, [currentPage]); // ✅ currentPage 변경될 때마다 fetchData 실행

    useEffect(() => {
        const shopnm = searchParams.get("shopnm") || "";
        const currentPageQuery = parseInt(searchParams.get("currentPage") || "1", 10);
    
        setShopnm(shopnm);
        setCurrentPage(currentPageQuery);
    
        fetchData({ shopnm, page: currentPageQuery });
    }, [searchParams]); // ✅ 반드시 searchParams가 바뀔 때마다 재호출

    const fetchData = async (searchParamsObj?: {
        shopnm?: string;
        page?: number;
    }) => {
        try {
            const params = new URLSearchParams();

            const page = searchParamsObj?.page || currentPage;

            if (searchParamsObj?.shopnm) params.append("wr_shopnm", searchParamsObj.shopnm);
            params.append("page", page.toString());
            params.append("limit", itemsPerPage.toString());

            const res = await axios.get(`/api/wdm/slist?${params.toString()}`);

            console.log("서버 응답 데이터:", res.data);

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
        const shopnm = searchParams.get("shopnm") || "";
        const currentPageQuery = parseInt(searchParams.get("currentPage") || "1", 10);

        setShopnm(shopnm);
        setCurrentPage(currentPageQuery);

        fetchData({ shopnm, page: currentPageQuery });
    }, []);

    const handleSearch = () => {
        setCurrentPage(1); // 검색은 항상 1페이지부터
        fetchData({
            shopnm,
            page: 1
        });
    };

    const handleReset = () => {
        setShopnm("");
        setCurrentPage(1); // 검색은 항상 1페이지부터
        fetchData({
            shopnm: "",
            page: 1
        });
    };
    
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
                    <Link href="/wdm/swrite" className="btn btn-secondary">등록</Link>&nbsp;
                    <button onClick={handleSearch} className="btn btn-secondary">검색</button>&nbsp;
                    <button onClick={handleReset} className="btn btn-secondary">초기화</button>
                </div>
            </div>

            {/* 검색영역 s */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <label htmlFor="shopnm" className="block text-sm font-medium text-gray-700 mb-1">
                    상품명
                </label>
                <input
                    type="text"
                    id="shopnm"
                    value={shopnm}
                    onChange={(e) => setShopnm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="상품명 입력"
                />
            </div>
            {/* 검색영역 e */}


            <table className="table">
                {/* 헤더 */}
                <thead className="table-secondary">
                    <tr>
                        <th style={{ textAlign: "center", width: "70px", fontWeight: "400" }}>번호</th>
                        <th style={{ textAlign: "center", width: "100px", fontWeight: "400" }}>이미지</th>
                        <th style={{ textAlign: "center", fontWeight: "400" }}>상품명</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>신청인원</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>총인원</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>금액</th>
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>등록일</th>
                        <th style={{ textAlign: "center", width: "200px", fontWeight: "400" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.wr_seq}>
                            <td style={{ textAlign: "center" }}>{totalCount - ((currentPage - 1) * itemsPerPage + index)}</td>
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
                            <td style={{ textAlign: "center" }}>{item.wr_maxinwon.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>{item.aoptinwon.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_price.toLocaleString()}원</td>
                            <td style={{ textAlign: "center" }}>{REGDATE_STR(item.wr_regdate)}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link
                                    href={{
                                        pathname: `/wdm/supdate/${item.wr_shopcode}`,
                                        query: {
                                            shopnm,
                                            currentPage: currentPage.toString(), // 페이지 정보도 포함
                                        },
                                    }}
                                    className="btn btn-sm btn-primary mx-2"
                                >
                                    수정/상세
                                </Link>
                                <button onClick={() => handleDelete(item.wr_shopcode)} className="btn btn-sm btn-danger">삭제</button>
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
