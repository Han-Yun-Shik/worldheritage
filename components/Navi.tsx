// components/Navi.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/context/LoginContext";

export default function Navi() {
  const router = useRouter();
  const { isLoggedIn, userName, sessionId, logout } = useLogin();

  const handleLogout = async () => {
    await logout(); // context에 정의된 logout 호출
    router.push("/"); // ✅ 로그아웃 후 이동 (필요 시 /login 등으로 변경)
  };

  return (
    <div className="w_u_navi_wrap">
      <Link href="/" className="w_t_btn">홈</Link>
      <Link href="/wuser/plogin" className="w_t_btn">예약확인</Link>
      <Link href="/wdm/rsvlist" className="w_t_btn">관리설정</Link>
      {isLoggedIn ? (
        <>
          <span>{userName}님 환영합니다.</span>
          <button type="button" onClick={handleLogout} className="w_t_btn">로그아웃</button>
        </>
      ) : (
        <>
          <Link href="/wuser/alogin" className="w_t_btn">로그인</Link>
        </>
      )}
      {/* 당신의 방문자 ID: {sessionId} */}
    </div>
  );
}
