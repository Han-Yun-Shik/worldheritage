"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "@/styles/form.css";

export default function Swritemm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        wr_shopnm: "",
        wr_intro: "",
        wr_content: "",
        wr_price: "",
    });
    const [files1, setFiles1] = useState<File[]>([]);
    const [files2, setFiles2] = useState<File[]>([]);
    const [message, setMessage] = useState("");

    // Dropzone for 첨부파일 1 (여러 개 업로드 가능)
    const onDropFile1 = useCallback((acceptedFiles: File[]) => {
        setFiles1((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }, []);

    const { getRootProps: getRootProps1, getInputProps: getInputProps1, isDragActive: isDragActive1 } = useDropzone({
        onDrop: onDropFile1,
        accept: {
            "image/*": [],
            "application/pdf": [],
            "application/vnd.ms-excel": [],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
            "application/x-hwp": [],
            "application/octet-stream": [],
        },
        multiple: true, // 여러 개 업로드 가능
    });

    // Dropzone for 첨부파일 2 (여러 개 업로드 가능)
    const onDropFile2 = useCallback((acceptedFiles: File[]) => {
        setFiles2((prevFiles) => [...prevFiles, ...acceptedFiles]);
    }, []);

    const { getRootProps: getRootProps2, getInputProps: getInputProps2, isDragActive: isDragActive2 } = useDropzone({
        onDrop: onDropFile2,
        accept: {
            "image/*": [],
            "application/pdf": [],
            "application/vnd.ms-excel": [],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
            "application/x-hwp": [],
            "application/octet-stream": [],
        },
        multiple: true, // 여러 개 업로드 가능
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append("wr_shopnm", formData.wr_shopnm);
        data.append("wr_intro", formData.wr_intro);
        data.append("wr_content", formData.wr_content);
        data.append("wr_price", formData.wr_price);

        files1.forEach((file) => data.append("addfiles1", file));
        files2.forEach((file) => data.append("addfiles2", file));

        try {
            const response = await axios.post("/api/wdm/swritemm", data, {
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
                    <label htmlFor="wr_shopnm">상품명:</label>
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
                        id="wr_content"
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
                        onChange={handleChange}
                        className="w_form_input"
                    />
                </div>

                {/* 첨부파일 1 */}
                <div>첨부파일 1</div>
                <div {...getRootProps1()} className="dropzone">
                    <input {...getInputProps1()} />
                    {isDragActive1 ? <p>파일을 여기로 놓아주세요...</p> : <p>파일을 업로드하세요</p>}
                </div>
                <div className="file-preview">
                    {files1.map((file, index) => (
                        <div key={index} className="file-item">
                            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                    ))}
                </div>

                {/* 첨부파일 2 */}
                <div>첨부파일 2</div>
                <div {...getRootProps2()} className="dropzone">
                    <input {...getInputProps2()} />
                    {isDragActive2 ? <p>파일을 여기로 놓아주세요...</p> : <p>파일을 업로드하세요</p>}
                </div>
                <div className="file-preview">
                    {files2.map((file, index) => (
                        <div key={index} className="file-item">
                            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                    ))}
                </div>

                <button type="submit" className="w_btn_submit">전송</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}
