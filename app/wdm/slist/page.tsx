"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  wr_maxinwon: number;
  aoptinwon: number;
  wr_regdate: string;
  files: FileData[];
}

export default function Slist() {
  const [data, setData] = useState<ShopData[]>([]);
  const [shopnm, setShopnm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const fetchData = async (searchParamsObj?: { shopnm?: string; page?: number }) => {
    try {
      const params = new URLSearchParams();
      const page = searchParamsObj?.page || currentPage;

      if (searchParamsObj?.shopnm) params.append("wr_shopnm", searchParamsObj.shopnm);
      params.append("page", page.toString());
      params.append("limit", itemsPerPage.toString());

      const res = await axios.get(`/api/wdm/slist?${params.toString()}`);
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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData({ shopnm, page: 1 });
  };

  const handleReset = () => {
    setShopnm("");
    setCurrentPage(1);
    fetchData({ shopnm: "", page: 1 });
  };

  const handleDelete = async (wr_shopcode?: string) => {
    if (!wr_shopcode) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await axios.delete(`/api/wdm/sdelete?id=${wr_shopcode}`);
      if (res.status === 200) {
        alert("삭제되었습니다.");
        setData(prev => prev.filter(item => item.wr_shopcode !== wr_shopcode));
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
      {/* ✨ Suspense로 SearchParamsFetcher 감싸기 */}
      <Suspense fallback={<div>Loading SearchParams...</div>}>
        <SearchParamsFetcher
          setShopnm={setShopnm}
          setCurrentPage={setCurrentPage}
          fetchData={fetchData}
        />
      </Suspense>

      <div className="w_con_navi_wrap">
        <div className="w_con_title">여행상품 목록</div>
        <div style={{ textAlign: "right" }}>
          <Link href="/wdm/swrite" className="btn btn-secondary">등록</Link>&nbsp;
          <button onClick={handleSearch} className="btn btn-secondary">검색</button>&nbsp;
          <button onClick={handleReset} className="btn btn-secondary">초기화</button>
        </div>
      </div>

      {/* 검색 영역 */}
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

      {/* 테이블 */}
      <table className="table">
        <thead className="table-secondary">
          <tr>
            <th style={{ textAlign: "center", width: "70px" }}>번호</th>
            <th style={{ textAlign: "center", width: "100px" }}>이미지</th>
            <th style={{ textAlign: "center" }}>상품명</th>
            <th style={{ textAlign: "center", width: "150px" }}>신청인원</th>
            <th style={{ textAlign: "center", width: "150px" }}>총인원</th>
            <th style={{ textAlign: "center", width: "150px" }}>금액</th>
            <th style={{ textAlign: "center", width: "150px" }}>등록일</th>
            <th style={{ textAlign: "center", width: "200px" }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.wr_seq}>
              <td style={{ textAlign: "center" }}>
                {totalCount - ((currentPage - 1) * itemsPerPage + index)}
              </td>
              <td style={{ textAlign: "center" }}>
                {item.files.length > 0 ? (
                  (() => {
                    const imageUrl = encodeURIComponent(`${API_BASE_URL}${item.files[0].file_path}`);
                    return (
                      <img
                        src={`/api/wdm/image-proxy?url=${imageUrl}`}
                        alt="Gallery Image"
                        style={{ width: "50px", height: "50px", display: "block", margin: "0 auto" }}
                      />
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
                      currentPage: currentPage.toString(),
                    },
                  }}
                  className="btn btn-sm btn-primary mx-2"
                >
                  수정/상세
                </Link>
                <button
                  onClick={() => handleDelete(item.wr_shopcode)}
                  className="btn btn-sm btn-danger"
                >
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
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 text-sm border rounded ${
              currentPage === page ? "bg-blue-500 text-white" : ""
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}

function SearchParamsFetcher({ setShopnm, setCurrentPage, fetchData }: any) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const shopnm = searchParams.get("shopnm") || "";
    const currentPageQuery = parseInt(searchParams.get("currentPage") || "1", 10);

    setShopnm(shopnm);
    setCurrentPage(currentPageQuery);

    fetchData({ shopnm, page: currentPageQuery });
  }, [searchParams]);

  return null;
}
