import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // .glsl / .vert / .frag を文字列として import できるようにする
    rules: {
      "*.glsl": { loaders: ["raw-loader"], as: "*.js" },
      "*.vert": { loaders: ["raw-loader"], as: "*.js" },
      "*.frag": { loaders: ["raw-loader"], as: "*.js" },
    },
  },
};

export default nextConfig;
