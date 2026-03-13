import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import argon2 from "argon2";
import fs from "fs";
import path from "path";

// 尝试加载 .env 文件 (简单的手动解析，为了不引入额外依赖)
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, "utf-8");
      envConfig.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      console.log("📄 已加载 .env 文件");
    }
  } catch (e) {
    console.warn("⚠️  无法加载 .env 文件:", e);
  }
}

// 独立实现 hashPassword，避免路径引用问题
async function hashPassword(password: string) {
  return argon2.hash(password);
}

loadEnv();
const prisma = new PrismaClient();

async function main() {
  console.log("🛠️  开始初始化数据库...");
  console.log(`   数据库连接串: ${process.env.DATABASE_URL || "未设置 (将导致失败)"}`);

  try {
    // 0. 生成 Prisma Client (确保 provider 正确)
    console.log("\n🔄 [0/3] 正在生成 Prisma Client (prisma generate)...");
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✅ Prisma Client 生成成功！");

    // 1. 同步数据库结构
    console.log("\n📦 [1/3] 正在创建/同步数据库表结构 (prisma db push)...");
    execSync("npx prisma db push", { stdio: "inherit" });
    console.log("✅ 数据库表结构同步完成！");
  } catch (error) {
    console.error("\n❌ 数据库初始化失败！");
    console.error("   可能的原因：");
    console.error("   1. MySQL 服务未启动 (请确保本地 MySQL 已启动，或 Docker 容器运行中)");
    console.error("   2. 数据库连接串配置错误 (请检查 src/server/.env 文件中的 DATABASE_URL)");
    console.error("   3. 密码错误 (Access denied for user 'root')");
    // 如果是 generate 失败，后续也无法运行，所以这里可以退出
    // 但为了让用户看到错误，我们还是打印完信息
  }

  try {
    // 2. 创建管理员账户
    console.log("\n👤 [2/3] 正在检查/创建管理员账户...");
    
    const adminEmail = "admin@xfdashboard.com";
    const defaultPassword = "Admin123.";

    // 尝试连接
    await prisma.$connect();

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(`ℹ️  管理员账户已存在: ${adminEmail}`);
      console.log("   无需重复创建。");
    } else {
      console.log(`   正在创建账户: ${adminEmail}...`);
      const passwordHash = await hashPassword(defaultPassword);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: passwordHash,
          name: "Administrator",
        },
      });
      
      console.log("\n✅ 管理员账户创建成功！");
      console.log(`   ----------------------------------------`);
      console.log(`   账号: ${adminEmail}`);
      console.log(`   密码: ${defaultPassword}`);
      console.log(`   ----------------------------------------`);
    }
  } catch (error) {
    console.error("\n❌ 创建管理员账户失败:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
