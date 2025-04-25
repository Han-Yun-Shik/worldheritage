"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import "@/styles/form.css"; // 스타일 파일 import
import { REGDATE_STR, WR_STATE_ARR, WR_GENDER_ARR, FORMATAUTHDATE, FORMATCANCELDATE } from "@/app/utils";
import Navi from "@/components/Navi";
import { CardFooter } from "@/components/ui/card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { User, Users, MapPin, Mail, Phone } from "lucide-react"
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

    // 참가자 정보를 배열로 관리
    const [participants, setParticipants] = useState<{ name: string; age: string; gender: string; address: string; email: string; tel: string }[]>([]);

    //--##### Search arg s #####--//
    const searchParams = useSearchParams();
    const shopnm = searchParams.get("shopnm") || "";
    const name = searchParams.get("name") || "";
    const state = searchParams.get("state") || "";
    const tourdate = searchParams.get("tourdate") || "";
    const currentPage = searchParams.get("currentPage") || "1";
    const backToListUrl = `/wdm/rsvlist?shopnm=${shopnm}&name=${name}&state=${state}&tourdate=${tourdate}&currentPage=${currentPage}`;
    //--##### Search arg e #####--//

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

    // ✅ 여기서 formData 체크
    if (loading || !formData) {
        return (
            <div className="text-center py-10">
                <p>데이터를 불러오는 중입니다...</p>
            </div>
        );
    }

    console.log(formData)

    //--########## Nice Pay s ##########--//
    const nicepayrq = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData) {
            alert("데이터가 없습니다.");
            return;
        }

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

        if (!formData) {
            alert("데이터가 없습니다.");
            return;
        }

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
        if (!formData) {
            alert("데이터가 없습니다.");
            return;
        }

        const pay = formData.payinfo?.[0];

        // 결제정보가 아예 없을 경우 => 결제 버튼
        if (!pay) {
            return (
                <button onClick={nicepayrq} className="btn btn-secondary">
                    Nice Pay 결제
                </button>
            );
        }

        const hasAuthDate = !!pay.authdate;
        const hasCancelDate = !!pay.canceldate;

        if (!hasAuthDate) {
            return (
                <button onClick={nicepayrq} className="btn btn-secondary">
                    Nice Pay 결제
                </button>
            );
        }

        if (hasAuthDate && !hasCancelDate) {
            return (
                <button onClick={nicerefund} className="btn btn-secondary">
                    Nice Pay 취소
                </button>
            );
        }

        // 취소일시가 있으면 아무 버튼도 안 나옴
        return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target;

        let newValue = value;

        // 전화번호 입력 시 숫자만 허용
        if (name === "wr_tel") {
            newValue = value.replace(/\D/g, ""); // 숫자가 아닌 문자 제거
        }

        setFormData({
            ...formData,
            [name]: name === "wr_state" ? Number(newValue) : newValue,
        });
    };

    const handleParticipantChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        let newValue = value;

        // 참가자 전화번호 입력 시 숫자만 허용
        if (name === "wr_tel") {
            newValue = value.replace(/\D/g, "");
        }

        const updatedParticipants = formData.rsvsubinfo.map((participant, i) =>
            i === index ? { ...participant, [name]: newValue } : participant
        );
        setFormData({ ...formData, rsvsubinfo: updatedParticipants });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        try {
            const res = await axios.put(`/api/wdm/rsvedit?id=${id}`, formData);
            if (res.status === 200) {
                setMessage("수정이 완료되었습니다.");
                //fetchData();
                // ✅ 저장 후 목록으로 리디렉션
                router.push(backToListUrl);
            }
        } catch (error) {
            console.error("수정 중 오류 발생:", error);
            setMessage("수정 실패. 다시 시도해주세요.");
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="w_con_navi_wrap">
                    <div className="w_con_title">예약 관리</div>
                    <div style={{ textAlign: "right" }}>
                        <button type="submit" className="btn btn-secondary">수정</button>&nbsp;
                        <button type="button" onClick={() => router.push(backToListUrl)} className="btn btn-secondary">
                            목록
                        </button>

                    </div>
                </div>


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
                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="이름">
                                                <input type="text" name="wr_name" id="wr_name" value={formData.wr_name} onChange={handleChange} className="w_form_input" />
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="나이">
                                                <input type="text" name="wr_age" id="wr_age" value={formData.wr_age} onChange={handleChange} className="w_form_input" />
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="성별">
                                                <select
                                                    name="wr_gender"
                                                    value={formData.wr_gender}
                                                    className="w_form_input"
                                                    onChange={handleChange}
                                                >
                                                    <option value="">성별 선택</option>
                                                    {Object.entries(WR_GENDER_ARR).map(([key, label]) => (
                                                        <option key={key} value={key}>
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </InfoItem>

                                            <InfoItem icon={<MapPin className="mr-2 h-4 w-4" />} label="주소">
                                                <input type="text" name="wr_address" id="wr_address" value={formData.wr_address} onChange={handleChange} className="w_form_input" />
                                            </InfoItem>

                                            <InfoItem icon={<Mail className="mr-2 h-4 w-4" />} label="이메일">
                                                <input type="text" name="wr_email" id="wr_email" value={formData.wr_email} onChange={handleChange} className="w_form_input" />
                                            </InfoItem>

                                            <InfoItem icon={<Phone className="mr-2 h-4 w-4" />} label="전화번호">
                                                <input type="text" name="wr_tel" id="wr_tel" value={formData.wr_tel} onChange={handleChange} className="w_form_input" maxLength={11} placeholder="'-'생략 숫자만 입력" />
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
                                                <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="예약상태">
                                                    <select
                                                        name="wr_state"
                                                        value={formData.wr_state}
                                                        className="w_form_input"
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">예약 상태 선택</option>
                                                        {Object.entries(WR_STATE_ARR).map(([key, label]) => (
                                                            <option key={key} value={key}>
                                                                {label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </InfoItem>

                                                <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="결제금액">
                                                    {formData.payinfo[0].amt}
                                                </InfoItem>

                                                <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="승인일시">
                                                    {FORMATAUTHDATE(formData.payinfo[0].authdate)}
                                                </InfoItem>

                                                <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="취소일시">
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
                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="여행일">
                                                <input type="text" name="wr_tourdate" id="wr_tourdate" value={formData.wr_tourdate} onChange={handleChange} className="w_form_input" />
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="상품명">
                                                <input type="text" name="wr_shopnm" id="wr_shopnm" value={formData.wr_shopnm} className="w_form_input" readOnly />
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="옵션명">
                                                <input type="text" name="wr_optnm" id="wr_optnm" value={formData.wr_optnm} className="w_form_input" readOnly />
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="예약인원">
                                                <input type="text" name="wr_totinwon" id="wr_totinwon" value={formData.wr_totinwon} className="w_form_input" readOnly />
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="결제금액">
                                                <input type="text" name="wr_totprice" id="wr_totprice" value={formData.wr_totprice} className="w_form_input" readOnly />
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="등록일">
                                                {REGDATE_STR(formData.wr_regdate)}
                                            </InfoItem>

                                            <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="수정일">
                                                {REGDATE_STR(formData.wr_update)}
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

                                                <input type="hidden" name="wr_seq" value={participant.wr_seq} className="w_form_input" readOnly />
                                            </h5>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="이름">
                                                    <input type="text" name="wr_name" value={participant.wr_name} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />
                                                </InfoItem>

                                                <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="나이">
                                                    <input type="text" name="wr_age" value={participant.wr_age} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />
                                                </InfoItem>

                                                <InfoItem icon={<User className="mr-2 h-4 w-4" />} label="성별">
                                                    <select
                                                        name="wr_gender"
                                                        value={participant.wr_gender}
                                                        className="w_form_input"
                                                        onChange={(e) => handleParticipantChange(index, e)}
                                                    >
                                                        <option value="">성별 선택</option>
                                                        {Object.entries(WR_GENDER_ARR).map(([key, label]) => (
                                                            <option key={key} value={key}>
                                                                {label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </InfoItem>

                                                <InfoItem icon={<MapPin className="mr-2 h-4 w-4" />} label="주소">
                                                    <input type="text" name="wr_address" value={participant.wr_address} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />
                                                </InfoItem>

                                                <InfoItem icon={<Phone className="mr-2 h-4 w-4" />} label="전화번호">
                                                    <input type="tel" name="wr_tel" value={participant.wr_tel} onChange={(e) => handleParticipantChange(index, e)} maxLength={11} placeholder="'-'생략 숫자만 입력" className="w_form_input" />
                                                </InfoItem>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <button type="submit" className="w_btn_submit">수정</button>
                            </div>
                        </CardContent>

                    </Card>


                </div>
            </form>

        </div>
    );
}
