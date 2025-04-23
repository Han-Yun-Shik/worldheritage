"use client";

import axios from "axios";
import { useRouter, useParams } from "next/navigation";
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
        data.append("wr_include", formData.wr_include);
        data.append("wr_noinclude", formData.wr_noinclude);
        data.append("wr_note", formData.wr_note);
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
            <div className="w_con_navi_wrap">
                <div className="w_con_title">여행상품 수정</div>
                <div style={{ textAlign: "right" }}>
                    <Link href="/wdm/swrite" className="btn btn-secondary">수정</Link>&nbsp;
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
                    <label htmlFor="wr_content" className="block text-sm font-medium text-gray-700">상세소개</label>
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
                    <label htmlFor="wr_include" className="block text-sm font-medium text-gray-700">포함사항</label>
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
