// lib/session.ts
import { SessionOptions } from "iron-session";

export type UserSession = {
  wr_id: string;
  wr_name: string;
};

// ✅ 모든 세션 데이터 타입 정의
export type SessionData = {
  user?: UserSession;
  session_id?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "aworldh_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",          // 🧩 안정성 향상
    httpOnly: true,
    path: "/",                // ✅ 모든 경로에서 쿠키 적용되도록 설정
  },
};

// ✅ iron-session 타입 확장
declare module "iron-session" {
  interface IronSessionData extends SessionData {}
}
