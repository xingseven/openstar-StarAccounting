import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const env = process.env;
const databaseUrl = env.DATABASE_URL || 'mysql://root:Admin123.@localhost:3306/xf_dashboard';

// Parse mysql://user:pass@host:port/db
const match = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!match) {
  console.error('Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

async function run() {
  const sqlPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../docs/完整数据库结构.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log(`Connecting to ${host}:${port}/${database}...`);

  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password,
    database,
    multipleStatements: true,
  });

  console.log('Executing SQL...');
  await connection.query(sql);
  console.log('Done!');

  await connection.end();
}

run().catch(console.error);
