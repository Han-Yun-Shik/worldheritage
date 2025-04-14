"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "@/styles/form.css"; // 스타일 파일 import

export default function Swrite() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        wr_shopnm: "",
        wr_intro: "",
        wr_content: "",
        wr_price: "",
        addfile1: null,
    });
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, files } = e.target as HTMLInputElement;
    
        setFormData((prev) => {
            return {
                ...prev,
                [name]: files ? files[0] : value,
            };
        });
    };
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append("wr_shopnm", formData.wr_shopnm);
        data.append("wr_intro", formData.wr_intro);
        data.append("wr_content", formData.wr_content);
        data.append("wr_price", formData.wr_price);
        if (formData.addfile1) data.append("addfile1", formData.addfile1);

        try {
            const response = await axios.post("/api/wdm/swrite", data, {
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

    return (
        <div>
            <h1>상품 등록</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="wr_name">상품명:</label>
                    <input
                        type="text"
                        name="wr_shopnm"
                        id="wr_shopnm"
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
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>
                <div>
                    <label htmlFor="wr_content">상세소개:</label>
                    <textarea
                        name="wr_content"
                        id="wr_intro"
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>
                <div>
                    <label htmlFor="wr_name">금액:</label>
                    <input
                        type="number"
                        name="wr_price"
                        id="wr_price"
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>
                <div>
                    <label htmlFor="addfile1">이미지: </label>
                    <input type="file" name="addfile1" id="addfile1" onChange={handleChange} className="w_form_file" />
                </div>
                <button type="submit" className="w_btn_submit">전송</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}