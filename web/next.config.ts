import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Las portadas se sirven desde el backend, que vive en la red privada
    // (localhost en desarrollo, servicio "api" en Docker). Next.js 16 bloquea
    // por defecto la optimización de imágenes en IPs privadas.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "api",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "web",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
