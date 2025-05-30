"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import "@/styles/form.css"; // 스타일 파일 import

export default function Swrite() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        wr_shopnm: "",
        wr_intro: "",
        wr_content: "",
        wr_include: "",
        wr_noinclude: "",
        wr_note: "",
        wr_price: "",
        wr_maxinwon: "",
        wr_days: "",
        wr_ey: "",
        wr_em: "",
        wr_ed: "",
        wr_eh: "",
        wr_ei: "",
        addfile1: null,
    });
    const [message, setMessage] = useState("");
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        data.append("wr_include", formData.wr_include);
        data.append("wr_noinclude", formData.wr_noinclude);
        data.append("wr_note", formData.wr_note);
        data.append("wr_price", formData.wr_price);
        data.append("wr_maxinwon", formData.wr_maxinwon);
        data.append("wr_days", formData.wr_days);
        data.append("wr_ey", formData.wr_ey);
        data.append("wr_em", formData.wr_em);
        data.append("wr_ed", formData.wr_ed);
        data.append("wr_eh", formData.wr_eh);
        data.append("wr_ei", formData.wr_ei);
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
            <div className="w_con_navi_wrap">
                <div className="w_con_title">여행상품 등록</div>
                <div style={{ textAlign: "right" }}>
                    <button onClick={handleSubmit} className="btn btn-secondary">등록</button>&nbsp;
                    <Link href="/wdm/slist" className="btn btn-secondary">목록</Link>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-6 bg-white rounded-lg shadow">
                <div>
                    <label htmlFor="wr_shopnm" className="block text-sm font-medium text-gray-700">상품명</label>
                    <input
                        type="text"
                        name="wr_shopnm"
                        id="wr_shopnm"
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
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>
                <div>
                    <label htmlFor="wr_eyear" className="block text-sm font-medium text-gray-700">마감일</label><br />
                    <select
                        name="wr_ey"
                        value={formData.wr_ey}
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
                        value={formData.wr_em}
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
                        value={formData.wr_ed}
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
                        value={formData.wr_eh}
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
                        value={formData.wr_ei}
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
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>
                <div>
                    <label htmlFor="wr_include" className="block text-sm font-medium text-gray-700">포함사항</label>
                    <textarea
                        name="wr_include"
                        id="wr_include"
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>
                <div>
                    <label htmlFor="wr_noinclude" className="block text-sm font-medium text-gray-700">불포함사항</label>
                    <textarea
                        name="wr_noinclude"
                        id="wr_noinclude"
                        onChange={handleChange}
                        className="w_form_textarea"
                    />
                </div>
                <div>
                    <label htmlFor="wr_note" className="block text-sm font-medium text-gray-700">유의사항</label>
                    <textarea
                        name="wr_note"
                        id="wr_note"
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
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>
                <div>
                    <label htmlFor="addfile1" className="block text-sm font-medium text-gray-700">이미지 </label>
                    <input type="file" name="addfile1" id="addfile1" onChange={handleChange} className="w_form_file" />
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