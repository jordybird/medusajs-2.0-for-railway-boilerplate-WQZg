import { loadEnv } from "@medusajs/framework/utils"
import { assertValue } from "utils/assert-value"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

/* ───────── Basics ───────── */
export const IS_DEV = process.env.NODE_ENV === "development"
export const BACKEND_URL =
  process.env.BACKEND_PUBLIC_URL ??
  process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ??
  "http://localhost:9000"

/* ───────── Database / Redis ───────── */
export const DATABASE_URL = assertValue(
  process.env.DATABASE_URL,
  "Environment variable DATABASE_URL is not set"
)
export const REDIS_URL = process.env.REDIS_URL

/* ───────── HTTP / Auth ───────── */
export const ADMIN_CORS = process.env.ADMIN_CORS
export const AUTH_CORS = process.env.AUTH_CORS
export const STORE_CORS = process.env.STORE_CORS
export const JWT_SECRET = assertValue(
  process.env.JWT_SECRET,
  "Environment variable JWT_SECRET is not set"
)
export const COOKIE_SECRET = assertValue(
  process.env.COOKIE_SECRET,
  "Environment variable COOKIE_SECRET is not set"
)

/* ───────── File storage (MinIO) ───────── */
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
export const MINIO_BUCKET = process.env.MINIO_BUCKET // defaults to “medusa-media” if empty

/* ───────── Email (Resend / SendGrid) ───────── */
export const RESEND_API_KEY = process.env.RESEND_API_KEY
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL

/* ───────── Stripe (card) ───────── */
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

/* ───────── Mentom (card) ───────── */
export const MENTOM_API_KEY        = process.env.MENTOM_API_KEY
export const MENTOM_TERMINAL_ID    = process.env.MENTOM_TERMINAL_ID
export const MENTOM_WEBHOOK_SECRET = process.env.MENTOM_WEBHOOK_SECRET
export const MENTOM_CAPTURE        = process.env.MENTOM_CAPTURE === "true" // optional flag
export const MENTOM_BASE_URL       = process.env.MENTOM_BASE_URL           // sandbox override

/* ───────── Search (Meilisearch) ───────── */
export const MEILISEARCH_HOST      = process.env.MEILISEARCH_HOST
export const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY

/* ───────── Misc ───────── */
export const WORKER_MODE =
  (process.env.MEDUSA_WORKER_MODE as "worker" | "server" | "shared" | undefined) ??
  "shared"
export const SHOULD_DISABLE_ADMIN = process.env.MEDUSA_DISABLE_ADMIN === "true"
