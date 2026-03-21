-- =====================================================
-- 多账户权限系统 - 数据库结构 SQL (分步执行)
-- 数据库: xf_dashboard
-- 执行前请确保已备份数据
-- =====================================================

-- ==================== 阶段1：建表 ====================

-- 1. 账户表
CREATE TABLE IF NOT EXISTS `account` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户名称',
  `ownerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所有者用户ID',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `Account_ownerId_idx` (`ownerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户信息';

-- 2. 账户成员表
CREATE TABLE IF NOT EXISTS `account_member` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '成员记录ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `role` enum('OWNER','ADMIN','MEMBER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER' COMMENT '角色',
  `nickname` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '在账户中的昵称',
  `canViewOwn` tinyint(1) NOT NULL DEFAULT '1' COMMENT '可查看自己的账单',
  `canManageOwn` tinyint(1) NOT NULL DEFAULT '1' COMMENT '可管理自己的账单',
  `canViewAll` tinyint(1) NOT NULL DEFAULT '0' COMMENT '可查看所有成员账单',
  `canManageAll` tinyint(1) NOT NULL DEFAULT '0' COMMENT '可管理所有成员账单',
  `joinedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `AccountMember_accountId_userId_key` (`accountId`,`userId`),
  KEY `AccountMember_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户成员关系';

-- ==================== 阶段2：添加 accountId 字段（可为空） ====================

-- 3. user 表新增 defaultAccountId
ALTER TABLE `user` ADD COLUMN `defaultAccountId` varchar(191) DEFAULT NULL COMMENT '默认账户ID' AFTER `name`;

-- 4. transaction 表新增 accountId（允许NULL）
ALTER TABLE `transaction` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- 5. asset 表新增 accountId
ALTER TABLE `asset` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- 6. loan 表新增 accountId
ALTER TABLE `loan` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- 7. budget 表新增 accountId
ALTER TABLE `budget` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- 8. savingsgoal 表新增 accountId
ALTER TABLE `savingsgoal` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- 9. themeconfig 表新增 accountId
ALTER TABLE `themeconfig` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- 10. appconnection 表新增 accountId
ALTER TABLE `appconnection` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- 11. aimodelconfig 表新增 accountId
ALTER TABLE `aimodelconfig` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- 12. importerrorlog 表新增 accountId
ALTER TABLE `importerrorlog` ADD COLUMN `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID' AFTER `userId`;

-- ==================== 阶段3：数据迁移 ====================

-- 为每个现有用户创建账户
INSERT INTO `account` (`id`, `name`, `ownerId`, `createdAt`, `updatedAt`)
SELECT
  UUID(),
  '默认账户',
  `id`,
  NOW(),
  NOW()
FROM `user`;

-- 将账户ID回填到 user 表
UPDATE `user` u
INNER JOIN (
  SELECT `id`, `ownerId` FROM `account`
) a ON u.`id` = a.`ownerId`
SET u.`defaultAccountId` = a.`id`;

-- 为每个用户创建账户成员记录
INSERT INTO `account_member` (`id`, `accountId`, `userId`, `role`, `nickname`, `joinedAt`)
SELECT
  UUID(),
  a.`id`,
  u.`id`,
  'OWNER',
  u.`name`,
  NOW()
FROM `user` u
INNER JOIN `account` a ON u.`id` = a.`ownerId`;

-- 将所有业务数据的 accountId 设置为用户对应的默认账户
UPDATE `transaction` t
INNER JOIN `user` u ON t.`userId` = u.`id`
SET t.`accountId` = u.`defaultAccountId`
WHERE t.`accountId` IS NULL;

UPDATE `asset` a
INNER JOIN `user` u ON a.`userId` = u.`id`
SET a.`accountId` = u.`defaultAccountId`
WHERE a.`accountId` IS NULL;

UPDATE `loan` l
INNER JOIN `user` u ON l.`userId` = u.`id`
SET l.`accountId` = u.`defaultAccountId`
WHERE l.`accountId` IS NULL;

UPDATE `budget` b
INNER JOIN `user` u ON b.`userId` = u.`id`
SET b.`accountId` = u.`defaultAccountId`
WHERE b.`accountId` IS NULL;

UPDATE `savingsgoal` sg
INNER JOIN `user` u ON sg.`userId` = u.`id`
SET sg.`accountId` = u.`defaultAccountId`
WHERE sg.`accountId` IS NULL;

UPDATE `themeconfig` tc
INNER JOIN `user` u ON tc.`userId` = u.`id`
SET tc.`accountId` = u.`defaultAccountId`
WHERE tc.`accountId` IS NULL;

UPDATE `appconnection` ac
INNER JOIN `user` u ON ac.`userId` = u.`id`
SET ac.`accountId` = u.`defaultAccountId`
WHERE ac.`accountId` IS NULL;

UPDATE `aimodelconfig` amc
INNER JOIN `user` u ON amc.`userId` = u.`id`
SET amc.`accountId` = u.`defaultAccountId`
WHERE amc.`accountId` IS NULL;

UPDATE `importerrorlog` iel
INNER JOIN `user` u ON iel.`userId` = u.`id`
SET iel.`accountId` = u.`defaultAccountId`
WHERE iel.`accountId` IS NULL;

-- ==================== 阶段4：修改为 NOT NULL 并添加外键 ====================

-- user 表外键
ALTER TABLE `user` ADD CONSTRAINT `User_defaultAccountId_fkey` FOREIGN KEY (`defaultAccountId`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- account 表外键
ALTER TABLE `account` ADD CONSTRAINT `Account_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- account_member 表外键
ALTER TABLE `account_member` ADD CONSTRAINT `AccountMember_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `account_member` ADD CONSTRAINT `AccountMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- transaction 表外键
ALTER TABLE `transaction` ADD CONSTRAINT `Transaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `transaction` ADD INDEX `Transaction_accountId_idx` (`accountId`);

-- asset 表外键
ALTER TABLE `asset` ADD CONSTRAINT `Asset_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `asset` ADD INDEX `Asset_accountId_idx` (`accountId`);

-- loan 表外键
ALTER TABLE `loan` ADD CONSTRAINT `Loan_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `loan` ADD INDEX `Loan_accountId_idx` (`accountId`);

-- budget 表外键
ALTER TABLE `budget` ADD CONSTRAINT `Budget_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `budget` ADD INDEX `Budget_accountId_idx` (`accountId`);

-- savingsgoal 表外键
ALTER TABLE `savingsgoal` ADD CONSTRAINT `SavingsGoal_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `savingsgoal` ADD INDEX `SavingsGoal_accountId_idx` (`accountId`);

-- themeconfig 表外键
ALTER TABLE `themeconfig` ADD CONSTRAINT `ThemeConfig_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- appconnection 表外键
ALTER TABLE `appconnection` ADD CONSTRAINT `AppConnection_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `appconnection` ADD INDEX `AppConnection_accountId_idx` (`accountId`);

-- aimodelconfig 表外键
ALTER TABLE `aimodelconfig` ADD CONSTRAINT `AIModelConfig_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `aimodelconfig` ADD INDEX `AIModelConfig_accountId_idx` (`accountId`);

-- importerrorlog 表外键
ALTER TABLE `importerrorlog` ADD CONSTRAINT `ImportErrorLog_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `importerrorlog` ADD INDEX `ImportErrorLog_accountId_idx` (`accountId`);

-- 完成
SELECT '多账户系统数据库结构创建完成！' AS status;
