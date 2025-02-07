import { Pool } from "pg";

// Create a single instance of the Pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  // max: process.env.DB_MAX_CLIENTS || 10, // Maximum number of clients in the pool
  // idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000, // Close idle clients after 30 seconds
  // connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000, // Return an error after 2 seconds if connection could not be established
});

export default pool;
