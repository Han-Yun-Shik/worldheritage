"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { REGDATE_STR, WR_STATE_ARR, WR_GENDER_ARR } from "@/app/utils";
import "@/styles/form.css"; // 스타일 파일 import
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
import { useLogin } from "@/context/LoginContext";

export default function Ursv() {
    const router = useRouter();
    const [ursvData, setRsvData] = useState<{ wr_shopcode: string; wr_shopnm: string; wr_optcode: string; wr_optnm: string; wr_tourdate: string; wr_totinwon: number; wr_price: number; wr_totprice: number } | null>(null);
    const [formData, setFormData] = useState({
        wr_shopcode: "",
        wr_shopnm: "",
        wr_optcode: "",
        wr_optnm: "",
        wr_tourdate: "",
        wr_totinwon: 0,
        wr_price: 0,
        wr_totprice: 0,
        wr_name: "",
        wr_age: "",
        wr_gender: "",
        wr_address: "",
        wr_email: "",
        wr_tel: "",
        wr_loginox: "",
    });
    const [agreed, setAgreed] = useState(false)
    const [isSelfParticipant, setIsSelfParticipant] = useState(false);
    const [message, setMessage] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(1800); // 30분 = 1800초
    const { isLoggedIn, userName, sessionId, logout } = useLogin();

    //--########## 카운트다운 s ##########--//
    // 1. 카운트다운 로직은 그대로
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                return prev > 0 ? prev - 1 : 0;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // 2. 이동은 별도의 useEffect에서 처리
    useEffect(() => {
        if (secondsLeft === 0) {
            handletmpDelete(sessionId);
            router.push("/");
        }
    }, [secondsLeft, router]);

    // setInterval
    const formatTime = (sec: number) => {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };
    //--########## 카운트다운 e ##########--//

    // 참가자 정보를 배열로 관리
    const [participants, setParticipants] = useState<{ name: string; age: string; gender: string; address: string; email: string; tel: string }[]>([]);

    const hasMounted = useRef(false);
    useEffect(() => {
        if (hasMounted.current) return;
        hasMounted.current = true;

        const storedData = localStorage.getItem("wrsvData");
        if (storedData && sessionId) {
            const parsedData = JSON.parse(storedData);
            setRsvData(parsedData);
            setFormData({
                wr_shopcode: parsedData.wr_shopcode || "",
                wr_shopnm: parsedData.wr_shopnm || "",
                wr_optcode: parsedData.wr_optcode || "",
                wr_optnm: parsedData.wr_optnm || "",
                wr_tourdate: parsedData.wr_tourdate || "",
                wr_totinwon: parsedData.wr_totinwon || 0,
                wr_price: parsedData.wr_price || 0,
                wr_totprice: parsedData.wr_totprice || 0,
                wr_name: "",
                wr_age: "",
                wr_gender: "",
                wr_address: "",
                wr_email: "",
                wr_tel: "",
                wr_loginox: userName, //로그인정보
            });

            // 임시 데이터 저장
            const payload = {
                sessionid: sessionId,
                wr_shopcode: parsedData.wr_shopcode || "",
                wr_shopnm: parsedData.wr_shopnm || "",
                wr_optcode: parsedData.wr_optcode || "",
                wr_optnm: parsedData.wr_optnm || "",
                wr_tourdate: parsedData.wr_tourdate || "",
                wr_totinwon: parsedData.wr_totinwon || 0,
            };

            fetch("/api/wdm/rsvposttmp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then((res) => res.json())
                .then((data) => console.log("임시저장 결과:", data))
                .catch((err) => console.error("임시저장 오류:", err));

            // 예약 인원만큼 참가자 배열 초기화 (map을 사용하여 개별 객체 생성)
            setParticipants(
                Array.from({ length: parsedData.wr_totinwon }, () => ({
                    name: "",
                    age: "",
                    gender: "",
                    address: "",
                    email: "",
                    tel: "",
                }))
            );
        }
    }, [router, sessionId]);



    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        // 전화번호 입력 시 숫자만
        if (name === "wr_tel") {
            newValue = value.replace(/\D/g, "");
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        // 본인 참가일 경우 첫 참가자 정보에도 반영
        if (isSelfParticipant) {
            const fieldMap: { [key: string]: keyof typeof participants[0] } = {
                wr_name: "name",
                wr_age: "age",
                wr_gender: "gender",
                wr_address: "address",
                wr_email: "email",
                wr_tel: "tel",
            };

            if (fieldMap[name]) {
                setParticipants((prev) => {
                    const updated = [...prev];
                    updated[0] = { ...updated[0], [fieldMap[name]]: newValue };
                    return updated;
                });
            }
        }
    };


    const handleParticipantChange = (index: number, e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        // 참가자 전화번호 입력 시 숫자만 허용
        if (name === "tel") {
            newValue = value.replace(/\D/g, "");
        }

        setParticipants((prev) =>
            prev.map((participant, i) =>
                i === index ? { ...participant, [name]: newValue } : participant
            )
        );
    };

    const handletmpDelete = async (session_code?: string) => {
        if (!session_code) {
            console.warn("session_code 없음으로 삭제 생략");
            return;
        }

        try {
            const res = await axios.delete(`/api/wdm/rsvtmpdelete?id=${session_code}`);
            if (res.status === 200) {
                console.log("임시 데이터 삭제 성공:", res.data.message);
            } else {
                console.warn("임시 데이터 삭제 실패:", res.data);
            }
        } catch (error) {
            console.error("임시 데이터 삭제 요청 실패:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ 신청자 정보 유효성 검사
        const { wr_name, wr_age, wr_gender, wr_address, wr_email, wr_tel } = formData;

        if (!wr_name || !wr_age || !wr_gender || !wr_address || !wr_email || !wr_tel) {
            alert("신청자 정보를 모두 입력해 주세요.");
            return;
        }

        if (!/^\d{2,3}\d{3,4}\d{4}$/.test(String(wr_tel))) {
            alert("신청자 전화번호는 숫자만 입력하고 10~11자리여야 합니다.");
            return;
        }

        // ✅ 참가자 정보 유효성 검사
        for (let i = 0; i < participants.length; i++) {
            const p = participants[i];
            if (!p.name) {
                alert(`참가자 ${i + 1}의 이름을 입력해 주세요.`);
                return;
            }
            // 나이 검사 (숫자, 1~120세)
            if (!p.age || isNaN(Number(p.age)) || Number(p.age) <= 0 || Number(p.age) > 120) {
                alert(`참가자 ${i + 1}의 나이를 올바르게 입력해 주세요. (숫자, 1~120 사이)`);
                return;
            }

            if (!p.gender) {
                alert(`참가자 ${i + 1}의 성별을 입력해 주세요.`);
                return;
            }

            // 주소 검사
            if (!p.address || p.address.length < 2) {
                alert(`참가자 ${i + 1}의 주소를 입력해 주세요.`);
                return;
            }
            if (!p.tel) {
                alert(`참가자 ${i + 1}의 전화번호를 입력해 주세요.`);
                return;
            }
        }

        try {
            // 1. 예약 데이터 서버에 전송
            const response = await axios.post("/api/wdm/rsvpost", { ...formData, participants }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setMessage(response.data.message);

            // 1-2. 임시저장 데이터 삭제
            await handletmpDelete(sessionId);

            // 2. 인증 요청
            const { wr_email, wr_tel } = formData;
            const loginResponse = await axios.post("/api/wdm/plogin", { wr_email, wr_tel });

            // 3. 인증 정보 저장
            localStorage.setItem("ploginData", JSON.stringify({ wr_email, wr_tel }));

            // 4. 이동
            router.push("/wuser/plist");
        } catch (error) {
            console.error("제출 실패:", error);
            setMessage("데이터 전송 실패");
        }
    };


    return (
        <div>
            <Navi />

            <div className="flex flex-col items-center justify-center mt-10 space-y-2">
                <p className="text-gray-600 text-sm text-center">
                    화면을 벗어나거나 제한시간 30분이 지나면 예약 자리가 취소됩니다.<br />시간 만료전에 신청서를 작성 후 제출해주세요
                </p>

                <div className="bg-red-100 text-red-700 font-mono text-3xl font-bold px-6 py-3 rounded-xl shadow-md animate-pulse">
                    {formatTime(secondsLeft)}
                </div>

                {/* {sessionId} */}
            </div>


            <form onSubmit={handleSubmit}>

                <div className="w-full max-w-3xl mx-auto p-4" style={{ backgroundColor: "#ffffff", maxWidth: "1400px" }}>
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-lg">
                            <CardTitle className="text-2xl font-bold">세계유산축전 프로그램 참가신청서</CardTitle>
                            <CardDescription>프로그램 참가를 위한 신청서를 작성해 주세요</CardDescription>
                        </CardHeader>

                        <CardContent className="pt-6 space-y-8">
                            {/* 동의 사항 */}
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="terms"
                                        checked={agreed}
                                        onCheckedChange={(checked) => setAgreed(!!checked)}
                                        className="mt-1"
                                    />&nbsp;

                                    <div>
                                        <Label htmlFor="terms" className="font-medium text-base">
                                            개인정보 수집 및 이용 동의
                                        </Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            신청을 진행하기 위해 아래 정보를 수집하며, 수집된 정보는 신청 목적 이외의 용도로 사용되지 않습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                                        <input type="text" name="wr_name" id="wr_name" onChange={handleChange} className="w_form_input" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="applicant-age">
                                            <User className="mr-1 h-4 w-4" />
                                            나이
                                        </Label>
                                        <input type="text" name="wr_age" id="wr_age" onChange={handleChange} className="w_form_input" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="wr_gender">
                                            <User className="mr-1 h-4 w-4" />
                                            성별
                                        </Label>
                                        <select
                                            name="wr_gender"
                                            className="w_form_input"
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">성별 선택</option>
                                            {Object.entries(WR_GENDER_ARR).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="wr_address" className="flex items-center">
                                            <MapPin className="mr-1 h-4 w-4" />
                                            주소(<span className="text-red-500">동까지만 작성해주세요</span>)
                                        </Label>
                                        <input type="text" name="wr_address" id="wr_address" onChange={handleChange} className="w_form_input" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="wr_email" className="flex items-center">
                                            <Mail className="mr-1 h-4 w-4" />
                                            이메일(<span className="text-red-500">예약확인에 필요하니 정확히 작성해주세요</span>)
                                        </Label>
                                        <input type="text" name="wr_email" id="wr_email" onChange={handleChange} className="w_form_input" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="wr_tel" className="flex items-center">
                                            <Phone className="mr-1 h-4 w-4" />
                                            전화번호(<span className="text-red-500">예약확인에 필요하니 정확히 작성해 주세요</span>)
                                        </Label>
                                        <input type="text" name="wr_tel" id="wr_tel" value={formData.wr_tel} onChange={handleChange} className="w_form_input" maxLength={11} placeholder="'-'생략 숫자만 입력" required />
                                    </div>
                                </div>
                            </div>

                            {/* 전송 정보 hidden */}
                            <input type="hidden" name="wr_loginok" id="wr_loginok" className="w_form_input" value={userName} readOnly />{/* 로그인 유무 확인 */}
                            <input type="hidden" name="wr_tourdate" id="wr_tourdate" className="w_form_input" value={formData.wr_tourdate} readOnly />
                            <input type="hidden" name="wr_shopcode" id="wr_shopcode" className="w_form_input" value={formData.wr_shopcode} readOnly />
                            <input type="hidden" name="wr_shopnm" id="wr_shopnm" className="w_form_input" value={formData.wr_shopnm} readOnly />
                            <input type="hidden" name="wr_optcode" id="wr_optcode" className="w_form_input" value={formData.wr_optcode} readOnly />
                            <input type="hidden" name="wr_optnm" id="wr_optnm" className="w_form_input" value={formData.wr_optnm} readOnly />
                            <input type="hidden" name="wr_totinwon" id="wr_totinwon" className="w_form_input" value={formData.wr_totinwon} readOnly />
                            <input type="hidden" name="wr_price" id="wr_price" className="w_form_input" value={formData.wr_price} readOnly />
                            <input type="hidden" name="wr_totprice" id="wr_totprice" className="w_form_input" value={formData.wr_totprice} readOnly />

                            {/* 참가자 정보 */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                        <Users className="mr-2 h-5 w-5 text-primary" />
                                        <h2 className="text-xl font-semibold">참가자 정보</h2>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="applicant-participating"
                                            checked={isSelfParticipant}
                                            onCheckedChange={(checked) => {
                                                const isChecked = !!checked;
                                                setIsSelfParticipant(isChecked);

                                                // 본인 정보 복사
                                                if (isChecked) {
                                                    setParticipants((prev) => {
                                                        const newParticipants = [...prev];
                                                        newParticipants[0] = {
                                                            name: formData.wr_name,
                                                            age: formData.wr_age,
                                                            gender: formData.wr_gender,
                                                            address: formData.wr_address,
                                                            email: formData.wr_email,
                                                            tel: formData.wr_tel,
                                                        };
                                                        return newParticipants;
                                                    });
                                                }
                                            }}
                                        />
                                        <Label htmlFor="applicant-participating">본인 참가</Label>
                                    </div>
                                </div>
                                <Separator className="mb-4 bg-gray-300 dark:bg-gray-600" />

                                {/* 참가자 선택 버튼 */}


                                {/* 참가자 1 */}
                                {participants.map((participant, index) => (
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
                                                <input type="text" name="name" value={participant.name} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" required />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="age">
                                                    <User className="mr-1 h-4 w-4" />
                                                    나이
                                                </Label>
                                                <input type="text" name="age" value={participant.age} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="wr_gender">
                                                    <User className="mr-1 h-4 w-4" />
                                                    성별
                                                </Label>
                                                <select
                                                    name="gender"
                                                    value={participant.gender}
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
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="flex items-center">
                                                    <MapPin className="mr-1 h-4 w-4" />
                                                    주소(<span className="text-red-500">동까지만 작성해주세요</span>)
                                                </Label>
                                                <input type="text" name="address" value={participant.address} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="tel" className="flex items-center">
                                                    <Phone className="mr-1 h-4 w-4" />
                                                    전화번호
                                                </Label>
                                                <input type="tel" name="tel" value={participant.tel} onChange={(e) => handleParticipantChange(index, e)} maxLength={11} placeholder="'-'생략 숫자만 입력" className="w_form_input" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 bg-muted/20 rounded-b-lg pt-6">
                            <button
                                disabled={!agreed}
                                className="w_btn_submit"
                            >
                                {agreed ? "신청서 제출하기" : "약관에 동의해 주세요"}
                            </button>

                            {!agreed && (
                                <p className="text-sm text-muted-foreground text-center">
                                    신청서를 제출하려면 개인정보 수집 및 이용에 동의해 주세요
                                </p>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </form>
        </div>
    );
}
