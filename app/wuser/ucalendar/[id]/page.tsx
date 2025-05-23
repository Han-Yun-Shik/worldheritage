"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import "@/styles/form.css";
import Navi from "@/components/Navi";
import { REGDATE_STR, REGDATE_YMD_STR } from "@/app/utils";
import { AlertTriangle, Calendar, Clock, Users, X } from "lucide-react"
import { useLogin } from "@/context/LoginContext";

interface ShopData {
    wr_shopcode: string;
    wr_shopnm: string;
    wr_maxinwon: number;
    wr_days: string;
}

interface OptData {
    wr_shopcode: string;
    wr_optcode: string;
    wr_optnm: string;
    wr_inwon: number;
    reserved_inwon?: number; // 예약된 인원 추가
}

export default function Ucalendar() {
    const today = new Date();
    const { isLoggedIn, userName, sessionId, logout } = useLogin();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [optData, setOptData] = useState<OptData[]>([]);
    const [dailyTotalInwon, setDailyTotalInwon] = useState<{ [key: string]: number }>({});
    const [dailyReservedTotal, setDailyReservedTotal] = useState<{ [key: string]: number }>({});
    const [selectedInwonMap, setSelectedInwonMap] = useState<{ [key: string]: number | null }>({}); // ✅ 선택한 인원을 저장하는 객체
    const [selectedOptionCode, setSelectedOptionCode] = useState<string | null>(null);
    const [shopData, setShopData] = useState<ShopData[]>([]);

    const { id } = useParams();
    const router = useRouter();

    const optionRef = useRef<HTMLDivElement>(null); // 옵션 영역을 위한 ref
    const reservationRef = useRef<HTMLDivElement>(null); // 예약 영역 참조

    // ashop 데이터 가져오기
    const fetchShopData = async () => {
        try {
            const res = await axios.get(`/api/wdm/getashopone?id=${id}`);
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
        if (optData.length > 0) {
            fetchDailyTotals();
        }
    }, [currentYear, currentMonth, optData]);

    useEffect(() => {
        fetchOptData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchReservedInwon(selectedDate);
        }
    }, [selectedDate]);

    const fetchOptData = async () => {
        try {
            const res = await axios.get(`/api/wdm/getaopt?id=${id}`);
            if (Array.isArray(res.data)) {
                setOptData(res.data);
            } else {
                console.error("데이터 형식이 올바르지 않습니다:", res.data);
            }
        } catch (error) {
            console.error("데이터 불러오기 오류:", error);
        }
    };

    const fetchReservedInwon = async (date: string) => {
        const updatedOptData = await Promise.all(
            optData.map(async (option) => {
                try {
                    const res = await axios.get("/api/wdm/getrsvinwon", {
                        params: {
                            wr_tourdate: date,
                            wr_shopcode: option.wr_shopcode,
                            wr_optcode: option.wr_optcode,
                        },
                    });
                    return {
                        ...option,
                        reserved_inwon: res.data[0]?.wr_sumtotinwon || 0,
                    };
                } catch (error) {
                    console.error("예약된 인원 조회 오류:", error);
                    return { ...option, reserved_inwon: 0 };
                }
            })
        );
        setOptData(updatedOptData);
    };

    const fetchDailyTotals = async () => {
        if (!optData.length) return;

        const wr_shopcode = optData[0].wr_shopcode;
        const year = currentYear.toString();
        const month = (currentMonth + 1).toString().padStart(2, "0");
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const totalInwonData: { [key: string]: number } = {};
        const reservedTotalData: { [key: string]: number } = {};

        let maxInwon = 0;

        try {
            // ✅ 최대 인원 단일 호출
            const totalRes = await axios.get("/api/wdm/getcalendaropttotalinwon", {
                params: { wr_shopcode }
            });
            maxInwon = totalRes.data[0]?.wr_suminwon || 0;
        } catch (error) {
            console.error("최대 인원 조회 오류:", error);
            maxInwon = 0;
        }

        let reservedMap: { [key: string]: number } = {};
        try {
            // ✅ 예약된 인원 한 달치 한 번에 가져오기
            const reservedRes = await axios.get("/api/wdm/getcalendarrsvtotalinwon", {
                params: { year, month, wr_shopcode }
            });
            reservedMap = reservedRes.data;
        } catch (error) {
            console.error("예약 인원 월간 조회 오류:", error);
        }
        console.log("reservedMap", reservedMap)

        // 날짜별 데이터 세팅
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${month}-${day.toString().padStart(2, "0")}`;
            totalInwonData[dateStr] = maxInwon;
            reservedTotalData[dateStr] = reservedMap[dateStr] || 0;
        }

        setDailyTotalInwon(totalInwonData);
        setDailyReservedTotal(reservedTotalData);
    };


    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear(currentYear - 1);
            setCurrentMonth(11);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear(currentYear + 1);
            setCurrentMonth(0);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

        setSelectedDate(dateStr);
        fetchReservedInwon(dateStr);

        // 날짜가 선택되면 해당 옵션 영역으로 스크롤 이동
        setTimeout(() => {
            optionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100); // React 렌더링 이후 이동하도록 약간의 지연
    };

    const wrdaysArray = (shopData[0]?.wr_days ?? "")
        .split(",")
        .map((d) => d.trim()); // ["2025-05-15", "2025-05-16", ...]

    const generateCalendar = () => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const weeks: React.ReactElement[] = [];
        let days: React.ReactElement[] = [];

        const createDayCell = (key: string | number, content?: React.ReactNode) => (
            <td key={key} className="bg-gray-100 h-[110px] border border-gray-300"></td>
        );

        for (let i = 0; i < firstDay; i++) {
            days.push(createDayCell(`empty-${i}`));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            const total = dailyTotalInwon[dateStr] || 0;
            const reserved = dailyReservedTotal[dateStr] || 0;
            const available = total - reserved;

            const isAllowed = wrdaysArray.includes(dateStr); // ✅ 예약 가능 날짜인지 확인
            const isSelected = selectedDate === dateStr;

            days.push(
                <td
                    key={day}
                    onClick={isAllowed ? () => handleDateClick(day) : undefined}
                    className={`
    h-[110px] border border-gray-300 align-top p-1 transition
    ${isAllowed
                            ? isSelected
                                ? "bg-blue-500 text-white cursor-pointer" // ✅ 선택된 날짜: 파란 배경
                                : "bg-green-500 text-white cursor-pointer hover:brightness-110"
                            : "bg-white text-gray-400 cursor-not-allowed"}
  `}
                >
                    <div className="font-semibold">{day}</div>
                    {isAllowed && (
                        <div className={`mt-1 text-xs rounded p-2 leading-snug ${isSelected ? "bg-blue-700" : "bg-green-700"} text-white`}>
                            예약됨 {reserved}명<br />
                            가능 {available}명
                        </div>
                    )}
                </td>

            );

            if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
                while (days.length < 7) {
                    days.push(createDayCell(`empty-last-${days.length}`));
                }
                weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
                days = [];
            }
        }
        return weeks;
    };

    const handleSelectChange = (optcode: string, value: number) => {
        setSelectedInwonMap((prev) => ({
            ...prev,
            [optcode]: value,
        }));
    };

    const handleOptionClick = (optCode: string, maxAvailable: number) => {
        if (maxAvailable <= 0) return;

        setSelectedOptionCode(optCode);

        // 선택 후 아래로 스크롤
        setTimeout(() => {
            reservationRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <div>
            <Navi />

            <div className="px-4 py-10">
                <div className="max-w-[1400px] mx-auto w-full">

                    <div className="w_calendar_shopnm_wrap">

                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <span className="bg-transparent text-black p-1.5 rounded-md">
                                <i className="fas fa-calendar-alt h-5 w-5"></i>
                            </span>
                            {shopData[0]?.wr_shopnm ?? null}
                        </h3>
                    </div>

                    {/* 달력 카드형 컨테이너 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={handlePrevMonth}
                                className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                            >
                                ◀ 이전달
                            </button>
                            <span className="text-xl font-semibold text-gray-800">
                                {currentYear}년 {String(currentMonth + 1).padStart(2, "0")}월
                            </span>
                            <button
                                onClick={handleNextMonth}
                                className="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                            >
                                다음달 ▶
                            </button>
                        </div>

                        {/* 달력 테이블 */}
                        <div className="overflow-x-auto">
                            <table className="w-full table-fixed border">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700 text-sm">
                                        <th className="py-2 w-[14.2857%] text-center border border-gray-300">일</th>
                                        <th className="py-2 w-[14.2857%] text-center border border-gray-300">월</th>
                                        <th className="py-2 w-[14.2857%] text-center border border-gray-300">화</th>
                                        <th className="py-2 w-[14.2857%] text-center border border-gray-300">수</th>
                                        <th className="py-2 w-[14.2857%] text-center border border-gray-300">목</th>
                                        <th className="py-2 w-[14.2857%] text-center border border-gray-300">금</th>
                                        <th className="py-2 w-[14.2857%] text-center border border-gray-300">토</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {generateCalendar()}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 선택된 날짜 관련 옵션 표시 영역 */}
                    {selectedDate && (
                        <div ref={optionRef} className="bg-white rounded-xl shadow-lg p-6 mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{REGDATE_YMD_STR(selectedDate)} 예약 가능 옵션</h3>
                            <p className="text-sm text-gray-500 mb-4">시간별 가능 인원</p>

                            {optData.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {optData.map((option) => {
                                        const maxAvailable = option.wr_inwon - (option.reserved_inwon || 0);
                                        const isSelected = selectedOptionCode === option.wr_optcode;
                                        let btnStyle = "bg-gray-100 text-gray-700";
                                        if (maxAvailable <= 0) btnStyle = "bg-red-100 text-red-600 line-through";
                                        else if (isSelected) btnStyle = "bg-orange-100 border border-orange-500 text-orange-700";

                                        return (
                                            <div
                                                key={option.wr_optcode}
                                                className={`rounded-md p-4 text-sm ${btnStyle} cursor-pointer`}
                                                onClick={() => {
                                                    //if (maxAvailable > 0) setSelectedOptionCode(option.wr_optcode);
                                                    handleOptionClick(option.wr_optcode, maxAvailable)
                                                }}
                                            >
                                                <strong className="block mb-1">{option.wr_optnm}</strong>
                                                {/* <p>(최대 {option.wr_inwon}명)</p>
                                                <p>예약됨 {option.reserved_inwon}명</p> */}
                                                <p>{maxAvailable <= 0 ? "마감" : `가능 ${maxAvailable}명`}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">예약 가능한 옵션이 없습니다.</p>
                            )}

                            {/* 옵션 선택 후 예약 영역 */}
                            {selectedOptionCode && (
                                <div ref={reservationRef} className="reservation-detail">
                                    <hr />
                                    {(() => {
                                        const selectedOption = optData.find(opt => opt.wr_optcode === selectedOptionCode);
                                        if (!selectedOption) return null;

                                        const wr_maxinwon = shopData[0].wr_maxinwon;
                                        const maxAvailable = selectedOption.wr_inwon - (selectedOption.reserved_inwon || 0);
                                        //const finalMax = Math.min(wr_maxinwon, maxAvailable); // 최종 선택 가능한 최대 인원
                                        // ✅ 로그인 여부에 따라 finalMax 계산 분기
                                        const finalMax = isLoggedIn ? maxAvailable : Math.min(wr_maxinwon, maxAvailable);

                                        return (
                                            <div>
                                                <div className="w_rsvdate_font3">{selectedOption.wr_optnm} 예약</div>
                                                <select
                                                    name="rsvinwon"
                                                    value={selectedInwonMap[selectedOption.wr_optcode] || ""}
                                                    onChange={(e) => handleSelectChange(selectedOption.wr_optcode, Number(e.target.value))}
                                                    disabled={finalMax <= 0}
                                                    className="w_form_input"
                                                >
                                                    <option value="">가능 인원 선택</option>
                                                    {Array.from({ length: finalMax }, (_, i) => i + 1).map((num) => (
                                                        <option key={num} value={num}>{num}명</option>
                                                    ))}
                                                </select>

                                                <button
                                                    onClick={async () => {
                                                        if (selectedInwonMap[selectedOption.wr_optcode]) {
                                                            try {
                                                                const requestData = {
                                                                    rsvymd: selectedDate,
                                                                    shopcode: selectedOption.wr_shopcode,
                                                                    optcode: selectedOption.wr_optcode,
                                                                    rsvinwon: selectedInwonMap[selectedOption.wr_optcode],
                                                                };

                                                                const rsvdata_rq = await fetch("/api/wdm/uview/", {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify(requestData),
                                                                });

                                                                if (rsvdata_rq.ok) {
                                                                    const result = await rsvdata_rq.json();
                                                                    localStorage.setItem("wuserData", JSON.stringify(result));
                                                                    router.push("/wuser/uview");
                                                                } else {
                                                                    alert("Error submitting form");
                                                                }
                                                            } catch (error) {
                                                                console.error("예약 요청 실패:", error);
                                                            }
                                                        }
                                                    }}
                                                    disabled={maxAvailable <= 0 || !selectedInwonMap[selectedOption.wr_optcode]}
                                                    className="w_btn_submit"
                                                >
                                                    예약하기
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

        </div>
    );
}
