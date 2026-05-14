import type { NextConfig } from "next";

const GAME_CORS_ORIGIN = "https://storage.yandexcloud.net";

const GAME_CORS_HEADERS = [
  { key: "Access-Control-Allow-Origin", value: GAME_CORS_ORIGIN },
  { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://yandex.ru/**")],
  },
  async headers() {
    return [
      {
        source: "/api/game/:path*",
        headers: GAME_CORS_HEADERS,
      },
      {
        source: "/Game/Build/:path*.wasm.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
      {
        source: "/Game/Build/:path*.js.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/Game/Build/:path*.data.br",
        headers: [
          { key: "Content-Encoding", value: "br" },
          { key: "Content-Type", value: "application/octet-stream" },
        ],
      },
    ];
  },
};

export default nextConfig;
