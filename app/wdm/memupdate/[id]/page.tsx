"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/form.css"; // 스타일 파일 import


export default function Memupdate() {
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        wr_id: "",
        wr_pw: "",
        wr_name: "",
        wr_level: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const backToListUrl = `/wdm/memlist`;

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`/api/wdm/memread?id=${id}`); // ✅ 쿼리 파라미터 방식으로 수정
                if (res.data && res.data.length > 0) {
                    const user = res.data[0];
                    user.wr_pw = ""; // 기존 비밀번호는 표시하지 않음
                    setFormData(user);
                }
            } catch (error) {
                console.error("데이터 불러오기 오류:", error);
            } finally {
                setLoading(false);
            }
        }
    
        if (id) fetchData();
    }, [id]);

    console.log("formData: ", formData)

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
        data.append("wr_pw", formData.wr_pw); // 빈 문자열일 수 있음
        data.append("wr_name", formData.wr_name);
        data.append("wr_level", formData.wr_level);

        try {
            const response = await axios.put(`/api/wdm/memedit?id=${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage(response.data.message);
            // ✅ 저장 후 목록으로 리디렉션
            router.push(backToListUrl);
        } catch (error) {
            console.error("데이터 전송 실패:", error);
            setMessage("데이터 전송 실패");
        }
    };

    if (loading) {
        return <p>로딩 중...</p>;
    }

    return (
        <div>
            <div className="w_con_navi_wrap">
                <div className="w_con_title">회원관리</div>
                <div style={{ textAlign: "right" }}>
                    <button onClick={handleSubmit} className="btn btn-secondary">수정</button>&nbsp;
                    <Link href="/wdm/memlist" className="btn btn-secondary">목록</Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 bg-white rounded-lg shadow">
                <div>
                    <label htmlFor="wr_id" className="block text-sm font-medium text-gray-700">아이디</label>
                    <p className="font-bold">{formData.wr_id}</p>
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
                    <span style={{color:"#ff0000"}}>※ 수정시에만 입력하십시오.</span>
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
                        수정
                    </button>
                </div>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}
