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
}

export default function Home() {
  const [data, setData] = useState<ShopData[]>([]);
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Navi />
      <div className="px-4 py-8">
      <div className="max-w-[1400px] mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {data.map((item) => {
          const imageUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_API_BASE_URL}${item.files[0].file_path}`);
          const remaining = (item.aoptinwon || 0) - (item.rsvtotinwon || 0);
          const isFull = remaining === 0;

          return (
            <div
              key={item.wr_seq}
              onClick={() => router.push(`/wuser/ucalendar/${item.wr_shopcode}`)}
              className="cursor-pointer border rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow bg-white flex flex-col"
            >
              <img
                src={`/api/wdm/image-proxy?url=${imageUrl}`}
                alt={item.wr_shopnm}
                className="w-full h-56 object-cover"
              />
              <div className="p-5 flex flex-col flex-1 justify-between">
                <h2 className="text-lg font-bold text-gray-800 truncate mb-2">{item.wr_shopnm}</h2>

                <div className="text-sm text-gray-600 flex items-start gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5.13.938A7 7 0 1 0 6.4 14.082l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659Z" />
                  </svg>
                  <span className="line-clamp-2">{item.wr_intro}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-700 mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <span>{item.aoptinwon.toLocaleString()}명</span>
                  </div>
                  <div className={isFull ? "text-red-500 font-semibold" : "text-emerald-600 font-semibold"}>
                    {isFull ? "마감" : `잔여 ${remaining}명`}
                  </div>
                </div>

                <div className="text-right text-lg font-bold text-blue-600">
                  {item.wr_price.toLocaleString()}원
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
