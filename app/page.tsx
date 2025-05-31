"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { REGDATE_STR } from "@/app/utils";
import Navi from "@/components/Navi";

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
  files: FileData[];
  aoptinwon: number;
  rsvtotinwon: number;
  wr_ey: string;
  wr_em: string;
  wr_ed: string;
  wr_eh: string;
  wr_ei: string;
  wr_es: string;
  wr_content: string;
  wr_include: string;
  wr_note: string;
}

export default function Home() {
  const [data, setData] = useState<ShopData[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/api/wdm/slistuser");
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

  const isExpired = (item: ShopData): boolean => {
    // 값이 모두 존재하지 않으면 마감 아님(false 반환)
    if (
      !item.wr_ey || !item.wr_em || !item.wr_ed ||
      !item.wr_eh || !item.wr_ei || !item.wr_es
    ) {
      return false;
    }

    const deadline = new Date(
      Number(item.wr_ey),
      Number(item.wr_em) - 1,
      Number(item.wr_ed),
      Number(item.wr_eh),
      Number(item.wr_ei),
      Number(item.wr_es)
    );

    const now = new Date(); //// 한국 브라우저 환경 기준
    return now > deadline;
  };

  const isBeforeOpen = (): boolean => {
    const now = new Date();
    const openDate = new Date("2025-05-02T09:59:59"); // ISO 형식으로 변환
    return now < openDate;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        {/* 스피너 */}
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />

        {/* 텍스트 */}
        <p className="text-xl font-semibold text-gray-600">로딩 중입니다...</p>
      </div>
    );
  }


  return (
    <div>
      <Navi />

      {selectedItem && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }} // ✅ 투명도 직접 설정
          onClick={() => setSelectedItem(null)} // 배경 클릭 시 닫힘
        >
          <div
            className="bg-white p-6 rounded-lg w-[1000px] max-w-[90%] h-[900px] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()} // 내용 클릭 시 배경 클릭 이벤트 방지
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-800"
            >
              &times;
            </button>

            <div className="mb-6">
              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: (selectedItem.wr_content || "").replace(/\n/g, ""),
                }}
              />

            </div>

            <div className="mb-6 px-[30px]">
              <p className="font-semibold mb-1 bg-gray-700 text-white rounded-md px-3 py-1 inline-block">
                상품요약
              </p>
              <p className="text-[17px] text-gray-700 whitespace-pre-wrap">{selectedItem.wr_include}</p>
            </div>

            <div className="px-[30px]">
              <p className="font-semibold mb-1 bg-gray-700 text-white rounded-md px-3 py-1 inline-block">유의사항</p>
              <p className="text-[17px] text-gray-700 whitespace-pre-wrap">{selectedItem.wr_note}</p>
            </div>
          </div>
        </div>
      )}


      <div className="px-4 py-8">
        <div className="max-w-[1400px] mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {data.map((item) => {
            const imageUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_API_BASE_URL}${item.files[0].file_path}`);
            const remaining = (item.aoptinwon || 0) - (item.rsvtotinwon || 0);
            const isFull = remaining === 0;

            const expired = isExpired(item); // 마감 여부 판단

            return (
              <div
                key={item.wr_seq}
                onClick={() => {
                  if (isBeforeOpen()) {
                    alert("오픈전입니다.");
                    return;
                  }

                  if (expired) {
                    alert("마감되었습니다.");
                    return;
                  }

                  router.push(`/wuser/ucalendar/${item.wr_shopcode}`);
                }}
                className="relative cursor-pointer border rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow bg-white flex flex-col"
              >
                {/* 이미지 */}
                <div className="relative">
                  <img
                    src={`/api/wdm/image-proxy?url=${imageUrl}`}
                    alt={item.wr_shopnm}
                    className="w-full h-56 object-cover"
                  />
                  {/* 오픈전 표시 */}
                  {isBeforeOpen() && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                      <span className="text-white text-2xl font-bold">오픈전입니다.</span>
                    </div>
                  )}

                  {/* 마감 표시 */}
                  {expired && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                      <span className="text-white text-2xl font-bold">마감</span>
                    </div>
                  )}
                </div>

                {/* 본문 */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  {/* <h4 className="text-[17px] font-bold text-gray-800 mb-2">{item.wr_shopnm}</h4> */}
                  <div
                    className="text-[21px] font-bold text-gray-800 mb-2"
                    dangerouslySetInnerHTML={{
                      __html: (item.wr_shopnm || "").replace(/\n/g, ""),
                    }}
                  />

                  <div className="text-sm text-gray-600 flex items-start gap-2 mb-2">
                    <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5.13.938A7 7 0 1 0 6.4 14.082l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659Z" />
                    </svg>
                    {/* <span className="line-clamp-2">{item.wr_intro}</span> */}
                    <div
                      className="line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: (item.wr_intro || "").replace(/\n/g, ""),
                      }}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row md:justify-between text-sm text-gray-700 mt-3 mb-3 gap-2 md:gap-0">
                    {/* 버튼 영역 */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // 부모 카드 클릭 방지
                          setSelectedItem(item);
                        }}
                        className="btn btn-primary w-full md:w-auto"
                      >
                        상세보기
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary w-full md:w-auto"
                      >
                        예약하기
                      </button>
                    </div>

                    {/* 가격 영역 */}
                    <div className="text-right text-lg font-bold text-blue-600 mt-2 md:mt-0">
                      <span className="text-[17px] text-black">1인 참가비</span>{" "}
                      {item.wr_price === 0 ? "무료" : `${item.wr_price.toLocaleString()}원`}
                    </div>
                  </div>




                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
