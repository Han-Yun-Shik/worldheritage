"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/form.css"; // 스타일 파일 import

export default function Memwrite() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        wr_id: "",
        wr_pw: "",
        wr_name: "",
        wr_level: "",
    });
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append("wr_id", formData.wr_id);
        data.append("wr_pw", formData.wr_pw);
        data.append("wr_name", formData.wr_name);
        data.append("wr_level", formData.wr_level);

        try {
            const response = await axios.post("/api/wdm/memwrite", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            // ✅ "아이디 존재" 메시지가 아니라면 이동
            if (response.data.message == "아이디가 이미 존재합니다.") {
                setMessage("아이디가 이미 존재합니다.");
            } else {
                router.push("/wdm/memlist");
            }

        } catch (error: any) {
            if (error.response?.status === 409) {
                setMessage("❗ 아이디가 이미 존재합니다.");
            } else {
                console.error("데이터 전송 실패:", error);
                setMessage("데이터 전송 실패");
            }
        }
    };

    return (
        <div>
            <div className="w_con_navi_wrap">
                <div className="w_con_title">회원관리</div>
                <div style={{ textAlign: "right" }}>
                    <button onClick={handleSubmit} className="btn btn-secondary">등록</button>&nbsp;
                    <Link href="/wdm/memlist" className="btn btn-secondary">목록</Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 bg-white rounded-lg shadow">
                <div>
                    <label htmlFor="wr_id" className="block text-sm font-medium text-gray-700">아이디</label>
                    <input
                        type="text"
                        name="wr_id"
                        id="wr_id"
                        onChange={handleChange}
                        className="w_form_input"
                        value={formData.wr_id}
                    />
                    {message && <p style={{color:"#ff0000"}}>{message}</p>}
                </div>
                <div>
                    <label htmlFor="wr_pw" className="block text-sm font-medium text-gray-700">비밀번호</label>
                    <input
                        type="text"
                        name="wr_pw"
                        id="wr_pw"
                        onChange={handleChange}
                        className="w_form_input"
                        value={formData.wr_pw}
                    />
                </div>
                <div>
                    <label htmlFor="wr_name" className="block text-sm font-medium text-gray-700">이름</label>
                    <input
                        type="text"
                        name="wr_name"
                        id="wr_name"
                        onChange={handleChange}
                        className="w_form_input"
                        value={formData.wr_name}
                    />
                </div>
                <div>
                    <label htmlFor="wr_level" className="block text-sm font-medium text-gray-700">레벨</label>
                    <select
                        name="wr_level"
                        id="wr_level"
                        onChange={handleChange}
                        className="w_form_input"
                        value={formData.wr_level}
                    >
                        <option value="">선택하세요</option>
                        {[1, 2, 3, 4, 5].map((level) => (
                            <option key={level} value={level}>
                                {level}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
                    >
                        전송
                    </button>
                </div>

            </form>
        </div>
    );
}
