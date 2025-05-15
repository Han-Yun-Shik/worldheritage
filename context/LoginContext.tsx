// context/LoginContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface LoginContextType {
  isLoggedIn: boolean;
  userName: string;
  sessionId: string;
  logout: () => void;
}

const LoginContext = createContext<LoginContextType | null>(null);

export const LoginProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/session/init", { credentials: "include" });
      const data = await res.json();
      setSessionId(data.session_id || "");
    };

    const checkLogin = async () => {
      const res = await fetch("/api/wdm/session");
      const data = await res.json();
      if (data.isLoggedIn) {
        setIsLoggedIn(true);
        setUserName(data.user.wr_name);
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    fetchSession();
    checkLogin();
  }, []);

  const logout = async () => {
    await fetch("/api/wdm/logout", { method: "POST" });
    setIsLoggedIn(false);
    setUserName("");
  };

  return (
    <LoginContext.Provider value={{ isLoggedIn, userName, sessionId, logout }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext)!;
