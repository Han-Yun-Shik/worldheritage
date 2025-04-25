"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { REGDATE_STR, WR_STATE_ARR, getStateButtonClass } from "@/app/utils";
import { useSearchParams } from "next/navigation";

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
    const [shopnm, setShopnm] = useState("");
    const [name, setName] = useState("");
    const [state, setState] = useState("");
    const [tourdate, setTourdate] = useState("");

    // 페이징 상태
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(2); // 1페이지 2개

    // 현재 페이지 기준으로 데이터 잘라서 표시
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // ✅ 서버에서 받은 totalCount로 페이지 수 계산
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // ✅ 전체 페이지 버튼 생성
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const searchParams = useSearchParams();

    useEffect(() => {
        fetchData({
            shopnm,
            name,
            state,
            tourdate,
            page: currentPage
        });
    }, [currentPage]); // ✅ currentPage 변경될 때마다 fetchData 실행


    const fetchData = async (searchParamsObj?: {
        shopnm?: string;
        name?: string;
        state?: string;
        tourdate?: string;
        page?: number;
    }) => {
        try {
            const params = new URLSearchParams();

            const page = searchParamsObj?.page || currentPage;

            if (searchParamsObj?.shopnm) params.append("wr_shopnm", searchParamsObj.shopnm);
            if (searchParamsObj?.name) params.append("wr_name", searchParamsObj.name);
            if (searchParamsObj?.state) params.append("wr_state", searchParamsObj.state);
            if (searchParamsObj?.tourdate) params.append("wr_tourdate", searchParamsObj.tourdate);
            params.append("page", page.toString());
            params.append("limit", itemsPerPage.toString());

            const res = await axios.get(`/api/wdm/rsvlist?${params.toString()}`);

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

    console.log(data)

    useEffect(() => {
        const shopnm = searchParams.get("shopnm") || "";
        const name = searchParams.get("name") || "";
        const state = searchParams.get("state") || "";
        const tourdate = searchParams.get("tourdate") || "";
        const currentPageQuery = parseInt(searchParams.get("currentPage") || "1", 10);

        setShopnm(shopnm);
        setName(name);
        setState(state);
        setTourdate(tourdate);
        setCurrentPage(currentPageQuery);

        fetchData({ shopnm, name, state, tourdate, page: currentPageQuery });
    }, []);

    const handleSearch = () => {
        setCurrentPage(1); // 검색은 항상 1페이지부터
        fetchData({
            shopnm,
            name,
            state,
            tourdate,
            page: 1
        });
    };

    const handleReset = () => {
        setShopnm("");
        setName("");
        setState("");
        setTourdate("");
        setCurrentPage(1); // 검색은 항상 1페이지부터
        fetchData({
            shopnm: "",
            name: "",
            state: "",
            tourdate: "",
            page: 1
        });
    };


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
                    <button onClick={handleSearch} className="btn btn-secondary">검색</button>&nbsp;
                    <button onClick={handleReset} className="btn btn-secondary">초기화</button>
                </div>
            </div>

            {/* 검색영역 s */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* 날짜 */}
                    <div>
                        <label htmlFor="tourdate" className="block text-sm font-medium text-gray-700 mb-1">
                            날짜
                        </label>
                        <input
                            type="text"
                            id="tourdate"
                            value={tourdate}
                            onChange={(e) => setTourdate(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="YYYY-MM-DD"
                        />
                    </div>

                    {/* 상품명 */}
                    <div>
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

                    {/* 이름 */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            이름
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="이름 입력"
                        />
                    </div>

                    {/* 결제상태 */}
                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                            결제상태
                        </label>
                        <select
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">결제상태 선택</option>
                            {Object.entries(WR_STATE_ARR).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 검색영역 e */}

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
                        <th style={{ textAlign: "center", width: "150px", fontWeight: "400" }}>진행상태</th>
                        <th style={{ textAlign: "center", width: "100px", fontWeight: "400" }}>등록일</th>
                        <th style={{ textAlign: "center", width: "200px", fontWeight: "400" }}>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.wr_seq}>
                            <td style={{ textAlign: "center" }}>{totalCount - ((currentPage - 1) * itemsPerPage + index)}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_tourdate}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_shopnm}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_optnm}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_name}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_tel}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_totinwon.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>{item.wr_totprice.toLocaleString()}</td>
                            <td style={{ textAlign: "center" }}>
                                <button
                                    className={`px-2 py-1 text-sm font-medium rounded ${getStateButtonClass(item.wr_state)}`}
                                >
                                    {WR_STATE_ARR[item.wr_state] || "알수없음"}
                                </button>
                            </td>
                            <td style={{ textAlign: "center" }}>{REGDATE_STR(item.wr_regdate)}</td>
                            <td style={{ textAlign: "center" }}>
                                <Link
                                    href={{
                                        pathname: `/wdm/rsvupdate/${item.wr_code}`,
                                        query: {
                                            shopnm,
                                            name,
                                            state,
                                            tourdate,
                                            currentPage: currentPage.toString(), // 페이지 정보도 포함
                                        },
                                    }}
                                    className="btn btn-sm btn-primary mx-2"
                                >
                                    수정
                                </Link>

                                <button onClick={() => handleDelete(item.wr_code)} className="btn btn-sm btn-danger">삭제</button>
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
