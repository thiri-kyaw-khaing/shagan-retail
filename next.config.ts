import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Product, combo and payment-QR images are uploaded through Server
      // Functions. The pickers allow up to 5MB; the default limit is 1MB.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
