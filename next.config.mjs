/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
});

export default withPWA(nextConfig);
