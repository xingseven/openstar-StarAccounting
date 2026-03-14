服务器: localhost
数据库: xf_dashboard

数据库中共有 10 个表：
- appconnection
- asset
- budget
- exchangerate
- loan
- savingsgoal
- savingsplan
- themeconfig
- transaction
- user

===== 表：appconnection =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

userId                   varchar(191)        NO        MUL       NULL

deviceId                 varchar(191)        YES                 NULL

deviceName               varchar(191)        YES                 NULL

ipAddress                varchar(191)        YES                 NULL

otpCode                  varchar(191)        NO        MUL       NULL

isVerified               tinyint(1)          NO                  0

expiresAt                datetime(3)         NO                  NULL

createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
verifiedAt               datetime(3)         YES                 NULL


记录数：1

创建语句：
CREATE TABLE `appconnection` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '连接记录ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
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
  CONSTRAINT `AppConnection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用连接验证记录'

====================================================================================================

===== 表：asset =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

userId                   varchar(191)        NO        MUL       NULL

name                     varchar(191)        NO                  NULL

type                     enum('CASH','BANK_CARD','ALIPAY','WECHAT','INVESTMENT','OTHER')NO                  NULL
balance                  decimal(65,30)      NO                  0.000000000000000000000000000000
currency                 varchar(191)        NO                  CNY

createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
updatedAt                datetime(3)         NO                  NULL


记录数：0

创建语句：
CREATE TABLE `asset` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产名称',
  `type` enum('CASH','BANK_CARD','ALIPAY','WECHAT','INVESTMENT','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产类型',
  `balance` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000' COMMENT '资产余额',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `Asset_userId_type_idx` (`userId`,`type`),
  CONSTRAINT `Asset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资产账户'

====================================================================================================

===== 表：budget =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

userId                   varchar(191)        NO        MUL       NULL

amount                   decimal(65,30)      NO                  NULL

category                 varchar(191)        NO                  ALL

period                   enum('MONTHLY','YEARLY')NO                  MONTHLY

createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
updatedAt                datetime(3)         NO                  NULL


记录数：0

创建语句：
CREATE TABLE `budget` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '预算ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `amount` decimal(65,30) NOT NULL COMMENT '预算金额',
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALL' COMMENT '预算分类',
  `period` enum('MONTHLY','YEARLY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTHLY' COMMENT '预算周期',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Budget_userId_category_period_key` (`userId`,`category`,`period`),     
  CONSTRAINT `Budget_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON 
DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算配置'

====================================================================================================

===== 表：exchangerate =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

from                     varchar(191)        NO        MUL       NULL

to                       varchar(191)        NO                  NULL

rate                     decimal(65,30)      NO                  NULL

updatedAt                datetime(3)         NO                  NULL


记录数：0

创建语句：
CREATE TABLE `exchangerate` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '汇率ID',
  `from` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '源币种',
  `to` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标币种',
  `rate` decimal(65,30) NOT NULL COMMENT '汇率值',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ExchangeRate_from_to_key` (`from`,`to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='汇率配置'

====================================================================================================

===== 表：loan =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

userId                   varchar(191)        NO        MUL       NULL

platform                 varchar(191)        NO                  NULL

totalAmount              decimal(65,30)      NO                  NULL

remainingAmount          decimal(65,30)      NO                  NULL

periods                  int                 NO                  NULL

paidPeriods              int                 NO                  NULL

monthlyPayment           decimal(65,30)      NO                  NULL

dueDate                  int                 NO                  NULL

status                   enum('ACTIVE','PAID_OFF','OVERDUE')NO                  ACTIVE
matchKeywords            json                YES                 NULL

createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
updatedAt                datetime(3)         NO                  NULL


记录数：0

创建语句：
CREATE TABLE `loan` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '贷款ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
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
  CONSTRAINT `Loan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='贷款信息'

====================================================================================================

===== 表：savingsgoal =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

userId                   varchar(191)        NO        MUL       NULL

name                     varchar(191)        NO                  NULL

targetAmount             decimal(65,30)      NO                  NULL

currentAmount            decimal(65,30)      NO                  0.000000000000000000000000000000
deadline                 datetime(3)         YES                 NULL

type                     enum('MONTHLY','YEARLY','LONG_TERM','BI_MONTHLY_ODD','BI_MONTHLY_EVEN')NO                  LONG_TERM
status                   enum('ACTIVE','COMPLETED','ARCHIVED')NO                  ACTIVE
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
updatedAt                datetime(3)         NO                  NULL

depositType              enum('CASH','FIXED_TERM','HELP_DEPOSIT')NO
CASH
planConfig               json                YES                 NULL


记录数：1

创建语句：
CREATE TABLE `savingsgoal` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
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
  CONSTRAINT `SavingsGoal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='储蓄目标'

====================================================================================================

===== 表：savingsplan =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

goalId                   varchar(191)        NO        MUL       NULL

amount                   decimal(65,30)      NO                  NULL

status                   enum('PENDING','COMPLETED','SKIPPED')NO                  PENDING
month                    varchar(191)        NO                  NULL

createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
updatedAt                datetime(3)         NO                  NULL

expenses                 json                YES                 NULL

remark                   varchar(191)        YES                 NULL

salary                   decimal(65,30)      YES                 0.000000000000000000000000000000

proofImage               longtext            YES                 NULL

记录数：12

创建语句：
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='储蓄计划'

====================================================================================================

===== 表：themeconfig =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

userId                   varchar(191)        NO        UNI       NULL

themeId                  varchar(191)        NO                  default

primaryColor             varchar(191)        YES                 NULL

radius                   double              YES                 NULL

isDarkMode               tinyint(1)          NO                  0

chartStyle               json                YES                 NULL

createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
updatedAt                datetime(3)         NO                  NULL


记录数：0

创建语句：
CREATE TABLE `themeconfig` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `themeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default' COMMENT '主题标识',
  `primaryColor` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '主色',
  `radius` double DEFAULT NULL COMMENT '圆角半径',
  `isDarkMode` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否深色模式',
  `chartStyle` json DEFAULT NULL COMMENT '图表样式配置',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ThemeConfig_userId_key` (`userId`),
  CONSTRAINT `ThemeConfig_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主题配置'

====================================================================================================

===== 表：transaction =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

userId                   varchar(191)        NO        MUL       NULL

amount                   decimal(65,30)      NO                  NULL

type                     enum('INCOME','EXPENSE','TRANSFER','REPAYMENT')NO
       NULL
category                 varchar(191)        NO                  NULL

platform                 varchar(191)        NO                  NULL

merchant                 varchar(191)        YES                 NULL

date                     datetime(3)         NO                  NULL

description              varchar(191)        YES                 NULL

orderId                  varchar(191)        YES       UNI       NULL

paymentMethod            varchar(191)        YES                 NULL

status                   varchar(191)        YES                 NULL

loanId                   varchar(191)        YES       MUL       NULL

createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
updatedAt                datetime(3)         NO                  NULL


记录数：0

创建语句：
CREATE TABLE `transaction` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易ID',
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
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
  CONSTRAINT `Transaction_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易流水'

====================================================================================================

===== 表：user =====

表结构：
字段名                      类型                  允许NULL    键         默认值      
           额外信息                注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL

email                    varchar(191)        NO        UNI       NULL

password                 varchar(191)        NO                  NULL

name                     varchar(191)        YES                 NULL

createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED
updatedAt                datetime(3)         NO                  NULL


记录数：2

创建语句：
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱',
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户名',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息'

====================================================================================================
