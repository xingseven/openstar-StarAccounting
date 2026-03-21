-- =====================================================
-- openstar-xfdashboard 完整数据库结构
-- 数据库: xf_dashboard
-- 包含多账户权限系统
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. 用户表
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱',
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户名',
  `defaultAccountId` varchar(191) DEFAULT NULL COMMENT '默认账户ID',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  `role` enum('USER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER' COMMENT '用户角色',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_defaultAccountId_idx` (`defaultAccountId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息';

-- ----------------------------
-- 2. 账户表
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户名称',
  `ownerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所有者用户ID',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `Account_ownerId_idx` (`ownerId`),
  CONSTRAINT `Account_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户信息';

-- 添加外键
ALTER TABLE `user` ADD CONSTRAINT `User_defaultAccountId_fkey` FOREIGN KEY (`defaultAccountId`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- 3. 账户成员表
-- ----------------------------
DROP TABLE IF EXISTS `account_member`;
CREATE TABLE `account_member` (
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
  KEY `AccountMember_userId_idx` (`userId`),
  CONSTRAINT `AccountMember_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AccountMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户成员关系';

-- ----------------------------
-- 4. 汇率表
-- ----------------------------
DROP TABLE IF EXISTS `exchangerate`;
CREATE TABLE `exchangerate` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '汇率ID',
  `from` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '源币种',
  `to` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标币种',
  `rate` decimal(65,30) NOT NULL COMMENT '汇率值',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ExchangeRate_from_to_key` (`from`,`to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='汇率配置';

-- ----------------------------
-- 5. 储蓄目标表
-- ----------------------------
DROP TABLE IF EXISTS `savingsgoal`;
CREATE TABLE `savingsgoal` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标名称',
  `targetAmount` decimal(65,30) NOT NULL COMMENT '目标金额',
  `currentAmount` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000' COMMENT '当前金额',
  `deadline` datetime(3) DEFAULT NULL COMMENT '截止时间',
  `type` enum('MONTHLY','YEARLY','LONG_TERM','BI_MONTHLY_ODD','BI_MONTHLY_EVEN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LONG_TERM' COMMENT '储蓄周期类型',
  `status` enum('ACTIVE','COMPLETED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '目标状态',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  `depositType` enum('CASH','FIXED_TERM','HELP_DEPOSIT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH' COMMENT '存入方式',
  `planConfig` json DEFAULT NULL COMMENT '计划配置',
  PRIMARY KEY (`id`),
  KEY `SavingsGoal_userId_fkey` (`userId`),
  KEY `SavingsGoal_accountId_idx` (`accountId`),
  CONSTRAINT `SavingsGoal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SavingsGoal_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='储蓄目标';

-- ----------------------------
-- 6. 储蓄计划表
-- ----------------------------
DROP TABLE IF EXISTS `savingsplan`;
CREATE TABLE `savingsplan` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计划ID',
  `goalId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '储蓄目标ID',
  `amount` decimal(65,30) NOT NULL COMMENT '计划金额',
  `status` enum('PENDING','COMPLETED','SKIPPED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT '计划状态',
  `month` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计划月份',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  `expenses` json DEFAULT NULL COMMENT '支出明细',
  `remark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `salary` decimal(65,30) DEFAULT '0.000000000000000000000000000000' COMMENT '当月工资',
  `proofImage` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '打卡凭证图片',
  PRIMARY KEY (`id`),
  KEY `SavingsPlan_goalId_idx` (`goalId`),
  CONSTRAINT `SavingsPlan_goalId_fkey` FOREIGN KEY (`goalId`) REFERENCES `savingsgoal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='储蓄计划';

-- ----------------------------
-- 7. 贷款表
-- ----------------------------
DROP TABLE IF EXISTS `loan`;
CREATE TABLE `loan` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '贷款ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `platform` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '贷款平台',
  `totalAmount` decimal(65,30) NOT NULL COMMENT '贷款总额',
  `remainingAmount` decimal(65,30) NOT NULL COMMENT '剩余应还金额',
  `periods` int NOT NULL COMMENT '总期数',
  `paidPeriods` int NOT NULL COMMENT '已还期数',
  `monthlyPayment` decimal(65,30) NOT NULL COMMENT '每期还款额',
  `dueDate` int NOT NULL COMMENT '每月还款日',
  `status` enum('ACTIVE','PAID_OFF','OVERDUE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '贷款状态',
  `matchKeywords` json DEFAULT NULL COMMENT '匹配关键词',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `Loan_userId_status_idx` (`userId`,`status`),
  KEY `Loan_accountId_idx` (`accountId`),
  CONSTRAINT `Loan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Loan_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='贷款信息';

-- ----------------------------
-- 8. 交易流水表
-- ----------------------------
DROP TABLE IF EXISTS `transaction`;
CREATE TABLE `transaction` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `amount` decimal(65,30) NOT NULL COMMENT '交易金额',
  `type` enum('INCOME','EXPENSE','TRANSFER','REPAYMENT') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易类型',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易分类',
  `platform` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易平台',
  `merchant` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商户名称',
  `date` datetime(3) NOT NULL COMMENT '交易时间',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '交易描述',
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '订单号',
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '支付方式',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '交易状态',
  `loanId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联贷款ID',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Transaction_orderId_key` (`orderId`),
  KEY `Transaction_userId_date_idx` (`userId`,`date`),
  KEY `Transaction_userId_loanId_idx` (`userId`,`loanId`),
  KEY `Transaction_loanId_fkey` (`loanId`),
  KEY `Transaction_accountId_idx` (`accountId`),
  CONSTRAINT `Transaction_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Transaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易流水';

-- ----------------------------
-- 9. 资产账户表
-- ----------------------------
DROP TABLE IF EXISTS `asset`;
CREATE TABLE `asset` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产名称',
  `type` enum('CASH','BANK_CARD','ALIPAY','WECHAT','INVESTMENT','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产类型',
  `balance` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000' COMMENT '资产余额',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `Asset_userId_type_idx` (`userId`,`type`),
  KEY `Asset_accountId_idx` (`accountId`),
  CONSTRAINT `Asset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Asset_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资产账户';

-- ----------------------------
-- 10. 预算配置表
-- ----------------------------
DROP TABLE IF EXISTS `budget`;
CREATE TABLE `budget` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '预算ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `amount` decimal(65,30) NOT NULL COMMENT '预算金额',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALL' COMMENT '预算分类',
  `period` enum('MONTHLY','YEARLY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTHLY' COMMENT '预算周期',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  `alertPercent` int NOT NULL DEFAULT '80' COMMENT '预警百分比',
  `platform` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '平台',
  `scopeType` enum('GLOBAL','CATEGORY','PLATFORM') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GLOBAL' COMMENT '预算范围类型',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Budget_userId_category_period_scopeType_platform_key` (`userId`,`category`,`period`,`scopeType`,`platform`),
  KEY `Budget_accountId_idx` (`accountId`),
  CONSTRAINT `Budget_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Budget_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算配置';

-- ----------------------------
-- 11. 主题配置表
-- ----------------------------
DROP TABLE IF EXISTS `themeconfig`;
CREATE TABLE `themeconfig` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) DEFAULT NULL COMMENT '账户ID',
  `themeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default' COMMENT '主题标识',
  `primaryColor` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '主色',
  `radius` double DEFAULT NULL COMMENT '圆角半径',
  `isDarkMode` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否深色模式',
  `chartStyle` json DEFAULT NULL COMMENT '图表样式配置',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ThemeConfig_userId_key` (`userId`),
  CONSTRAINT `ThemeConfig_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ThemeConfig_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主题配置';

-- ----------------------------
-- 12. 应用连接表
-- ----------------------------
DROP TABLE IF EXISTS `appconnection`;
CREATE TABLE `appconnection` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '连接记录ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `deviceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备ID',
  `deviceName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备名称',
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',
  `otpCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '一次性验证码',
  `isVerified` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已验证',
  `expiresAt` datetime(3) NOT NULL COMMENT '验证码过期时间',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `verifiedAt` datetime(3) DEFAULT NULL COMMENT '验证时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `AppConnection_otpCode_isVerified_key` (`otpCode`,`isVerified`),
  KEY `AppConnection_otpCode_idx` (`otpCode`),
  KEY `AppConnection_userId_isVerified_idx` (`userId`,`isVerified`),
  KEY `AppConnection_accountId_idx` (`accountId`),
  CONSTRAINT `AppConnection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `AppConnection_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用连接验证记录';

-- ----------------------------
-- 13. AI模型配置表
-- ----------------------------
DROP TABLE IF EXISTS `aimodelconfig`;
CREATE TABLE `aimodelconfig` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置名称',
  `provider` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提供商',
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vision' COMMENT '模型类型',
  `apiKey` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'API密钥',
  `endpoint` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '端点',
  `modelId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '模型ID',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '描述',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inactive' COMMENT '状态',
  `isDefault` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `AIModelConfig_userId_idx` (`userId`),
  KEY `AIModelConfig_accountId_idx` (`accountId`),
  CONSTRAINT `aimodelconfig_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `AIModelConfig_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置';

-- ----------------------------
-- 14. 导入错误日志表
-- ----------------------------
DROP TABLE IF EXISTS `importerrorlog`;
CREATE TABLE `importerrorlog` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '日志ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `fileName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件名',
  `lineNumber` int NOT NULL COMMENT '行号',
  `rawData` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始数据',
  `errorMessage` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '错误信息',
  `errorType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '错误类型',
  `resolved` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已解决',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `ImportErrorLog_userId_idx` (`userId`),
  KEY `ImportErrorLog_userId_resolved_idx` (`userId`,`resolved`),
  KEY `ImportErrorLog_accountId_idx` (`accountId`),
  CONSTRAINT `ImportErrorLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ImportErrorLog_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导入错误日志';

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 初始化测试数据
-- =====================================================

-- 创建测试用户
INSERT INTO `user` (`id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`) VALUES
('user_001', 'admin@example.com', '$argon2i$v=19$m=16,t=2,p=1$test', '管理员', 'ADMIN', NOW(), NOW()),
('user_002', 'user@example.com', '$argon2i$v=19$m=16,t=2,p=1$test', '普通用户', 'USER', NOW(), NOW());

-- 为每个用户创建默认账户
INSERT INTO `account` (`id`, `name`, `ownerId`, `createdAt`, `updatedAt`) VALUES
('acc_001', '我的账户', 'user_001', NOW(), NOW()),
('acc_002', '我的账户', 'user_002', NOW(), NOW());

-- 更新用户的默认账户
UPDATE `user` SET `defaultAccountId` = 'acc_001' WHERE `id` = 'user_001';
UPDATE `user` SET `defaultAccountId` = 'acc_002' WHERE `id` = 'user_002';

-- 创建账户成员记录
INSERT INTO `account_member` (`id`, `accountId`, `userId`, `role`, `nickname`, `joinedAt`) VALUES
('am_001', 'acc_001', 'user_001', 'OWNER', '管理员', NOW()),
('am_002', 'acc_002', 'user_002', 'OWNER', '普通用户', NOW());

SELECT '数据库创建完成！' AS status;
