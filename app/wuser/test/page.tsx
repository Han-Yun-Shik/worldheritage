"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/form.css"; // 스타일 파일 import


export default function FormPage() {
    const [formData, setFormData] = useState({ name: "", email: "" });
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch("/api/wdm/test/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const result = await response.json();

            // localStorage에 데이터 저장
            localStorage.setItem("wuserData", JSON.stringify(result));

            // 쿼리 파라미터 없이 페이지 이동
            router.push("/wuser/testrs");
        } else {
            alert("Error submitting form");
        }
    };

    return (
        <div>
            <h1>Form Page</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="name" value={formData.name} className="w_form_input" onChange={handleChange} required />
                </label>
                <br />
                <label>
                    Email:
                    <input type="email" name="email" value={formData.email} className="w_form_input" onChange={handleChange} required />
                </label>
                <br />
                <button type="submit" className="w_btn_submit">Submit</button>
            </form>
        </div>
    );
}