"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/form.css"; // 스타일 파일 import

interface ShopData {
    wr_shopcode: string;
    wr_shopnm: string;
}

export default function Optwrite() {
    const router = useRouter();
    const [shopData, setShopData] = useState<ShopData[]>([]);
    const [formData, setFormData] = useState({
        wr_shopcode: "",
        wr_optnm: "",
        wr_inwon: "",
    });
    const [message, setMessage] = useState("");

    // ashop 데이터 가져오기
    const fetchShopData = async () => {
        try {
            const res = await axios.get("/api/wdm/getashop");
            if (Array.isArray(res.data)) {
                setShopData(res.data);
            } else {
                console.error("데이터 형식이 올바르지 않습니다:", res.data);
            }
        } catch (error) {
            console.error("데이터 불러오기 오류:", error);
        }
    };

    useEffect(() => {
        fetchShopData();
    }, []);

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
        data.append("wr_shopcode", formData.wr_shopcode);
        data.append("wr_optnm", formData.wr_optnm);
        data.append("wr_inwon", formData.wr_inwon);

        try {
            const response = await axios.post("/api/wdm/optwrite", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage(response.data.message);
            router.push("/wdm/optlist");
        } catch (error) {
            console.error("데이터 전송 실패:", error);
            setMessage("데이터 전송 실패");
        }
    };

    return (
        <div>
            <div className="w_con_navi_wrap">
                <div className="w_con_title">여행옵션 등록</div>
                <div style={{ textAlign: "right" }}>
                    <button onClick={handleSubmit} className="btn btn-secondary">등록</button>&nbsp;
                    <Link href="/wdm/optlist" className="btn btn-secondary">목록</Link>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 bg-white rounded-lg shadow">
                <div>
                    <label htmlFor="wr_shopcode" className="block text-sm font-medium text-gray-700">상품명</label>
                    <select 
                        name="wr_shopcode" 
                        id="wr_shopcode" 
                        className="w_form_input" 
                        onChange={handleChange}
                        value={formData.wr_shopcode}
                    >
                        <option value="">선택해 주세요</option>
                        {shopData.map((item, index) => (
                            <option key={index} value={item.wr_shopcode}>
                                {item.wr_shopnm}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="wr_optnm" className="block text-sm font-medium text-gray-700">옵션명</label>
                    <input
                        type="text"
                        name="wr_optnm"
                        id="wr_optnm"
                        onChange={handleChange}
                        className="w_form_input"
                        value={formData.wr_optnm}
                    />
                </div>
                <div>
                    <label htmlFor="wr_inwon" className="block text-sm font-medium text-gray-700">인원</label>
                    <input
                        type="number"
                        name="wr_inwon"
                        id="wr_inwon"
                        onChange={handleChange}
                        className="w_form_input"
                        value={formData.wr_inwon}
                    />
                </div>
                
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
                    >
                        전송
                    </button>
                </div>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}
