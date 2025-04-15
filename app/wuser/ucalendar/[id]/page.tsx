"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import "@/styles/form.css";
import Navi from "@/components/Navi";
import { REGDATE_STR, REGDATE_YMD_STR } from "@/app/utils";

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
    const [selectedOptionCode, setSelectedOptionCode] = useState<string | null>(null);



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
                    style={{ height: "110px", color: textColor }}
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
                        <div className="w_rsvdate_font">{REGDATE_YMD_STR(selectedDate)} 예약 가능 옵션</div>
                        <div className="w_rsvdate_font2">시간별 가능 인원</div>

                        {/* ✅ 첫 번째 영역: 옵션 리스트만 노출 */}

                        {optData.length > 0 ? (
                            <div className="w_rsvbtn_wrap">
                                {optData.map((option, idx) => {
                                    const maxAvailable = option.wr_inwon - (option.reserved_inwon || 0);
                                    const isSelected = selectedOptionCode === option.wr_optcode;

                                    // ✅ 조건별 class 설정
                                    let btnClass = "w_rsvbtn_off";
                                    if (maxAvailable <= 0) {
                                        btnClass = "w_rsvbtn_deadline";
                                    } else if (isSelected) {
                                        btnClass = "w_rsvbtn_on";
                                    }

                                    return (
                                        <div
                                            key={option.wr_optcode}
                                            className={btnClass}
                                            style={{ cursor: maxAvailable > 0 ? "pointer" : "default" }}
                                            onClick={() => {
                                                if (maxAvailable > 0) {
                                                    setSelectedOptionCode(option.wr_optcode);
                                                }
                                            }}
                                        >

                                            <span style={{fontWeight:"700"}}>{option.wr_optnm}</span><br />
                                            (최대 {option.wr_inwon}명)<br />
                                            예약됨 {option.reserved_inwon}명<br />
                                            {maxAvailable <= 0
                                                ? "마감"
                                                : `가능 ${maxAvailable}명`}

                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p>예약 가능한 옵션이 없습니다.</p>
                        )}



                        {/* ✅ 두 번째 영역: 특정 옵션을 선택한 경우 select + 예약 버튼 표시 */}
                        {selectedOptionCode && (
                            <div className="reservation-detail">
                                <hr />
                                {(() => {
                                    const selectedOption = optData.find(opt => opt.wr_optcode === selectedOptionCode);
                                    if (!selectedOption) return null;

                                    const maxAvailable = selectedOption.wr_inwon - (selectedOption.reserved_inwon || 0);

                                    return (
                                        <div>
                                            <div className="w_rsvdate_font3">{selectedOption.wr_optnm} 예약</div>
                                            <select
                                                name="rsvinwon"
                                                value={selectedInwonMap[selectedOption.wr_optcode] || ""}
                                                onChange={(e) => handleSelectChange(selectedOption.wr_optcode, Number(e.target.value))}
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

                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>

            </div>
        </div>
    );
}
