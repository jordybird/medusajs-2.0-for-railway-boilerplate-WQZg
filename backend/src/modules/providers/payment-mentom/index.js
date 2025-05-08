/**
 * Mentom payment-provider loader
 * – Uses ts-node while you `pnpm dev`
 * – Uses pre-built JS after `pnpm build`
 */
if (process.env.NODE_ENV === "production") {
    // 1️⃣  compiled file produced by `tsc -p tsconfig.build.json`
    module.exports = require("./dist/index.js").default;
  } else {
    // 2️⃣  live-compile in development
    require("ts-node/register");
    module.exports = require("./src/index.ts").default;
  }
  