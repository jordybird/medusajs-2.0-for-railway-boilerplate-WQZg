/** backend/src/loaders/port-log.ts
 *
 * Runs before Medusa starts.
 * • Logs the port Railway (or Heroku) injects.
 * • Forces Medusa to listen on that port.
 */
export default async (_: any = {}): Promise<void> => {
    const PORT = process.env.PORT || 9000      // fallback for local dev
    console.log("🚀  running on port", PORT)
  
    // Tell Medusa which port to bind
    process.env.MEDUSA_BACKEND_PORT = String(PORT)
  }
  