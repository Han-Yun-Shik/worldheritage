"use client";

import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "@/styles/form.css"; // 스타일 파일 import
import { REGDATE_STR, WR_STATE_ARR, WR_GENDER_ARR, FORMATAUTHDATE, FORMATCANCELDATE, REGDATE_YMDHIS_STR, REGDATE_YMDHIS_LIMIT_STR } from "@/app/utils";
import Navi from "@/components/Navi";
import { CardFooter } from "@/components/ui/card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { User, Users, MapPin, Mail, Phone, Clock, CalendarDays, Wallet, Coins } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox";
import InfoItem from "@/components/InfoItem";

interface RsubData {
    wr_seq: number;
    wr_code: string;
    wr_name: string;
    wr_age: number;
    wr_gender: string;
    wr_address: string;
    wr_email: string;
    wr_tel: string;
}

interface PayData {
    resultcode: string;
    resultmsg: string;
    msgsource: string;
    amt: string;
    mid: string;
    moid: string;
    buyeremail: string;
    buyertel: string;
    buyername: string;
    goodsname: string;
    tid: string;
    authcode: string;
    authdate: string;
    paymethod: string;
    canceldate: string;
    canceltime: string;
    cancelnum: string;
}

interface RsvData {
    wr_seq: number;
    wr_code: string;
    wr_name: string;
    wr_age: number;
    wr_gender: string;
    wr_address: string;
    wr_email: string;
    wr_tel: number;
    wr_state: number;
    wr_regdate: string;
    wr_update: string;
    wr_shopnm: string;
    wr_optnm: string;
    wr_totinwon: number;
    wr_tourdate: string;
    wr_totprice: number;
    rsvsubinfo: RsubData[];
    payinfo: PayData[];
}

