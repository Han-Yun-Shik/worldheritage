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
        const res = await axios.get("/api/wdm/slist");
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

  const imageUrl = encodeURIComponent(
    `${API_BASE_URL}/home/hosting_users/worldheritage/apps/worldheritage_worldheritage/uploads/1744707510747-880908418-nature-2.jpg`
  );

  return (
    <div>
      <Navi />
      <div className="w_list_wrap">
        {data.map((item) => (
          <div key={item.wr_seq} onClick={() => router.push(`/wuser/ucalendar/${item.wr_shopcode}`)}>
            <div className="w_list_con">
              <div>
                <img src={`${API_BASE_URL}${item.files[0].file_path}`} className="w_list_img" />
                <img src={`/api/wdm/image-proxy?url=${imageUrl}`} alt="Gallery Image" />
                
              </div>
              <div className="w_list_con_right">
                <p className="w_list_con_subject">{item.wr_shopnm}</p>
                <div className="w_list_con_intro">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-[23px] h-[23px] text-gray-800 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="0.6"
                        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      />
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="0.6"
                        d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z"
                      />
                    </svg>
                    <span>{item.wr_intro}</span>
                  </div>
                </div>
                <div className="w_list_con_info">
                  <div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-[23px] h-[23px] text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="0.6"
                          d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      {item.aoptinwon.toLocaleString()}명
                    </div>
                  </div>
                  <div>
                    <div
                      className={
                        ((item.aoptinwon || 0) - (item.rsvtotinwon || 0)) === 0
                          ? 'w_list_peo_wrap_red'
                          : 'w_list_peo_wrap'
                      }
                    >
                      {((item.aoptinwon || 0) - (item.rsvtotinwon || 0)) === 0
                        ? '마감'
                        : `잔여${(item.aoptinwon || 0) - (item.rsvtotinwon || 0)}명`}
                    </div>
                  </div>
                  <div className="w_list_con_info_price">
                    {item.wr_price.toLocaleString()}원
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
