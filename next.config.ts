const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  experimental: { appDir: true },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "http://evaai-prod.eba-vdp6ezz3.us-east-1.elasticbeanstalk.com/api/:path*",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
