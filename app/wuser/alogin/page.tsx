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

interface AloginData {
    wr_id: string;
    wr_pw: string;
}

export default function Alogin() {
    const router = useRouter();
    const [formData, setFormData] = useState<AloginData>({ wr_id: "", wr_pw: "" });
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(""); // 기존 메시지 초기화

        try {
            const res = await axios.post(`/api/wdm/alogin`, formData);

            if (res.data.success) {
                setMessage("로그인 성공");
                window.location.href = "/"; // ✅ 페이지 강제 새로고침
            } else {
                setMessage("아이디 또는 비밀번호가 틀렸습니다.");
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
                            <CardDescription>아이디와 비밀번호를 입력하세요.</CardDescription>
                            {message && <p>{message}</p>}
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">아이디</Label>
                                    <input
                                        type="text"
                                        name="wr_id"
                                        id="wr_id"
                                        value={formData.wr_id}
                                        onChange={handleChange}
                                        className="w_form_input"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact">비밀번호</Label>
                                    <input
                                        type="text"
                                        name="wr_pw"
                                        id="wr_pw"
                                        value={formData.wr_pw}
                                        onChange={handleChange}
                                        className="w_form_input"
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w_btn_submit" disabled={isLoading}>
                                    {isLoading ? "처리 중..." : "확인"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </main>
        </div>
    );
}
