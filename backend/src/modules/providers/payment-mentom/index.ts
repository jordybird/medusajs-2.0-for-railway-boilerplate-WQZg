/**
 * Mentom provider entry-point (TypeScript version).
 *
 * ─ dev  : we register ts-node on the fly and load the real sources in ./src
 * ─ prod : the build step has already produced ./dist/**, so we load that
 */
let mod: unknown

try {
  // ⬅️ production build – dist/index.js exists
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mod = require("./src/index.js") // Corrected path for compiled code in Medusa build output
} catch {
  // ⬅️ local dev / CI – fall back to ts-node
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("ts-node/register")
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mod = require("./src/index.ts")
}

export = mod
