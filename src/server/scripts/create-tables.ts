import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 从 .env 读取数据库配置
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    });
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:Admin123.@localhost:3306/xf_dashboard';
const match = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!match) {
  console.error('❌ DATABASE_URL 格式错误');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

async function createTables() {
  console.log(`\n🛠️  连接数据库: ${host}:${port}/${database}`);
  console.log('='.repeat(50));

  const connection = await mysql.createConnection({
    host,
    port: parseInt(port),
    user,
    password,
    multipleStatements: true,
  });

  // 创建数据库（如果不存在）
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await connection.query(`USE \`${database}\``);
  console.log('✅ 数据库连接成功\n');

  // 读取 SQL 文件
  const sqlPath = path.resolve(__dirname, '../../../docs/完整数据库结构.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // 执行 SQL
  console.log('📦 正在创建数据表...');
  await connection.query(sql);

  console.log('='.repeat(50));
  console.log('🎉 数据表创建完成！');
  console.log('='.repeat(50));

  await connection.end();
}

createTables().catch((err) => {
  console.error('❌ 创建失败:', err.message);
  process.exit(1);
});