export default function Rsvedit() {
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState<RsvData | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // ✅ fetchData 함수 useCallback으로 추출
    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`/api/wdm/rsvread?id=${id}`);
            if (res.data && res.data.length > 0) {
                setFormData(res.data[0]);
            } else {
                console.error("데이터가 없습니다:", res.data);
            }
        } catch (error) {
            console.error("데이터 불러오기 오류:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // ✅ 초기 로딩 시 fetch
    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

    //--########## Nice Pay s ##########--//
    // ✅ 결제 완료 메시지 수신 시 fetchData만 실행
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.status === "success") {
                //alert("결제가 완료되었습니다!");
                fetchData(); // ✅ 새로고침 대신 데이터만 다시 불러오기
                setMessage("결제가 완료되었습니다!");
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [fetchData]);
    //--########## Nice Pay e ##########--//


    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (!formData) {
        return <p>데이터를 불러오지 못했습니다.</p>;
    }

    //--########## Nice Pay s ##########--//
    const nicepayrq = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await axios.get("/api/wdm/nicepayrq", {
                params: {
                    amt: formData.wr_totprice,
                    goodsName: formData.wr_shopnm,
                    moid: formData.wr_code,
                    buyerName: formData.wr_name,
                    buyerEmail: formData.wr_email,
                    buyerTel: formData.wr_tel,
                },
                responseType: 'text',
            });

            // 새 창 열기
            const popup = window.open("", "_blank", "width=700,height=700");
            if (popup) {
                popup.document.open();
                popup.document.write(res.data);
                popup.document.close();
            } else {
                alert("팝업이 차단되었습니다. 팝업을 허용해주세요.");
            }

        } catch (error) {
            console.error("데이터 불러오기 오류:", error);
        }
    };

    const nicerefund = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await axios.post("/api/wdm/nicerefund", {
                tidfield: formData.payinfo[0].tid,
                moid: formData.payinfo[0].moid,
                CancelAmt: formData.payinfo[0].amt,
                //CancelAmt: formData.payinfo[0].amt,
            });

            console.log("취소결과: ", res.data)
            fetchData(); // ✅ 새로고침 대신 데이터만 다시 불러오기
            setMessage("결제취소가 완료되었습니다!");

        } catch (error) {
            console.error("데이터 불러오기 오류:", error);
        }
    };
    //--########## Nice Pay e ##########--//

    // 승인일시 및 취소일시 여부에 따라 버튼을 렌더링합니다.
    const renderPaymentButtons = () => {
        if (formData.wr_state !== 1) return null; // ✅ 상태가 1이 아니면 아무 것도 렌더링하지 않음


        return (
            <button onClick={nicepayrq} className="btn btn-secondary">
                Nice Pay 결제
            </button>
        );
    };


    return (
        <div>
            <Navi />
            {/* 상세내용 */}
            <div className="w-full max-w-3xl mx-auto p-4" style={{ backgroundColor: "#ffffff", maxWidth: "1400px" }}>
                <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-lg">
                        <CardTitle className="text-2xl font-bold">세계유산축전 프로그램 참가신청서</CardTitle>
                        <CardDescription>프로그램 참가를 위한 신청서를 작성해 주세요</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-8">
                        {/* 동의 사항 */}

                        {/* 신청자 정보 */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-primary" />
                                    <h4 className="text-xl font-semibold">신청자 정보</h4>
                                </div>
                                <div className="flex items-center space-x-2" style={{ color: "#ff0000" }}>
                                    {/* <button onClick={nicepayrq} className="btn btn-secondary">Nice Pay 결제</button>&nbsp;
                                    <button onClick={nicerefund} className="btn btn-secondary">Nice Pay 취소</button> */}
                                    {message}
                                    {renderPaymentButtons()}
                                </div>
                            </div>
                            <Separator className="mb-4 bg-gray-300 dark:bg-gray-600" />

                            <Card className="p-6">
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoItem icon={<Clock className="mr-2 h-4 w-4" />} label="등록일">
                                            {REGDATE_YMDHIS_STR(formData.wr_regdate)}
                                        </InfoItem>

                                        <InfoItem icon={<Clock className="mr-2 h-4 w-4" />} label="유효시간">
                                            <span className="text-red-500">{REGDATE_YMDHIS_LIMIT_STR(formData.wr_regdate)}</span>
                                        </InfoItem>
                                        
                                        <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="이름">
                                            {formData.wr_name}
                                        </InfoItem>

                                        <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="나이">
                                            {formData.wr_age}
                                        </InfoItem>

                                        <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="성별">
                                            {WR_GENDER_ARR[formData.wr_gender]}
                                        </InfoItem>

                                        <InfoItem icon={<MapPin className="mr-2 h-4 w-4" />} label="주소">
                                            {formData.wr_address}
                                        </InfoItem>

                                        <InfoItem icon={<Mail className="mr-2 h-4 w-4" />} label="이메일">
                                            {formData.wr_email}
                                        </InfoItem>

                                        <InfoItem icon={<Phone className="mr-2 h-4 w-4" />} label="전화번호">
                                            {formData.wr_tel}
                                        </InfoItem>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 결제정보 */}

                        {formData.payinfo?.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                        <Users className="mr-2 h-5 w-5 text-primary" />
                                        <h4 className="text-xl font-semibold">결제정보</h4>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        &nbsp;
                                    </div>
                                </div>
                                <Separator className="mb-4 bg-gray-300 dark:bg-gray-600" />

                                <Card className="p-6">
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem icon={<Coins className="mr-2 h-4 w-4" />} label="결제금액">
                                                {formData.payinfo[0].amt}
                                            </InfoItem>

                                            <InfoItem icon={<Clock className="mr-2 h-4 w-4" />} label="승인일시">
                                                {FORMATAUTHDATE(formData.payinfo[0].authdate)}
                                            </InfoItem>

                                            <InfoItem icon={<Clock className="mr-2 h-4 w-4" />} label="취소일시">
                                                {FORMATCANCELDATE(formData.payinfo[0].canceldate, formData.payinfo[0].canceltime)}
                                            </InfoItem>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}


                        {/* 여행상품 정보 */}

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-primary" />
                                    <h4 className="text-xl font-semibold">여행상품</h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                    &nbsp;
                                </div>
                            </div>
                            <Separator className="mb-4 bg-gray-300 dark:bg-gray-600" />

                            {/* 여행상품 */}

                            <Card className="p-6">
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InfoItem icon={<CalendarDays className="mr-2 h-4 w-4" />} label="여행일">
                                            {formData.wr_tourdate}
                                        </InfoItem>

                                        <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="상품명">
                                            {formData.wr_shopnm}
                                        </InfoItem>

                                        <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="옵션명">
                                            {formData.wr_optnm}
                                        </InfoItem>

                                        <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="예약인원">
                                            {formData.wr_totinwon.toLocaleString()}명
                                        </InfoItem>

                                        <InfoItem icon={<Coins className="mr-2 h-4 w-4" />} label="결제금액">
                                            {formData.wr_totprice.toLocaleString()}
                                        </InfoItem>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>


                        {/* 참가자 정보 */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-primary" />
                                    <h4 className="text-xl font-semibold">참가자 정보</h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                    &nbsp;
                                </div>
                            </div>
                            <Separator className="mb-4 bg-gray-300 dark:bg-gray-600" />

                            {/* 참가자 선택 버튼 */}


                            {/* 참가자 1 */}
                            {formData.rsvsubinfo.map((participant, index) => (
                                <Card className="p-6" key={index} style={{ marginBottom: "5px" }}>
                                    <CardContent>
                                        <h5 className="text-lg font-medium mb-3 flex items-center">
                                            <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-primary text-white text-sm mr-2">
                                                {index + 1}
                                            </span>

                                            참가자 정보
                                        </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="이름">
                                                {participant.wr_name}
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="나이">
                                                {participant.wr_age}
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="성별">
                                                {WR_GENDER_ARR[participant.wr_gender]}
                                            </InfoItem>

                                            <InfoItem icon={<MapPin className="mr-2 h-4 w-4" />} label="주소">
                                                {participant.wr_address}
                                            </InfoItem>

                                            <InfoItem icon={<Phone className="mr-2 h-4 w-4" />} label="전화번호">
                                                {participant.wr_tel}
                                            </InfoItem>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <Link href={`/wuser/plist/`} className="btn btn-sm btn-primary mx-2">목록</Link>
                        </div>
                    </CardContent>

                </Card>


            </div>
        </div>
    );
}
