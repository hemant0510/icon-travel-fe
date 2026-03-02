import type { NextConfig } from "next";

// Validate critical environment variables at build time
const requiredEnvVars = [
  'AMADEUS_CLIENT_ID',
  'AMADEUS_CLIENT_SECRET',
  'AMADEUS_BASE_URL',
] as const;

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `❌ Missing required environment variables:\n${missingEnvVars.map(v => `  - ${v}`).join('\n')}\n\nPlease check your .env file.`
  );
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
