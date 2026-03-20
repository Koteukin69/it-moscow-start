import type { NextConfig } from "next";

const GAME_CORS_ORIGIN = "https://storage.yandexcloud.net";

const GAME_CORS_HEADERS = [
  { key: "Access-Control-Allow-Origin", value: GAME_CORS_ORIGIN },
  { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/game/:path*",
        headers: GAME_CORS_HEADERS,
      },
    ];
  },
};

export default nextConfig;
