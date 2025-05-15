"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import Link from "next/link";
import { REGDATE_STR, WR_STATE_ARR, getStateButtonClass } from "@/app/utils";
import { useSearchParams, useRouter } from "next/navigation";

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
  wr_loginox: string;
}

export default function Rsvlist() {
  const router = useRouter();
  const [data, setData] = useState<RsvData[]>([]);
  const [shopnm, setShopnm] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [tourdate, setTourdate] = useState("");

  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
    }
  };

  const updateUrl = (newParams: URLSearchParams) => {
    router.replace(`/wdm/rsvlist?${newParams.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (shopnm) params.append("shopnm", shopnm);
    if (name) params.append("name", name);
    if (state) params.append("state", state);
    if (tourdate) params.append("tourdate", tourdate);
    params.append("currentPage", "1");

    updateUrl(params);
  };

  const handleReset = () => {
    router.replace("/wdm/rsvlist");
    setShopnm("");
    setName("");
    setState("");
    setTourdate("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (shopnm) params.append("shopnm", shopnm);
    if (name) params.append("name", name);
    if (state) params.append("state", state);
    if (tourdate) params.append("tourdate", tourdate);
    params.append("currentPage", page.toString());

    updateUrl(params);
  };

  const handleDelete = async (wr_code?: string) => {
    if (!wr_code) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await axios.delete(`/api/wdm/rsvdelete?id=${wr_code}`);
      if (res.status === 200) {
        alert("삭제되었습니다.");
        setData(prev => prev.filter(item => item.wr_code !== wr_code));
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
      {/* Suspense로 SearchParamsFetcher 감싸기 */}
      <Suspense fallback={<div>Loading SearchParams...</div>}>
        <SearchParamsFetcher
          setShopnm={setShopnm}
          setName={setName}
          setState={setState}
          setTourdate={setTourdate}
          setCurrentPage={setCurrentPage}
          fetchData={fetchData}
        />
      </Suspense>

      <div className="w_con_navi_wrap">
        <div className="w_con_title">예약 관리</div>
        <div style={{ textAlign: "right" }}>
          <button onClick={handleSearch} className="btn btn-secondary">검색</button>&nbsp;
          <button onClick={handleReset} className="btn btn-secondary">초기화</button>
        </div>
      </div>

      {/* 검색 영역 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="bg-white rounded-xl shadow p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="tourdate" className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
            <input
              type="text"
              id="tourdate"
              value={tourdate}
              onChange={(e) => setTourdate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div>
            <label htmlFor="shopnm" className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
            <input
              type="text"
              id="shopnm"
              value={shopnm}
              onChange={(e) => setShopnm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="상품명 입력"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="이름 입력"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">결제상태</label>
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
      </form>

      {/* 테이블 */}
      <table className="table">
        <thead className="table-secondary">
          <tr>
            <th style={{ textAlign: "center" }}>번호</th>
            <th style={{ textAlign: "center" }}>여행일</th>
            <th style={{ textAlign: "center" }}>상품명</th>
            <th style={{ textAlign: "center" }}>옵션명</th>
            <th style={{ textAlign: "center" }}>이름</th>
            <th style={{ textAlign: "center" }}>연락처</th>
            <th style={{ textAlign: "center" }}>총인원</th>
            <th style={{ textAlign: "center" }}>결제금액</th>
            <th style={{ textAlign: "center" }}>진행상태</th>
            <th style={{ textAlign: "center" }}>등록일</th>
            <th style={{ textAlign: "center" }}>대리자</th>
            <th style={{ textAlign: "center" }}>관리</th>
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
                <button className={`px-2 py-1 text-sm font-medium rounded ${getStateButtonClass(item.wr_state)}`}>
                  {WR_STATE_ARR[item.wr_state] || "알수없음"}
                </button>
              </td>
              <td style={{ textAlign: "center" }}>{REGDATE_STR(item.wr_regdate)}</td>
              <td style={{ textAlign: "center" }}>{item.wr_loginox}</td>
              <td style={{ textAlign: "center" }}>
                <Link
                  href={{
                    pathname: `/wdm/rsvupdate/${item.wr_code}`,
                    query: {
                      shopnm,
                      name,
                      state,
                      tourdate,
                      currentPage: currentPage.toString(),
                    },
                  }}
                  className="btn btn-sm btn-primary mx-2"
                >
                  수정
                </Link>
                <button onClick={() => handleDelete(item.wr_code)} className="btn btn-sm btn-danger">
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
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 text-sm border rounded ${currentPage === page ? "bg-blue-500 text-white" : ""}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}

function SearchParamsFetcher({ setShopnm, setName, setState, setTourdate, setCurrentPage, fetchData }: any) {
  const searchParams = useSearchParams();

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
  }, [searchParams]);

  return null;
}
