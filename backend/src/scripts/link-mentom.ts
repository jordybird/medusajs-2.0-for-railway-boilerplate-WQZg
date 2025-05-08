import { randomUUID } from "crypto"
import pg from "pg"

async function main() {
  const regionId = process.argv[2]

  if (!regionId) {
    console.error("❌  Pass the region_id as the only argument.")
    process.exit(1)
  }

  const { DATABASE_URL } = process.env
  if (!DATABASE_URL) {
    console.error("❌  DATABASE_URL env var missing")
    process.exit(1)
  }

  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()

  try {
    /** check if Mentom is already linked */
    const { rows } = await client.query(
      `SELECT 1
         FROM region_payment_provider
        WHERE region_id = $1
          AND payment_provider_id = 'mentom'
        LIMIT 1`,
      [regionId]
    )

    if (rows.length) {
      console.log("✔  Mentom already linked to region", regionId)
      return
    }

    /** otherwise insert it */
    await client.query(
      `INSERT INTO region_payment_provider
              (id, region_id, payment_provider_id)
       VALUES  ($1, $2, 'mentom')`,
      [randomUUID(), regionId]
    )

    console.log("✅  Mentom linked successfully to region", regionId)
  } catch (err) {
    console.error("❌  Failed to link provider:", err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()