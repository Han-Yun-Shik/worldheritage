"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import "@/styles/form.css";
import Navi from "@/components/Navi";

interface OptData {
    wr_shopcode: string;
    wr_optcode: string;
    wr_optnm: string;
    wr_inwon: number;
    reserved_inwon?: number; // 예약된 인원 추가
}

export default function Ucalendar() {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [optData, setOptData] = useState<OptData[]>([]);
    const [dailyTotalInwon, setDailyTotalInwon] = useState<{ [key: string]: number }>({});
    const [dailyReservedTotal, setDailyReservedTotal] = useState<{ [key: string]: number }>({});
    const [selectedInwonMap, setSelectedInwonMap] = useState<{ [key: string]: number | null }>({}); // ✅ 선택한 인원을 저장하는 객체


    const { id } = useParams();
    const router = useRouter();

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

        const wr_shopcode = optData[0].wr_shopcode; // 하나의 shopcode 기준
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const totalInwonData: { [key: string]: number } = {};
        const reservedTotalData: { [key: string]: number } = {};

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

            try {
                // 최대 인원 가져오기
                const totalRes = await axios.get("/api/wdm/getcalendaropttotalinwon", {
                    params: { wr_shopcode }
                });
                totalInwonData[dateStr] = totalRes.data[0]?.wr_suminwon || 0;

                // 예약된 인원 가져오기
                const reservedRes = await axios.get("/api/wdm/getcalendarrsvtotalinwon", {
                    params: { wr_tourdate: dateStr, wr_shopcode }
                });
                reservedTotalData[dateStr] = reservedRes.data[0]?.wr_sumtotinwon || 0;
            } catch (error) {
                console.error(`${dateStr}의 데이터 조회 오류:`, error);
                totalInwonData[dateStr] = 0;
                reservedTotalData[dateStr] = 0;
            }
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
    };

    const generateCalendar = () => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const weeks: React.ReactElement[] = [];
        let days: React.ReactElement[] = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<td key={`empty-${i}`} className="empty"></td>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            const total = dailyTotalInwon[dateStr] || 0;
            const reserved = dailyReservedTotal[dateStr] || 0;
            const available = total - reserved;

            const dayOfWeek = (firstDay + day - 1) % 7; // 요일 계산 (0:일요일 ~ 6:토요일)
            let textColor = "";
            if (dayOfWeek === 0) textColor = "red"; // 일요일
            if (dayOfWeek === 6) textColor = "blue"; // 토요일

            days.push(
                <td
                    key={day}
                    className={`day ${selectedDate === dateStr ? "selected" : ""}`}
                    onClick={() => handleDateClick(day)}
                    style={{ height: "110px",color: textColor }}
                >
                    {day}
                    <br />
                    <span style={{ color: '#000000' }}>
                        <small>최대 {total}명 / 예약됨 {reserved}명 / 가능 {available}명</small>
                    </span>
                </td>
            );

            if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
                while (days.length < 7) {
                    days.push(<td key={`empty-last-${days.length}`} className="empty"></td>);
                }
                weeks.push(<tr key={weeks.length}>{days}</tr>);
                days = [];
            }
        }

        return <>{weeks}</>; // ✅ `React.Fragment`로 감싸서 불필요한 개행 제거
    };

    const handleSelectChange = (optcode: string, value: number) => {
        setSelectedInwonMap((prev) => ({
            ...prev,
            [optcode]: value,
        }));
    };

    return (
        <div>
            <Navi />

            <div className="w_calendar_wrap">
                
                <div className="cal_info_wrap">
                    <button onClick={handlePrevMonth}>◀ 이전달</button>
                    <span>{currentYear}년 {String(currentMonth + 1).padStart(2, "0")}월</span>
                    <button onClick={handleNextMonth}>다음달 ▶</button>
                </div>

                <table className="calendar">
                    <thead>
                        <tr>
                            <th>일</th> <th>월</th> <th>화</th> <th>수</th> <th>목</th> <th>금</th> <th>토</th>
                        </tr>
                    </thead>
                    <tbody>{generateCalendar()}</tbody>
                </table>

                {selectedDate && (
                    <div className="reservation">
                        <h2>📆 {selectedDate} 예약 가능 옵션</h2>
                        {optData.length > 0 ? (
                            <ul>
                                {optData.length > 0 ? (
                                    <ul>
                                        {optData.map((option) => {
                                            const maxAvailable = option.wr_inwon - (option.reserved_inwon || 0);

                                            return (
                                                <li key={option.wr_optcode}>
                                                    {option.wr_optnm} (최대 {option.wr_inwon}명) - 예약됨 {option.reserved_inwon}명 / 가능 {maxAvailable}명

                                                    <select
                                                        name="rsvinwon"
                                                        value={selectedInwonMap[option.wr_optcode] || ""}
                                                        onChange={(e) => handleSelectChange(option.wr_optcode, Number(e.target.value))}
                                                        disabled={maxAvailable <= 0}
                                                        className="w_form_input"
                                                    >
                                                        <option value="">가능 인원 선택</option>
                                                        {Array.from({ length: maxAvailable }, (_, i) => i + 1).map((num) => (
                                                            <option key={num} value={num}>{num}명</option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        onClick={async () => {
                                                            if (selectedInwonMap[option.wr_optcode]) {
                                                                try {
                                                                    const requestData = {
                                                                        rsvymd: selectedDate,
                                                                        shopcode: option.wr_shopcode,
                                                                        optcode: option.wr_optcode,
                                                                        rsvinwon: selectedInwonMap[option.wr_optcode],
                                                                    };

                                                                    const rsvdata_rq = await fetch("/api/wdm/uview/", {
                                                                        method: "POST",
                                                                        headers: { "Content-Type": "application/json" },
                                                                        body: JSON.stringify(requestData),
                                                                    });

                                                                    if (rsvdata_rq.ok) {
                                                                        const result = await rsvdata_rq.json();

                                                                        // localStorage에 데이터 저장
                                                                        localStorage.setItem("wuserData", JSON.stringify(result));

                                                                        // 쿼리 파라미터 없이 페이지 이동
                                                                        router.push("/wuser/uview");
                                                                    } else {
                                                                        alert("Error submitting form");
                                                                    }
                                                                } catch (error) {
                                                                    console.error("예약 요청 실패:", error);
                                                                }
                                                            }
                                                        }}
                                                        disabled={maxAvailable <= 0 || !selectedInwonMap[option.wr_optcode]}
                                                        className="w_btn_submit"
                                                    >
                                                        예약하기
                                                    </button>


                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p>예약 가능한 옵션이 없습니다.</p>
                                )}

                            </ul>
                        ) : (
                            <p>예약 가능한 옵션이 없습니다.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
