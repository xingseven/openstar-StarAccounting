import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import argon2 from "argon2";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

// 尝试加载 .env 文件
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

async function hashPassword(password: string) {
  return argon2.hash(password);
}

loadEnv();
const prisma = new PrismaClient();

async function main() {
  console.log("🛠️  开始初始化数据库...");
  console.log(`   数据库连接串: ${process.env.DATABASE_URL || "未设置"}`);

  // 0. 生成 Prisma Client
  console.log("\n🔄 [0/4] 正在生成 Prisma Client...");
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✅ Prisma Client 生成成功！");
  } catch (error) {
    console.error("\n❌ Prisma Client 生成失败:", error);
    process.exit(1);
  }

  // 1. 同步数据库结构
  console.log("\n📦 [1/4] 正在创建/同步数据库表结构...");
  try {
    execSync("npx prisma db push", { stdio: "inherit" });
    console.log("✅ 数据库表结构同步完成！");
  } catch (error) {
    console.error("\n❌ 数据库表结构同步失败！");
    console.error("   请检查 MySQL 服务是否启动，以及 DATABASE_URL 配置是否正确");
    process.exit(1);
  }

  // 2. 创建管理员账户
  console.log("\n👤 [2/4] 正在检查/创建管理员账户...");
  const adminEmail = "admin@star.com";
  const defaultPassword = "Admin123.";

  await prisma.$connect();

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let userId: string;

  if (existingUser) {
    console.log(`ℹ️  管理员账户已存在: ${adminEmail}`);
    userId = existingUser.id;
  } else {
    console.log(`   正在创建账户: ${adminEmail}...`);
    const passwordHash = await hashPassword(defaultPassword);

    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: passwordHash,
        name: "Administrator",
      },
    });
    userId = user.id;
    console.log("✅ 管理员账户创建成功！");
  }

  // 3. 创建默认账户
  console.log("\n🏦 [3/4] 正在检查/创建默认账户...");

  const existingAccount = await prisma.account.findFirst({
    where: { ownerId: userId },
  });

  let accountId: string;

  if (existingAccount) {
    console.log(`ℹ️  默认账户已存在`);
    accountId = existingAccount.id;
  } else {
    const account = await prisma.account.create({
      data: {
        id: randomUUID(),
        name: "我的账户",
        ownerId: userId,
      },
    });
    accountId = account.id;
    console.log("✅ 默认账户创建成功！");
  }

  // 4. 关联账户
  console.log("\n🔗 [4/4] 正在关联账户...");

  const userWithAccount = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userWithAccount?.defaultAccountId) {
    await prisma.user.update({
      where: { id: userId },
      data: { defaultAccountId: accountId },
    });
    console.log("✅ 账户关联完成！");
  } else {
    console.log("ℹ️  账户已关联");
  }

  // 创建账户成员记录
  const existingMember = await prisma.account_member.findFirst({
    where: { accountId, userId },
  });

  if (!existingMember) {
    await prisma.account_member.create({
      data: {
        id: randomUUID(),
        accountId,
        userId,
        role: "OWNER",
        nickname: "Administrator",
      },
    });
    console.log("✅ 账户成员记录创建成功！");
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 数据库初始化完成！");
  console.log("=".repeat(50));
  console.log(`   管理员账号: ${adminEmail}`);
  console.log(`   管理员密码: ${defaultPassword}`);
  console.log("=".repeat(50));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("\n❌ 数据库初始化失败:", error);
  process.exit(1);
});
