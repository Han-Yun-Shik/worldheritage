"use client";

import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/form.css"; // 스타일 파일 import
import { REGDATE_STR, WR_STATE_ARR, WR_GENDER_ARR } from "@/app/utils";
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
    rsubdatas: RsubData[];
}

export default function Rsvedit() {
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState<RsvData | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
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
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (!formData) {
        return <p>데이터를 불러오지 못했습니다.</p>;
    }

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
                            <div className="flex items-center mb-1">
                                <User className="mr-2 h-5 w-5 text-primary" />
                                <h2 className="text-xl font-semibold">신청자 정보</h2>
                            </div>
                            <Separator className="mb-4 bg-gray-300 dark:bg-gray-600" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="wr_name">
                                        <User className="mr-1 h-4 w-4" />
                                        이름
                                    </Label>
                                    {formData.wr_name}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="applicant-age">
                                        <User className="mr-1 h-4 w-4" />
                                        나이
                                    </Label>
                                    {formData.wr_age}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="wr_gender">
                                        <User className="mr-1 h-4 w-4" />
                                        성별
                                    </Label>
                                    {WR_GENDER_ARR[formData.wr_gender]}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="wr_address" className="flex items-center">
                                        <MapPin className="mr-1 h-4 w-4" />
                                        주소
                                    </Label>
                                    {formData.wr_address}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="wr_email" className="flex items-center">
                                        <Mail className="mr-1 h-4 w-4" />
                                        이메일
                                    </Label>
                                    {formData.wr_email}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="wr_tel" className="flex items-center">
                                        <Phone className="mr-1 h-4 w-4" />
                                        전화번호
                                    </Label>
                                    {formData.wr_tel}
                                </div>
                            </div>
                        </div>

                        {/* 여행상품 정보 */}

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-semibold">상품 정보</h2>
                                </div>
                                <div className="flex items-center space-x-2">
                                    &nbsp;
                                </div>
                            </div>
                            <Separator className="mb-4 bg-gray-300 dark:bg-gray-600" />

                            {/* 여행상품 */}

                            <div className="mb-6 p-4 border rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            <User className="mr-1 h-4 w-4" />
                                            여행일
                                        </Label>
                                        {formData.wr_tourdate}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="age">
                                            <User className="mr-1 h-4 w-4" />
                                            상품명
                                        </Label>
                                        {formData.wr_shopnm}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="wr_gender">
                                            <User className="mr-1 h-4 w-4" />
                                            옵션명
                                        </Label>
                                        {formData.wr_optnm}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="flex items-center">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            예약인원
                                        </Label>
                                        {formData.wr_totinwon.toLocaleString()}명
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tel" className="flex items-center">
                                            <Phone className="mr-1 h-4 w-4" />
                                            결제금액
                                        </Label>
                                        {formData.wr_totprice.toLocaleString()}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tel" className="flex items-center">
                                            <Phone className="mr-1 h-4 w-4" />
                                            등록일
                                        </Label>
                                        {REGDATE_STR(formData.wr_regdate)}
                                    </div>
                                </div>
                            </div>

                        </div>


                        {/* 참가자 정보 */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-primary" />
                                    <h2 className="text-xl font-semibold">참가자 정보</h2>
                                </div>
                                <div className="flex items-center space-x-2">
                                    &nbsp;
                                </div>
                            </div>
                            <Separator className="mb-4 bg-gray-300 dark:bg-gray-600" />

                            {/* 참가자 선택 버튼 */}


                            {/* 참가자 1 */}
                            {formData.rsubdatas.map((participant, index) => (
                                <div className="mb-6 p-4 border rounded-lg" key={index}>
                                    <h3 className="text-lg font-medium mb-3 flex items-center">
                                        <span className="inline-flex justify-center items-center w-6 h-6 rounded-full bg-primary text-white text-sm mr-2">
                                            {index + 1}
                                        </span>

                                        참가자 정보
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                <User className="mr-1 h-4 w-4" />
                                                이름
                                            </Label>
                                            {participant.wr_name}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="age">
                                                <User className="mr-1 h-4 w-4" />
                                                나이
                                            </Label>
                                            {participant.wr_age}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="wr_gender">
                                                <User className="mr-1 h-4 w-4" />
                                                성별
                                            </Label>
                                            {WR_GENDER_ARR[participant.wr_gender]}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="flex items-center">
                                                <MapPin className="mr-1 h-4 w-4" />
                                                주소
                                            </Label>
                                            {participant.wr_address}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="tel" className="flex items-center">
                                                <Phone className="mr-1 h-4 w-4" />
                                                전화번호
                                            </Label>
                                            {participant.wr_tel}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{textAlign:"center"}}><Link href={`/wuser/plist/`} className="btn btn-sm btn-primary mx-2">목록</Link></div>
                    </CardContent>
                    
                </Card>

                
            </div>
        </div>
    );
}
