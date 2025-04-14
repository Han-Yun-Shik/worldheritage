"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem("wuserData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      router.push("/wuser/test"); // 데이터 없으면 폼 페이지로 리디렉트
    }
  }, [router]);

  if (!userData) return <p>Loading...</p>;

  return (
    <div>
      <h1>Result Page</h1>
      <p><strong>Name:</strong> {userData.name}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <a href="/wuser/test">Go Back</a>
    </div>
  );
}