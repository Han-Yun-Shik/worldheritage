"use client";

import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
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

    //--##### Search arg s #####--//
    const searchParams = useSearchParams();
    const shopcode = searchParams.get("shopcode") || "";
    const currentPage = searchParams.get("currentPage") || "1";
    const backToListUrl = `/wdm/optlist?shopcode=${shopcode}&currentPage=${currentPage}`;
    //--##### Search arg e #####--//

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
                <div className="w_con_title">여행상품 수정</div>
                <div style={{ textAlign: "right" }}>
                    <button onClick={handleSubmit} className="btn btn-secondary">수정</button>&nbsp;
                    <button type="button" onClick={() => router.push(backToListUrl)} className="btn btn-secondary">
                        목록
                    </button>
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
