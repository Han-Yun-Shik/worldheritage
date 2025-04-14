"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/form.css";
import Navi from "@/components/Navi";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface PloginData {
    wr_email: string;
    wr_tel: string;
}

export default function Plogin() {
    const router = useRouter();
    const [formData, setFormData] = useState<PloginData>({ wr_email: "", wr_tel: "" });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = name === "wr_tel" ? value.replace(/\D/g, "") : value;

        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(""); // 기존 메시지 초기화

        try {
            const res = await axios.post(`/api/wdm/plogin`, formData);

            if (res.data.length > 0) {
                setMessage("인증 성공! 예약 목록으로 이동합니다.");

                // localStorage에 인증 정보 저장
                localStorage.setItem("ploginData", JSON.stringify(formData));

                // 예약 목록 페이지로 이동
                router.push("/wuser/plist");
            } else {
                setMessage("일치하는 예약 정보가 없습니다.");
            }
        } catch (error) {
            console.error("로그인 오류 발생:", error);
            setMessage("로그인 실패. 다시 시도해주세요.");
        }
    };

    return (
        <div>
            <Navi />
            <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-md">

                    <Card className="w-full max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle className="text-2xl">로그인</CardTitle>
                            <CardDescription>이메일과 연락처를 입력하여 계정에 로그인하세요.</CardDescription>
                            {message && <p>{message}</p>}
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">이메일</Label>
                                    <input
                                        type="text"
                                        name="wr_email"
                                        id="wr_email"
                                        value={formData.wr_email}
                                        onChange={handleChange}
                                        className="w_form_input"
                                        placeholder="example@example.com" 
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact">연락처</Label>
                                    <input
                                        type="text"
                                        name="wr_tel"
                                        id="wr_tel"
                                        value={formData.wr_tel}
                                        onChange={handleChange}
                                        className="w_form_input"
                                        maxLength={11}
                                        placeholder="'-'생략 숫자만 입력" 
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "처리 중..." : "로그인"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    );
}
