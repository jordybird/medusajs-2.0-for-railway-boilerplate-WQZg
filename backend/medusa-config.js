import { loadEnv, Modules, defineConfig } from "@medusajs/utils"
import {
  /* core */
  ADMIN_CORS, AUTH_CORS, STORE_CORS,
  BACKEND_URL, COOKIE_SECRET, DATABASE_URL, JWT_SECRET,
  REDIS_URL, WORKER_MODE,
  /* file / email / search */
  MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET,
  RESEND_API_KEY, RESEND_FROM_EMAIL,
  MEILISEARCH_HOST, MEILISEARCH_ADMIN_KEY,
  /* Stripe */
  STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET,
  /* Mentom */
  MENTOM_API_KEY, MENTOM_TERMINAL_ID,
  MENTOM_WEBHOOK_SECRET, MENTOM_CAPTURE, MENTOM_BASE_URL,
  /* misc */
  SHOULD_DISABLE_ADMIN,
} from "lib/constants"

loadEnv(process.env.NODE_ENV, process.cwd())

/* ---------------------------------------------------- */
/* Payment provider array (Stripe, Mentom if configured) */
/* ---------------------------------------------------- */
const paymentProviders = []

if (STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET) {
  paymentProviders.push({
    resolve: "@medusajs/payment-stripe",
    id: "stripe",
    options: { apiKey: STRIPE_API_KEY, webhookSecret: STRIPE_WEBHOOK_SECRET },
  })
}

if (MENTOM_API_KEY && MENTOM_TERMINAL_ID) {
  paymentProviders.push({
    resolve: "./src/modules/providers/payment-mentom",
    id: "mentom",
    options: {
      apiKey:        MENTOM_API_KEY,
      terminalId:    Number(MENTOM_TERMINAL_ID),
      webhookSecret: MENTOM_WEBHOOK_SECRET,
      capture:       MENTOM_CAPTURE,        // true = /sale, false = /auth + /capture
      baseUrl:       MENTOM_BASE_URL,       // optional sandbox host
    },
  })
}

const medusaConfig = {
  /* ───────── Core project config ───────── */
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: false,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
  },

  admin: { backendUrl: BACKEND_URL, disable: SHOULD_DISABLE_ADMIN },

  /* ───────── Modules array ───────── */
  modules: [
    /* ----- File storage (local or MinIO) ----- */
    {
      key: Modules.FILE,
      resolve: "@medusajs/file",
      options: {
        providers:
          MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY
            ? [
                {
                  resolve: "./src/modules/minio-file",
                  id: "minio",
                  options: {
                    endPoint: MINIO_ENDPOINT,
                    accessKey: MINIO_ACCESS_KEY,
                    secretKey: MINIO_SECRET_KEY,
                    bucket: MINIO_BUCKET,
                  },
                },
              ]
            : [
                {
                  resolve: "@medusajs/file-local",
                  id: "local",
                  options: {
                    upload_dir: "static",
                    backend_url: `${BACKEND_URL}/static`,
                  },
                },
              ],
      },
    },

    /* ----- Event bus & workflow (Redis) ----- */
    ...(REDIS_URL
      ? [
          {
            key: Modules.EVENT_BUS,
            resolve: "@medusajs/event-bus-redis",
            options: { redisUrl: REDIS_URL },
          },
          {
            key: Modules.WORKFLOW_ENGINE,
            resolve: "@medusajs/workflow-engine-redis",
            options: { redis: { url: REDIS_URL } },
          },
        ]
      : []),

    /* ----- Notification (Resend) ----- */
    ...(RESEND_API_KEY && RESEND_FROM_EMAIL
      ? [
          {
            key: Modules.NOTIFICATION,
            resolve: "@medusajs/notification",
            options: {
              providers: [
                {
                  resolve: "./src/modules/email-notifications",
                  id: "resend",
                  options: {
                    channels: ["email"],
                    api_key: RESEND_API_KEY,
                    from: RESEND_FROM_EMAIL,
                  },
                },
              ],
            },
          },
        ]
      : []),

    /* ----- Payment module (Stripe + Mentom) ----- */
    ...(paymentProviders.length
      ? [
          {
            key: Modules.PAYMENT,
            resolve: "@medusajs/payment",
            options: { providers: paymentProviders },
          },
        ]
      : []),
  ],

  /* ───────── Plugins array ───────── */
  plugins: [
    ...(MEILISEARCH_HOST && MEILISEARCH_ADMIN_KEY
      ? [
          {
            resolve: "@rokmohar/medusa-plugin-meilisearch",
            options: {
              config: { host: MEILISEARCH_HOST, apiKey: MEILISEARCH_ADMIN_KEY },
              settings: {
                products: {
                  indexSettings: {
                    searchableAttributes: [
                      "title",
                      "description",
                      "variant_sku",
                    ],
                    displayedAttributes: [
                      "id",
                      "title",
                      "description",
                      "variant_sku",
                      "thumbnail",
                      "handle",
                    ],
                  },
                  primaryKey: "id",
                },
              },
            },
          },
        ]
      : []),
  ],
}

console.log(JSON.stringify(medusaConfig, null, 2))
export default defineConfig(medusaConfig)
