// lib/session.ts
import { SessionOptions } from "iron-session";

export type UserSession = {
  wr_id: string;
  wr_name: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "aworldh_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production", // HTTPS 환경만 secure
  },
};
