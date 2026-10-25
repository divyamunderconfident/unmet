import type { NextConfig } from "next";

// Static export: the site only reads JSON from public/data and never calls a model.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
