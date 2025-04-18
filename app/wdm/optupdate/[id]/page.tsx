"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "@/styles/form.css"; // 스타일 파일 import

interface ShopData {
    wr_shopcode: string;
    wr_shopnm: string;
}

interface OptData {
    wr_shopcode: string,
    wr_optcode: string,
    wr_optnm: string,
    wr_inwon: number,
}

export default function Optwrite() {
    const router = useRouter();
    const { id } = useParams();
    const [shopData, setShopData] = useState<ShopData[]>([]);
    const [formData, setFormData] = useState({
        wr_shopcode: "",
        wr_optnm: "",
        wr_inwon: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`/api/wdm/optread?id=${id}`);
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
            const response = await axios.put(`/api/wdm/optedit?id=${id}`, data, {
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

    if (loading) {
        return <p>로딩 중...</p>;
    }

    return (
        <div>
            <h1>옵션 수정</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="wr_shopcode">상품명:</label>
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
                    <label htmlFor="wr_optnm">옵션명: </label>
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
                    <label htmlFor="wr_inwon">인원:</label>
                    <input
                        type="number"
                        name="wr_inwon"
                        id="wr_inwon"
                        onChange={handleChange}
                        className="w_form_input"
                        value={formData.wr_inwon}
                    />
                </div>
                <button type="submit" className="w_btn_submit">전송</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}
