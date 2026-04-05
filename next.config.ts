import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    appIsrStatus: false,
  },
  allowedDevOrigins: ["3000-cs-f06254f1-44e4-4f26-820c-02f0a6c124b7.cs-europe-west1-onse.cloudshell.dev"],
};

export default nextConfig;
