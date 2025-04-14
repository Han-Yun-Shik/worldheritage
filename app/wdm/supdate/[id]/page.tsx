"use client";

import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import "@/styles/form.css"; // 스타일 파일 import

interface FileData {
    file_seq: number;
    wr_code: string;
    file_path: string;
}

interface ShopData {
    wr_shopcode: string;
    wr_shopnm: string;
    wr_intro: string;
    wr_content: string;
    wr_price: number;
    files: FileData[];
}

export default function Sedit() {
    const router = useRouter();
    const { id } = useParams(); // URL에서 id 가져오기
    const [formData, setFormData] = useState<ShopData>({
        wr_shopcode: "",
        wr_shopnm: "",
        wr_intro: "",
        wr_content: "",
        wr_price: 0,
        files: [],
    });

    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`/api/wdm/sread?id=${id}`);
                if (res.data && res.data.length > 0) {
                    setFormData(res.data[0]); // 첫 번째 데이터 사용
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;

        if (files && files.length > 0) {
            setFile(files[0]);
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value || "", // 🔹 value가 null 또는 undefined이면 빈 문자열로 처리
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const data = new FormData();
        data.append("wr_shopnm", formData.wr_shopnm);
        data.append("wr_intro", formData.wr_intro);
        data.append("wr_content", formData.wr_content);
        data.append("wr_price", formData.wr_price.toString());
    
        if (file) {
            data.append("addfile1", file);
        }
    
        try {
            // ✅ 경로 수정 (PUT 요청 시 `/api/sedit?id=${id}`가 아닌 `/api/wdm/sedit?id=${id}`)
            const response = await axios.put(`/api/wdm/sedit?id=${id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            setMessage(response.data.message);
            router.push("/wdm/slist");
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
            <h1>상품 수정</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="wr_shopnm">상품명:</label>
                    <input
                        type="text"
                        name="wr_shopnm"
                        id="wr_shopnm"
                        value={formData.wr_shopnm || ""} // 🔹 null 방지
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>
                <div>
                    <label htmlFor="wr_intro">간략소개:</label>
                    <input
                        type="text"
                        name="wr_intro"
                        id="wr_intro"
                        value={formData.wr_intro || ""} // 🔹 null 방지
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>
                <div>
                    <label htmlFor="wr_content">상세소개:</label>
                    <textarea
                        name="wr_content"
                        id="wr_content"
                        value={formData.wr_content || ""} // 🔹 null 방지
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>
                <div>
                    <label htmlFor="wr_price">금액:</label>
                    <input
                        type="number"
                        name="wr_price"
                        id="wr_price"
                        value={formData.wr_price ?? 0} // 🔹 null 방지
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>
                <div>
                    <label htmlFor="addfile1">이미지:</label>
                    <input
                        type="file"
                        name="addfile1"
                        id="addfile1"
                        onChange={handleChange}
                        className="w_form_file"
                    />
                    {formData.files.length > 0 ? (
                        <img
                            src={`http://worldheritage.cafe24app.com${formData.files[0]?.file_path}`}
                            alt="상품 이미지"
                            style={{ width: "500px", height: "500px", objectFit: "cover" }}
                        />
                    ) : (
                        "이미지 없음"
                    )}
                </div>
                <button type="submit" className="w_btn_submit">전송</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}
