import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "worldheritage.cafe24app.com",
        pathname: "/uploads/**", // 해당 디렉토리 하위 모든 이미지 허용
      },
    ],
  },
};

export default nextConfig;
