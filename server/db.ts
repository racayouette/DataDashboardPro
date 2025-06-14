import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Support both PostgreSQL and development environments
let db: any;
let pool: Pool | undefined;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Production PostgreSQL connection
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
  db = drizzle(pool, { schema });
} else if (process.env.DATABASE_URL) {
  // Development PostgreSQL connection
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  // Fallback for development without database
  console.warn('No DATABASE_URL found, using mock database for development');
  db = null;
  pool = undefined;
}

export { db, pool };