// components/Navi.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navi() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/wdm/session");
        const data = await res.json();
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUserName(data.user.wr_name);
        } else {
          setIsLoggedIn(false);
          setUserName("");
        }
      } catch (err) {
        console.error("세션 확인 실패:", err);
      }
    }

    const fetchSession = async () => {
      const res = await fetch("/api/session/init", {
        method: "GET",
        credentials: "include", // ✅ 쿠키 포함 필수
      });
      const data = await res.json();
      setSessionId(data.session_id);
    };

    checkSession();
    fetchSession();
  }, []);

  const logout = async () => {
    await fetch("/api/wdm/logout", { method: "POST" });
    setIsLoggedIn(false);
    setUserName("");
    router.push("/");
  };

  return (
    <div className="w_u_navi_wrap">
      <Link href="/" className="w_t_btn">Home</Link>
      <Link href="/wuser/plogin" className="w_t_btn">예약확인</Link>
      <Link href="/wdm/slist" className="w_t_btn">관리설정</Link>
      {isLoggedIn ? (
        <>
          <span>{userName}님 환영합니다.</span>
          <button type="button" onClick={logout} className="w_t_btn">로그아웃</button>
        </>
      ) : (
        <>
          <Link href="/wuser/alogin" className="w_t_btn">로그인</Link>
        </>
      )}
      당신의 방문자 ID: {sessionId}
    </div>
  );
}
