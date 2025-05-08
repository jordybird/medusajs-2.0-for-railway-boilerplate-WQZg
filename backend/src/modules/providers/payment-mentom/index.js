// Tiny shim so Node can require the TS provider
require("ts-node/register");
module.exports = require("./src/index.ts");
