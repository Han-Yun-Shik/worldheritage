"use client";

import axios from "axios";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/form.css"; // 스타일 파일 import

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    wr_include: string;
    wr_noinclude: string;
    wr_note: string;
    wr_price: number;
    wr_maxinwon: number;
    wr_days: string;
    wr_ey: string;
    wr_em: string;
    wr_ed: string;
    wr_eh: string;
    wr_ei: string;
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
        wr_include: "",
        wr_noinclude: "",
        wr_note: "",
        wr_price: 0,
        wr_maxinwon: 0,
        wr_days: "",
        wr_ey: "",
        wr_em: "",
        wr_ed: "",
        wr_eh: "",
        wr_ei: "",
        files: [],
    });

    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    //--# 마감일 s #--//
    const [years, setYears] = useState<string[]>([]);
    const [months, setMonths] = useState<string[]>([]);
    const [days, setDays] = useState<string[]>([]);
    const [sigans, setSigans] = useState<string[]>([]);
    const [buns, setBuns] = useState<string[]>([]);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const yearOptions = Array.from({ length: 2 }, (_, i) => String(currentYear + i));
        setYears(yearOptions);

        const monthOptions = Array.from({ length: 12 }, (_, i) =>
            String(i + 1).padStart(2, '0')
        );
        setMonths(monthOptions);

        const dayOptions = Array.from({ length: 31 }, (_, i) =>
            String(i + 1).padStart(2, '0')
        );
        setDays(dayOptions);

        const siganOptions = Array.from({ length: 24 }, (_, i) =>
            String(i + 0).padStart(2, '0')
        );
        setSigans(siganOptions);

        const bunOptions = Array.from({ length: 60 }, (_, i) =>
            String(i + 0).padStart(2, '0')
        );
        setBuns(bunOptions);
    }, []);
    //--# 마감일 e #--//

    //--##### Search arg s #####--//
    const searchParams = useSearchParams();
    const shopnm = searchParams.get("shopnm") || "";
    const currentPage = searchParams.get("currentPage") || "1";
    const backToListUrl = `/wdm/slist?shopnm=${shopnm}&currentPage=${currentPage}`;
    //--##### Search arg e #####--//

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        data.append("wr_include", formData.wr_include);
        data.append("wr_noinclude", formData.wr_noinclude);
        data.append("wr_note", formData.wr_note);
        data.append("wr_price", formData.wr_price.toString());
        data.append("wr_maxinwon", formData.wr_maxinwon.toString());
        data.append("wr_days", formData.wr_days);
        data.append("wr_ey", formData.wr_ey);
        data.append("wr_em", formData.wr_em);
        data.append("wr_ed", formData.wr_ed);
        data.append("wr_eh", formData.wr_eh);
        data.append("wr_ei", formData.wr_ei);

        if (file) {
            data.append("addfile1", file);
        }

        try {
            const response = await axios.put(`/api/wdm/sedit?id=${id}`, data, {
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
                    <label htmlFor="wr_shopnm" className="block text-sm font-medium text-gray-700">상품명</label>
                    <input
                        type="text"
                        name="wr_shopnm"
                        id="wr_shopnm"
                        value={formData.wr_shopnm || ""}
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>

                <div>
                    <label htmlFor="wr_intro" className="block text-sm font-medium text-gray-700">간략소개</label>
                    <input
                        type="text"
                        name="wr_intro"
                        id="wr_intro"
                        value={formData.wr_intro || ""}
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>

                <div>
                    <label htmlFor="wr_content" className="block text-sm font-medium text-gray-700">가능 날짜 <span className="text-red-500">(형식: 2025-05-03,2025-05-25)</span></label>
                    <textarea
                        name="wr_days"
                        id="wr_days"
                        rows={10}
                        value={formData.wr_days || ""}
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>

                <div>
                    <label htmlFor="wr_eyear" className="block text-sm font-medium text-gray-700">마감일</label><br />
                    <select
                        name="wr_ey"
                        value={formData.wr_ey || ""}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">년도</option>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}년</option>
                        ))}
                    </select>&nbsp;
                    <select
                        name="wr_em"
                        value={formData.wr_em || ""}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">월</option>
                        {months.map((month) => (
                            <option key={month} value={month}>{month}월</option>
                        ))}
                    </select>&nbsp;
                    <select
                        name="wr_ed"
                        value={formData.wr_ed || ""}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">일</option>
                        {days.map((day) => (
                            <option key={day} value={day}>{day}일</option>
                        ))}
                    </select>&nbsp;
                    <select
                        name="wr_eh"
                        value={formData.wr_eh || ""}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">시</option>
                        {sigans.map((sigan) => (
                            <option key={sigan} value={sigan}>{sigan}시</option>
                        ))}
                    </select>&nbsp;
                    <select
                        name="wr_ei"
                        value={formData.wr_ei || ""}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">분</option>
                        {buns.map((bun) => (
                            <option key={bun} value={bun}>{bun}분</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="wr_content" className="block text-sm font-medium text-gray-700">상세소개 <span className="text-red-500">(only html)</span></label>
                    <textarea
                        name="wr_content"
                        id="wr_content"
                        rows={20}
                        value={formData.wr_content || ""}
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>

                <div>
                    <label htmlFor="wr_include" className="block text-sm font-medium text-gray-700">상품요약</label>
                    <textarea
                        name="wr_include"
                        id="wr_include"
                        value={formData.wr_include || ""}
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>
                <div>
                    <label htmlFor="wr_noinclude" className="block text-sm font-medium text-gray-700">불포함사항</label>
                    <textarea
                        name="wr_noinclude"
                        id="wr_noinclude"
                        value={formData.wr_noinclude || ""}
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>
                <div>
                    <label htmlFor="wr_note" className="block text-sm font-medium text-gray-700">유의사항</label>
                    <textarea
                        name="wr_note"
                        id="wr_note"
                        value={formData.wr_note || ""}
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>

                <div>
                    <label htmlFor="wr_price" className="block text-sm font-medium text-gray-700">금액</label>
                    <input
                        type="number"
                        name="wr_price"
                        id="wr_price"
                        value={formData.wr_price ?? 0}
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>

                <div>
                    <label htmlFor="wr_maxinwon" className="block text-sm font-medium text-gray-700">예약 가능 인원</label>
                    <input
                        type="number"
                        name="wr_maxinwon"
                        id="wr_maxinwon"
                        value={formData.wr_maxinwon ?? 0}
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>

                <div>
                    <label htmlFor="addfile1" className="block text-sm font-medium text-gray-700">이미지</label>
                    <input
                        type="file"
                        name="addfile1"
                        id="addfile1"
                        onChange={handleChange}
                        className="w_form_file"
                    />
                    <div className="mt-3">
                        {formData.files.length > 0 ? (
                            (() => {
                                const imageUrl = encodeURIComponent(`${API_BASE_URL}${formData.files[0].file_path}`);
                                return (
                                    <img
                                        src={`/api/wdm/image-proxy?url=${imageUrl}`}
                                        alt="Gallery Image"
                                        className="w-[300px] h-[300px] object-cover rounded-lg border mx-auto"
                                    />
                                );
                            })()
                        ) : (
                            <p className="text-gray-400">이미지 없음</p>
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
                    >
                        전송
                    </button>
                </div>

                {message && (
                    <p className="text-center text-green-600 text-sm">{message}</p>
                )}
            </form>


        </div>
    );
}
