"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { REGDATE_STR, WR_STATE_ARR, getStateButtonClass } from "@/app/utils";
import Navi from "@/components/Navi";


interface Reservation {
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

export default function Plist() {
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5



    useEffect(() => {
        const fetchReservations = async () => {
            const storedData = localStorage.getItem("ploginData");

            if (!storedData) {
                router.push("/plogin"); // 인증 정보가 없으면 로그인 페이지로 이동
                return;
            }

            const ploginData = JSON.parse(storedData);
            console.log("ploginData: ", ploginData)
            try {
                const res = await axios.post(`/api/wdm/plist`, ploginData);

                if (res.data.length > 0) {
                    setReservations(res.data);
                } else {
                    setError("예약 정보를 불러올 수 없습니다.");
                }
            } catch (err) {
                console.error("예약 목록 조회 오류:", err);
                setError("예약 목록을 가져오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, [router]);



    return (
        <div>

            <Navi />

            <main className="container mx-auto py-8 px-4" style={{ backgroundColor: "#ffffff", maxWidth: "1400px" }}>
                <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold">여행 예약 관리</h2>
                        <div className="flex items-start gap-2 p-3 border border-red-300 bg-red-50 text-red-700 rounded-md">
                            <svg
                                className="w-7 h-7 mt-1 flex-shrink-0 text-red-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.763-1.36 2.683-1.36 3.446 0l6.518 11.63c.75 1.339-.213 3.02-1.723 3.02H3.462c-1.51 0-2.473-1.681-1.723-3.02L8.257 3.1zM9 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm2 6a1 1 0 10-2 0 1 1 0 002 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="leading-relaxed">
                                <strong className="font-semibold">주의:</strong> 결제/보기 버튼을 클릭 후 결제를 해야 예약이 완료됩니다.
                            </p>
                        </div>

                    </div>

                    <div className="rounded-xl border border-gray-300 shadow-sm overflow-x-auto">
                        <table className="min-w-[900px] w-full text-sm text-gray-700 table-fixed border-collapse">
                            <thead className="bg-gray-100 text-gray-800">
                                <tr>
                                    <th className="px-3 py-2 whitespace-nowrap text-center">여행일</th>
                                    <th className="min-w-[150px] px-3 py-2 text-center">상품명</th>
                                    <th className="min-w-[120px] px-3 py-2 text-center">옵션명</th>
                                    <th className="px-3 py-2 text-center">이름</th>
                                    <th className="px-3 py-2 text-center">연락처</th>
                                    <th className="text-center px-3 py-2 text-center">총인원</th>
                                    <th className="text-right px-3 py-2 text-center">결제금액</th>
                                    <th className="px-3 py-2 text-center">진행상태</th>
                                    <th className="px-3 py-2 text-center">등록일</th>
                                    <th className="text-center px-3 py-2 text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.length > 0 ? (
                                    reservations.map((item, index) => (
                                        <tr
                                            key={item.wr_seq}
                                            className={index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                                        >
                                            <td className="px-3 py-2 whitespace-nowrap text-center">{item.wr_tourdate}</td>
                                            <td className="px-3 py-2 text-center">{item.wr_shopnm}</td>
                                            <td className="px-3 py-2 text-center">{item.wr_optnm}</td>
                                            <td className="px-3 py-2 text-center">{item.wr_name}</td>
                                            <td className="px-3 py-2 text-center">{item.wr_tel}</td>
                                            <td className="text-center px-3 py-2">{item.wr_totinwon.toLocaleString()}명</td>
                                            <td className="text-center px-3 py-2">{item.wr_totprice.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-center"><button className={`px-2 py-1 text-sm font-medium rounded ${getStateButtonClass(item.wr_state)}`}>
                                                {WR_STATE_ARR[item.wr_state] || "알수없음"}
                                            </button></td>
                                            <td className="px-3 py-2 text-center">{REGDATE_STR(item.wr_regdate)}</td>
                                            <td className="px-3 py-2 text-center">
                                                {(item.wr_state === 1 || item.wr_state === 2) && (
                                                    <Link
                                                        href={`/wuser/pview/${item.wr_code}`}
                                                        className="inline-block px-2 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                                                    >
                                                        결제/보기
                                                    </Link>
                                                )}

                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="h-24 text-center text-gray-500">
                                            검색 결과가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>



                    {/* 페이지네이션 */}

                </div>
            </main>
        </div>
    );
}
