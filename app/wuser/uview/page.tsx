"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/styles/form.css"; // 스타일 파일 import
import { AlertTriangle, Calendar, Clock, Users, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Navi from "@/components/Navi";
import { REGDATE_STR, REGDATE_YMD_STR } from "@/app/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface FileData {
    file_seq: number;
    wr_code: string;
    file_path: string;
}
interface OptData {
    wr_optnm: string;
}

interface ShopData {
    wr_shopnm: string;
    wr_price: number;
    wr_intro: string;
    wr_content: string;
    wr_include: string;
    wr_noinclude: string;
    wr_note: string;
    files: FileData[];
    aopt: OptData[];
    aopttotinwon: number;
}

export default function Uview() {
    const router = useRouter();
    const [reservationData, setReservationData] = useState<{
        rsvymd: string;
        shopcode: string;
        optcode: string;
        rsvinwon: number;
    } | null>(null);

    const [shopData, setShopData] = useState<ShopData[]>([]);
    const [formData, setFormData] = useState({
        wr_shopcode: "",
        wr_shopnm: "",
        wr_optcode: "",
        wr_optnm: "",
        wr_tourdate: "",
        wr_totinwon: 0,
        wr_price: 0,
        wr_totprice: 0,
    });

    useEffect(() => {
        const storedData = localStorage.getItem("wuserData");
        if (storedData) {
            setReservationData(JSON.parse(storedData));
        } else {
            router.push("/"); // 데이터 없으면 폼 페이지로 리디렉트
        }
    }, [router]);

    useEffect(() => {
        async function viewData() {
            if (reservationData?.shopcode && reservationData?.optcode) {
                try {
                    const res = await axios.post(`/api/wdm/sview`, {
                        wr_shopcode: reservationData.shopcode,
                        wr_optcode: reservationData.optcode,
                    });

                    if (Array.isArray(res.data)) {
                        setShopData(res.data);
                    } else {
                        console.error("데이터 형식 오류:", res.data);
                    }
                } catch (error) {
                    console.error("데이터 불러오기 오류:", error);
                }
            }
        }

        viewData();
    }, [reservationData]);

    // useEffect(() => {
    //     async function fetchData() {
    //         if (reservationData?.shopcode) {
    //             try {
    //                 const res = await axios.get(`/api/wdm/wrshopnm?id=${reservationData.shopcode}`);
    //                 if (Array.isArray(res.data)) {
    //                     setShopData(res.data);
    //                 } else {
    //                     console.error("wr_shopnm 데이터 형식이 올바르지 않습니다:", res.data);
    //                 }
    //             } catch (error) {
    //                 console.error("wr_shopnm 불러오기 오류:", error);
    //             }
    //         }
    //     }

    //     async function optnmData() {
    //         if (reservationData?.optcode) {
    //             try {
    //                 const res = await axios.get(`/api/wdm/wroptnm?id=${reservationData.optcode}`);
    //                 if (res.data && res.data.length > 0) {
    //                     setOptnm(res.data[0].wr_optnm); // wr_optnm 값만 저장
    //                 } else {
    //                     console.error("wr_optnm 없습니다:", res.data);
    //                 }
    //             } catch (error) {
    //                 console.error("wr_optnm 불러오기 오류:", error);
    //             }
    //         }
    //     }

    //     fetchData();
    //     optnmData();
    // }, [reservationData]);

    // `reservationData`와 `shopData`가 업데이트되면 `formData`도 업데이트
    useEffect(() => {
        if (reservationData && shopData.length > 0) {
            setFormData({
                wr_shopcode: reservationData.shopcode || "",
                wr_shopnm: shopData[0]?.wr_shopnm || "",
                wr_optcode: reservationData.optcode || "",
                wr_optnm: shopData[0]?.aopt[0].wr_optnm || "",
                wr_tourdate: reservationData.rsvymd || "",
                wr_totinwon: reservationData.rsvinwon || 0,
                wr_price: shopData[0]?.wr_price || 0,
                wr_totprice: shopData[0]?.wr_price && reservationData.rsvinwon
                    ? (shopData[0].wr_price * reservationData.rsvinwon)
                    : 0,
            });
        }
    }, [reservationData, shopData]);

    console.log("shopData: ", shopData)
    // console.log("optnm: ", optnm)
    // console.log("reservationData: ", reservationData)
    // console.log("formData: ", formData)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch("/api/wdm/ursv/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const result = await response.json();

            // localStorage에 데이터 저장
            localStorage.setItem("wrsvData", JSON.stringify(result));

            // 쿼리 파라미터 없이 페이지 이동
            router.push("/wuser/ursv");
        } else {
            alert("Error submitting form");
        }
    };

    const setIsDetailOpen = () => {

    }


    return (
        <div>
            <Navi />

            <div className="container mx-auto py-6 px-4" style={{ backgroundColor: "#ffffff", maxWidth: "1400px" }}>
                <Card className="w-full mx-auto">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4 md:items-center">
                            <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden">
                                
                                {(() => {
                                    const imageUrl = encodeURIComponent(`${API_BASE_URL}${shopData[0]?.files[0].file_path ?? ""}`);
                                    return (
                                        <img src={`/api/wdm/image-proxy?url=${imageUrl}`} alt="Gallery Image" className="object-cover" />
                                    );
                                })()}

                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-2xl">{formData.wr_shopnm}</CardTitle>
                                <CardDescription className="mt-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{REGDATE_YMD_STR(formData.wr_tourdate)}</span>
                                </CardDescription>
                                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>최대 {shopData[0]?.aopttotinwon ?? 0}명 참여 가능</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none">
                            <p>
                                {shopData[0]?.wr_intro ?? ""}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* 예약 정보 및 예약하기 버튼 */}
                <div className="w-full mx-auto mt-6 mb-6">
                    <div className="bg-white rounded-lg border p-4 flex flex-col md:flex-row items-center">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">예약일자:</span>
                                    <span className="font-medium">{REGDATE_YMD_STR(formData.wr_tourdate)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">옵션명:</span>
                                    <span className="font-medium">{formData.wr_optnm}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">예약인원:</span>
                                    <span className="font-medium">{formData.wr_totinwon}명</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6 w-full md:w-auto">
                            {/* <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6 h-auto font-bold">
                                예약하기
                            </Button> */}
                            {/* <h1>예약 상세보기</h1>
                            <p>📅 예약 날짜: {formData.wr_tourdate}</p>
                            <p>🏪 상품명: {formData.wr_shopnm}</p>
                            <p>🔢 옵션 코드: {formData.wr_optcode}</p>
                            <p>🔢 옵션명: {formData.wr_optnm}</p>
                            <p>👥 예약 인원: {formData.wr_totinwon}명</p>
                            <p>👥 금액: {formData.wr_price}</p>
                            <p>👥 결제금액: {formData.wr_totprice}</p>

                            <p>예약폼</p> */}
                            <form onSubmit={handleSubmit}>
                                {/* <label htmlFor="wr_tourdate">예약 날짜:</label> */}
                                <input type="hidden" name="wr_tourdate" id="wr_tourdate" className="w_form_input" value={formData.wr_tourdate} readOnly />

                                {/* <label htmlFor="wr_shopcode">상품코드:</label> */}
                                <input type="hidden" name="wr_shopcode" id="wr_shopcode" className="w_form_input" value={formData.wr_shopcode} readOnly />

                                {/* <label htmlFor="wr_shopnm">상품명:</label> */}
                                <input type="hidden" name="wr_shopnm" id="wr_shopnm" className="w_form_input" value={formData.wr_shopnm} readOnly />

                                {/* <label htmlFor="wr_optcode">옵션 코드:</label> */}
                                <input type="hidden" name="wr_optcode" id="wr_optcode" className="w_form_input" value={formData.wr_optcode} readOnly />

                                {/* <label htmlFor="wr_optnm">옵션명:</label> */}
                                <input type="hidden" name="wr_optnm" id="wr_optnm" className="w_form_input" value={formData.wr_optnm} readOnly />

                                {/* <label htmlFor="wr_totinwon">예약인원:</label> */}
                                <input type="hidden" name="wr_totinwon" id="wr_totinwon" className="w_form_input" value={formData.wr_totinwon} readOnly />

                                {/* <label htmlFor="wr_price">금액:</label> */}
                                <input type="hidden" name="wr_price" id="wr_price" className="w_form_input" value={formData.wr_price} readOnly />

                                {/* <label htmlFor="wr_totprice">결제금액:</label> */}
                                <input type="hidden" name="wr_totprice" id="wr_totprice" className="w_form_input" value={formData.wr_totprice} readOnly />

                                <button type="submit" className="w_btn_submit">예약하기</button>
                            </form>
                        </div>
                    </div>
                </div>
                {/* 상품 상세 정보 섹션 */}
                <div className="w-full mx-auto mt-8">
                    <h2 className="text-2xl font-bold mb-6">프로그램 상세 정보</h2>

                    <div className="space-y-8">
                        {/* 상품 설명 */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                                    <Calendar className="h-5 w-5" />
                                </span>
                                프로그램 설명
                            </h3>
                            <div className="prose max-w-none">
                                <p>
                                    동굴 전문가와 함께하는 이색적인 동굴 탐험으로, 거문오름용암동굴계의 대표 동굴인 김녕굴과 벵뒤굴을
                                    체험하는 프로그램입니다. 칠흑 같은 어둠 속에서 일반인들에게 공개되지 않는 동굴의 깊은 곳을 경험하며,
                                    세계자연유산의 비밀을 파헤쳐 보세요.
                                </p>
                                <p className="mt-4">
                                    사전예약을 통한 탐방객 동굴 투어 프로그램 전체 인솔투어로 진행 벵뒤굴+김녕굴 연계 프로그램,
                                </p>
                            </div>
                            <div className="mt-6 flex justify-center">
                                <Button size="lg">
                                    자세히 보기
                                </Button>
                            </div>
                        </div>

                        {/* 포함 사항 */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                                    <Users className="h-5 w-5" />
                                </span>
                                포함 사항
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>전문 트레킹 가이드</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>입산 허가증 발급 대행</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>간단한 간식 및 물</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>여행자 보험</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>왕복 교통편 (지정된 호텔 픽업 및 드롭)</span>
                                </li>
                            </ul>
                        </div>

                        {/* 불포함 사항 */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                                    <Calendar className="h-5 w-5" />
                                </span>
                                불포함 사항
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>개인 장비 (등산화, 등산복 등)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>중식 (개인 도시락 지참 권장)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>개인 경비</span>
                                </li>
                            </ul>
                        </div>

                        {/* 유의 사항 */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                                    <AlertTriangle className="h-5 w-5" />
                                </span>
                                유의 사항
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>기상 상황에 따라 투어가 취소될 수 있습니다. (전액 환불 또는 일정 변경)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>출발 3일 전까지 취소 시 전액 환불, 2일 전 80%, 1일 전 50%, 당일 취소 시 환불 불가</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>건강에 이상이 있거나 등산이 어려운 경우 참여를 자제해 주시기 바랍니다.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>투어 시작 10분 전까지 집합 장소에 도착해주세요.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>개인 쓰레기는 반드시 되가져가는 에코 트레킹입니다.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
