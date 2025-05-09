/**
 * backend/medusa-config.js
 * Clean, Mentom-only Medusa 2 configuration (no Stripe)
 */
import { loadEnv, Modules, defineConfig } from "@medusajs/utils"
import {
  /* core ─────────────────────────────────────────────── */
  ADMIN_CORS, AUTH_CORS, STORE_CORS,
  BACKEND_URL, COOKIE_SECRET, DATABASE_URL, JWT_SECRET,
  REDIS_URL, WORKER_MODE,
  /* file / email / search ─────────────────────────────── */
  MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET,
  RESEND_API_KEY, RESEND_FROM_EMAIL,
  MEILISEARCH_HOST, MEILISEARCH_ADMIN_KEY,
  /* Mentom payment ───────────────────────────────────── */
  MENTOM_API_KEY, MENTOM_TERMINAL_ID,
  MENTOM_WEBHOOK_SECRET, MENTOM_CAPTURE, MENTOM_BASE_URL,
  /* misc ──────────────────────────────────────────────── */
  SHOULD_DISABLE_ADMIN,
} from "lib/constants"

/* bring .env vars into process.env ---------------------- */
loadEnv(process.env.NODE_ENV, process.cwd())

/* ─────────────────────────────────────────────────────── */
/* Payment providers (✂️ Stripe deleted)                   */
/* ─────────────────────────────────────────────────────── */
const paymentProviders = []

if (MENTOM_API_KEY && MENTOM_TERMINAL_ID) {
  console.log("[MEDUSA_CONFIG] Attempting to register Mentom payment provider with options:", {
    apiKey: MENTOM_API_KEY ? 'SET' : 'NOT SET',
    terminalId: MENTOM_TERMINAL_ID,
    webhookSecret: MENTOM_WEBHOOK_SECRET ? 'SET' : 'NOT SET',
    capture: MENTOM_CAPTURE === 'true',
    baseUrl: MENTOM_BASE_URL || undefined,
  });
  paymentProviders.push({
    resolve: "./modules/providers/payment-mentom/index.js", // Path to the compiled plugin entry point after postBuild.js
    id     : "mentom",
    options: {
      apiKey       : MENTOM_API_KEY,
      terminalId   : Number(MENTOM_TERMINAL_ID),
      webhookSecret: MENTOM_WEBHOOK_SECRET,
      capture      : MENTOM_CAPTURE === 'true',   // Correctly interpret "true" or "false" string
      baseUrl      : MENTOM_BASE_URL || undefined,
    },
  })
} else {
  console.log("[MEDUSA_CONFIG] Mentom provider NOT registered due to missing MENTOM_API_KEY or MENTOM_TERMINAL_ID.");
}

/* ─────────────────────────────────────────────────────── */
/* Final Medusa config                                    */
/* ─────────────────────────────────────────────────────── */
const medusaConfig = {
  projectConfig: {
    databaseUrl    : DATABASE_URL,
    databaseLogging: false,
    redisUrl       : REDIS_URL,
    workerMode     : WORKER_MODE,
    http: {
      port        : Number(process.env.PORT || 8080),
      adminCors   : ADMIN_CORS,
      authCors    : AUTH_CORS,
      storeCors   : STORE_CORS,
      jwtSecret   : JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
  },

  admin: { backendUrl: BACKEND_URL, disable: SHOULD_DISABLE_ADMIN },

  modules: [
    /* File storage (MinIO ⇢ custom adapter, else local) */
    {
      key    : Modules.FILE,
      resolve: "@medusajs/file",
      options: {
        providers: MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY
          ? [{
              resolve: "./src/modules/minio-file", id: "minio",
              options: {
                endPoint : MINIO_ENDPOINT,
                accessKey: MINIO_ACCESS_KEY,
                secretKey: MINIO_SECRET_KEY,
                bucket   : MINIO_BUCKET,
              },
            }]
          : [{
              resolve: "@medusajs/file-local", id: "local",
              options: {
                upload_dir : "static",
                backend_url: `${BACKEND_URL}/static`,
              },
            }],
      },
    },

    /* Event-bus & workflows only when Redis is set */
    ...(REDIS_URL ? [
      { key: Modules.EVENT_BUS,      resolve: "@medusajs/event-bus-redis",      options: { redisUrl: REDIS_URL } },
      { key: Modules.WORKFLOW_ENGINE,resolve: "@medusajs/workflow-engine-redis",options: { redis: { url: REDIS_URL } } },
    ] : []),

    /* Email via Resend (optional) */
    ...(RESEND_API_KEY && RESEND_FROM_EMAIL ? [
      {
        key    : Modules.NOTIFICATION,
        resolve: "@medusajs/notification",
        options: {
          providers: [{
            resolve: "./src/modules/email-notifications", id: "resend",
            options: { channels: ["email"], api_key: RESEND_API_KEY, from: RESEND_FROM_EMAIL },
          }],
        },
      },
    ] : []),

    /* Mentom payment (only if vars present) */
    ...(paymentProviders.length ? [{
      key    : Modules.PAYMENT,
      resolve: "@medusajs/payment",
      options: { providers: paymentProviders },
    }] : []),
  ],

  plugins: [
    ...(MEILISEARCH_HOST && MEILISEARCH_ADMIN_KEY ? [{
      resolve: "@rokmohar/medusa-plugin-meilisearch",
      options: {
        config  : { host: MEILISEARCH_HOST, apiKey: MEILISEARCH_ADMIN_KEY },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: ["title", "description", "variant_sku"],
              displayedAttributes : ["id","title","description","variant_sku","thumbnail","handle"],
            },
            primaryKey: "id",
          },
        },
      },
    }] : []),
  ],
}

/* DEBUG_CONFIG=1 will pretty-print the object on boot */
if (process.env.DEBUG_CONFIG) console.log(JSON.stringify(medusaConfig, null, 2))

export default defineConfig(medusaConfig)
