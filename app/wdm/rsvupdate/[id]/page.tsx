"use client";

import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import "@/styles/form.css"; // 스타일 파일 import
import { REGDATE_STR, WR_STATE_ARR, WR_GENDER_ARR } from "@/app/utils";

interface RsubData {
    wr_seq: number;
    wr_code: string;
    wr_name: string;
    wr_age: number;
    wr_gender: string;
    wr_address: string;
    wr_email: string;
    wr_tel: string;
}

interface RsvData {
    wr_seq: number;
    wr_code: string;
    wr_name: string;
    wr_age: number;
    wr_gender: string;
    wr_address: string;
    wr_email: string;
    wr_tel: number;
    wr_state: number;
    wr_regdate: string;
    wr_update: string;
    wr_shopnm: string;
    wr_optnm: string;
    wr_totinwon: number;
    wr_tourdate: string;
    wr_totprice: number;
    rsubdatas: RsubData[];
}

export default function Rsvedit() {
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState<RsvData | null>(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`/api/wdm/rsvread?id=${id}`);
                if (res.data && res.data.length > 0) {
                    setFormData(res.data[0]);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target;

        let newValue = value;

        // 전화번호 입력 시 숫자만 허용
        if (name === "wr_tel") {
            newValue = value.replace(/\D/g, ""); // 숫자가 아닌 문자 제거
        }

        setFormData({
            ...formData,
            [name]: name === "wr_state" ? Number(newValue) : newValue,
        });
    };

    const handleParticipantChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target;
        let newValue = value;

        // 참가자 전화번호 입력 시 숫자만 허용
        if (name === "wr_tel") {
            newValue = value.replace(/\D/g, "");
        }

        const updatedParticipants = formData.rsubdatas.map((participant, i) =>
            i === index ? { ...participant, [name]: newValue } : participant
        );
        setFormData({ ...formData, rsubdatas: updatedParticipants });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        try {
            const res = await axios.put(`/api/wdm/rsvedit?id=${id}`, formData);
            if (res.status === 200) {
                setMessage("수정이 완료되었습니다.");
                router.push("/wdm/rsvlist/");
            }
        } catch (error) {
            console.error("수정 중 오류 발생:", error);
            setMessage("수정 실패. 다시 시도해주세요.");
        }
    };

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (!formData) {
        return <p>데이터를 불러오지 못했습니다.</p>;
    }

    return (
        <div>
            <h1>예약 수정</h1>
            <form onSubmit={handleSubmit}>
                <h2>신청자 정보</h2>
                <label htmlFor="wr_name">예약상태:</label>
                <select
                    name="wr_state"
                    value={formData.wr_state}
                    className="w_form_input"
                    onChange={handleChange}
                >
                    <option value="">예약 상태 선택</option>
                    {Object.entries(WR_STATE_ARR).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>

                <label htmlFor="wr_name">이름:</label>
                <input type="text" name="wr_name" id="wr_name" value={formData.wr_name} onChange={handleChange} className="w_form_input" />

                <label htmlFor="wr_age">나이:</label>
                <input type="text" name="wr_age" id="wr_age" value={formData.wr_age} onChange={handleChange} className="w_form_input" />

                <label htmlFor="wr_gender">성별:</label>
                <select
                    name="wr_gender"
                    value={formData.wr_gender}
                    className="w_form_input"
                    onChange={handleChange}
                >
                    <option value="">성별 선택</option>
                    {Object.entries(WR_GENDER_ARR).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>

                <label htmlFor="wr_address">주소:</label>
                <input type="text" name="wr_address" id="wr_address" value={formData.wr_address} onChange={handleChange} className="w_form_input" />

                <label htmlFor="wr_email">이메일:</label>
                <input type="text" name="wr_email" id="wr_email" value={formData.wr_email} onChange={handleChange} className="w_form_input" />

                <label htmlFor="wr_tel">전화번호:</label>
                <input type="text" name="wr_tel" id="wr_tel" value={formData.wr_tel} onChange={handleChange} className="w_form_input" maxLength={11} placeholder="'-'생략 숫자만 입력" />

                <label htmlFor="wr_tourdate">예약 날짜:</label>
                <input type="text" name="wr_tourdate" id="wr_tourdate" value={formData.wr_tourdate} onChange={handleChange} className="w_form_input" />

                <label htmlFor="wr_shopnm">상품명:</label>
                <input type="text" name="wr_shopnm" id="wr_shopnm" value={formData.wr_shopnm} className="w_form_input" readOnly />

                <label htmlFor="wr_optnm">옵션명:</label>
                <input type="text" name="wr_optnm" id="wr_optnm" value={formData.wr_optnm} className="w_form_input" readOnly />

                <label htmlFor="wr_totinwon">예약인원:</label>
                <input type="text" name="wr_totinwon" id="wr_totinwon" value={formData.wr_totinwon} className="w_form_input" readOnly />

                <label htmlFor="wr_totprice">결제금액:</label>
                <input type="text" name="wr_totprice" id="wr_totprice" value={formData.wr_totprice} className="w_form_input" readOnly />

                <label htmlFor="wr_regdate">등록일:</label>
                {REGDATE_STR(formData.wr_regdate)}
                <label htmlFor="wr_update">수정일:</label>
                {REGDATE_STR(formData.wr_update)}

                <h2>참가자 정보</h2>
                {formData.rsubdatas.map((participant, index) => (
                    <div key={index}>
                        <h3>참가자 {index + 1}</h3>
                        <label>wr_seq:</label>
                        <input type="text" name="wr_seq" value={participant.wr_seq} className="w_form_input" readOnly />

                        <label>이름:</label>
                        <input type="text" name="wr_name" value={participant.wr_name} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />

                        <label>나이:</label>
                        <input type="text" name="wr_age" value={participant.wr_age} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />

                        <label>성별:</label>
                        <select
                            name="wr_gender"
                            value={participant.wr_gender}
                            className="w_form_input"
                            onChange={(e) => handleParticipantChange(index, e)}
                        >
                            <option value="">성별 선택</option>
                            {Object.entries(WR_GENDER_ARR).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <label>주소:</label>
                        <input type="text" name="wr_address" value={participant.wr_address} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />

                        <label>이메일:</label>
                        <input type="email" name="wr_email" value={participant.wr_email} onChange={(e) => handleParticipantChange(index, e)} className="w_form_input" />

                        <label>전화번호:</label>
                        <input type="tel" name="wr_tel" value={participant.wr_tel} onChange={(e) => handleParticipantChange(index, e)} maxLength={11} placeholder="'-'생략 숫자만 입력" className="w_form_input" />
                    </div>
                ))}

                <button type="submit" className="w_btn_submit">전송</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
}
