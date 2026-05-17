const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Error: DATABASE_URL environment variable is missing!");
    process.exit(1);
  }

  console.log("Initializing database connection...");
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  console.log("Connected to PostgreSQL successfully.");

  const res = await client.query('SELECT 1 as alive');
  console.log("Ping query executed. Result:", res.rows);

  await client.end();
  console.log("Supabase Database is officially KEPT AWAKE! 🎉");
}

main().catch((err) => {
  console.error("Failed to connect and ping database:", err);
  process.exit(1);
});
