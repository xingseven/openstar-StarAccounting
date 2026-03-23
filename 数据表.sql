===== 数据库表结构详细信息 =====

数据库连接成功!
服务器: localhost      
数据库: star_accounting

数据库中共有 14 个表：
- account (账户信息)
- account_member (账户成员关系)   
- aimodelconfig (AI模型配置)      
- appconnection (应用连接验证记录)
- asset (资产账户)
- budget (预算配置)
- exchangerate (汇率配置)
- importerrorlog (导入错误日志)   
- loan (贷款信息)
- savingsgoal (储蓄目标)
- savingsplan (储蓄计划)
- themeconfig (主题配置)
- transaction (交易流水)
- user (用户信息)

===== 表：account (账户信息) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    账户ID
name                     varchar(191)        NO                  NULL                                    账户 
名称
ownerId                  varchar(191)        NO        MUL       NULL                                    所有 
者用户ID
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间

记录数：4

创建语句：
CREATE TABLE `account` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户名称',
  `ownerId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所有者用户ID',    
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `Account_ownerId_idx` (`ownerId`),
  CONSTRAINT `Account_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户信息'

====================================================================================================

===== 表：account_member (账户成员关系) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    成员 
记录ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
role                     enum('OWNER','ADMIN','MEMBER')NO                  MEMBER
     角色
nickname                 varchar(191)        YES                 NULL                                    在账 
户中的昵称
canViewOwn               tinyint(1)          NO                  1                                       可查 
看自己的账单
canManageOwn             tinyint(1)          NO                  1                                       可管 
理自己的账单
canViewAll               tinyint(1)          NO                  0                                       可查 
看所有成员账单
canManageAll             tinyint(1)          NO                  0                                       可管 
理所有成员账单
joinedAt                 datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   加入 
时间

记录数：4

创建语句：
CREATE TABLE `account_member` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '成员记录ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `role` enum('OWNER','ADMIN','MEMBER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER' COMMENT '角色',
  `nickname` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '在账户中的昵 
称',
  `canViewOwn` tinyint(1) NOT NULL DEFAULT '1' COMMENT '可查看自己的账单',
  `canManageOwn` tinyint(1) NOT NULL DEFAULT '1' COMMENT '可管理自己的账单',
  `canViewAll` tinyint(1) NOT NULL DEFAULT '0' COMMENT '可查看所有成员账单',
  `canManageAll` tinyint(1) NOT NULL DEFAULT '0' COMMENT '可管理所有成员账单',
  `joinedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `AccountMember_accountId_userId_key` (`accountId`,`userId`),
  KEY `AccountMember_userId_idx` (`userId`),
  CONSTRAINT `AccountMember_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AccountMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON 
UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='账户成员关系'

====================================================================================================

===== 表：aimodelconfig (AI模型配置) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    配置ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
name                     varchar(191)        NO                  NULL                                    配置 
名称
provider                 varchar(191)        NO                  NULL                                    提供 
商
type                     varchar(191)        NO                  vision                                  模型 
类型
apiKey                   varchar(191)        YES                 NULL                                    API密
钥
endpoint                 varchar(191)        YES                 NULL                                    端点 
modelId                  varchar(191)        YES                 NULL                                    模型ID
description              varchar(191)        YES                 NULL                                    描述 
status                   varchar(191)        NO                  inactive                                状态 
isDefault                tinyint(1)          NO                  0                                       是否 
默认
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间

记录数：0

创建语句：
CREATE TABLE `aimodelconfig` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置名称',
  `provider` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '提供商',
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vision' COMMENT '模型
类型',
  `apiKey` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'API密钥',      
  `endpoint` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '端点',       
  `modelId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '模型ID',      
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '描述',    
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'inactive' COMMENT '状态',
  `isDefault` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `AIModelConfig_userId_idx` (`userId`),
  KEY `AIModelConfig_accountId_idx` (`accountId`),
  CONSTRAINT `AIModelConfig_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `aimodelconfig_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置'

====================================================================================================

===== 表：appconnection (应用连接验证记录) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    连接 
记录ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
deviceId                 varchar(191)        YES                 NULL                                    设备ID
deviceName               varchar(191)        YES                 NULL                                    设备 
名称
ipAddress                varchar(191)        YES                 NULL                                    IP地 
址
otpCode                  varchar(191)        NO        MUL       NULL                                    一次 
性验证码
isVerified               tinyint(1)          NO                  0                                       是否 
已验证
expiresAt                datetime(3)         NO                  NULL                                    验证 
码过期时间
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
verifiedAt               datetime(3)         YES                 NULL                                    验证 
时间

记录数：1

创建语句：
CREATE TABLE `appconnection` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '连接记录ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `deviceId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备ID',     
  `deviceName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设备名称', 
  `ipAddress` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',    
  `otpCode` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '一次性验证码',    
  `isVerified` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已验证',
  `expiresAt` datetime(3) NOT NULL COMMENT '验证码过期时间',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `verifiedAt` datetime(3) DEFAULT NULL COMMENT '验证时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `AppConnection_otpCode_isVerified_key` (`otpCode`,`isVerified`),
  KEY `AppConnection_otpCode_idx` (`otpCode`),
  KEY `AppConnection_userId_isVerified_idx` (`userId`,`isVerified`),
  KEY `AppConnection_accountId_idx` (`accountId`),
  CONSTRAINT `AppConnection_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AppConnection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='应用连接验证记录'

====================================================================================================

===== 表：asset (资产账户) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    资产ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
name                     varchar(191)        NO                  NULL                                    资产 
名称
type                     enum('CASH','BANK_CARD','ALIPAY','WECHAT','INVESTMENT','OTHER')NO                  NULL                                    资产类型
balance                  decimal(65,30)      NO                  0.000000000000000000000000000000
       资产余额
currency                 varchar(191)        NO                  CNY                                     币种 
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间

记录数：0

创建语句：
CREATE TABLE `asset` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产名称',
  `type` enum('CASH','BANK_CARD','ALIPAY','WECHAT','INVESTMENT','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '资产类型',
  `balance` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000' COMMENT '资产余额',
  `currency` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY' COMMENT '币 
种',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `Asset_userId_type_idx` (`userId`,`type`),
  KEY `Asset_accountId_idx` (`accountId`),
  CONSTRAINT `Asset_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Asset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE 
CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资产账户'

====================================================================================================

===== 表：budget (预算配置) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    预算ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
amount                   decimal(65,30)      NO                  NULL                                    预算 
金额
category                 varchar(191)        NO                  ALL                                     预算 
分类
period                   enum('MONTHLY','YEARLY')NO                  MONTHLY
预算周期
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间
alertPercent             int                 NO                  80                                      预警 
百分比
platform                 varchar(191)        YES                 NULL                                    平台 
scopeType                enum('GLOBAL','CATEGORY','PLATFORM')NO                  GLOBAL
           预算范围类型

记录数：0

创建语句：
CREATE TABLE `budget` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '预算ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `amount` decimal(65,30) NOT NULL COMMENT '预算金额',
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALL' COMMENT '预 
算分类',
  `period` enum('MONTHLY','YEARLY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTHLY' COMMENT '预算周期',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  `alertPercent` int NOT NULL DEFAULT '80' COMMENT '预警百分比',
  `platform` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '平台',       
  `scopeType` enum('GLOBAL','CATEGORY','PLATFORM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GLOBAL' COMMENT '预算范围类型',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Budget_userId_category_period_scopeType_platform_key` (`userId`,`category`,`period`,`scopeType`,`platform`),
  KEY `Budget_accountId_idx` (`accountId`),
  CONSTRAINT `Budget_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Budget_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算配置'

====================================================================================================

===== 表：exchangerate (汇率配置) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    汇率ID
from                     varchar(191)        NO        MUL       NULL                                    源币 
种
to                       varchar(191)        NO                  NULL                                    目标 
币种
rate                     decimal(65,30)      NO                  NULL                                    汇率 
值
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间

记录数：0

创建语句：
CREATE TABLE `exchangerate` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '汇率ID',
  `from` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '源币种',
  `to` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标币种',
  `rate` decimal(65,30) NOT NULL COMMENT '汇率值',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ExchangeRate_from_to_key` (`from`,`to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='汇率配置'

====================================================================================================

===== 表：importerrorlog (导入错误日志) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    日志ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
fileName                 varchar(191)        NO                  NULL                                    文件 
名
lineNumber               int                 NO                  NULL                                    行号 
rawData                  text                NO                  NULL                                    原始 
数据
errorMessage             text                NO                  NULL                                    错误 
信息
errorType                varchar(191)        NO                  NULL                                    错误 
类型
resolved                 tinyint(1)          NO                  0                                       是否 
已解决
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间

记录数：0

创建语句：
CREATE TABLE `importerrorlog` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '日志ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `fileName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件名',
  `lineNumber` int NOT NULL COMMENT '行号',
  `rawData` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始数据',
  `errorMessage` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '错误信息',
  `errorType` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '错误类型',      
  `resolved` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已解决',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `ImportErrorLog_userId_idx` (`userId`),
  KEY `ImportErrorLog_userId_resolved_idx` (`userId`,`resolved`),
  KEY `ImportErrorLog_accountId_idx` (`accountId`),
  CONSTRAINT `ImportErrorLog_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ImportErrorLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='导入错误日志'

====================================================================================================

===== 表：loan (贷款信息) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    贷款ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
platform                 varchar(191)        NO                  NULL                                    贷款 
平台
totalAmount              decimal(65,30)      NO                  NULL                                    贷款 
总额
remainingAmount          decimal(65,30)      NO                  NULL                                    剩余 
应还金额
periods                  int                 NO                  NULL                                    总期 
数
paidPeriods              int                 NO                  NULL                                    已还 
期数
monthlyPayment           decimal(65,30)      NO                  NULL                                    每期 
还款额
dueDate                  int                 NO                  NULL                                    每月 
还款日
status                   enum('ACTIVE','PAID_OFF','OVERDUE')NO                  ACTIVE
          贷款状态
matchKeywords            json                YES                 NULL                                    匹配 
关键词
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间

记录数：0

创建语句：
CREATE TABLE `loan` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '贷款ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `platform` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '贷款平台',       
  `totalAmount` decimal(65,30) NOT NULL COMMENT '贷款总额',
  `remainingAmount` decimal(65,30) NOT NULL COMMENT '剩余应还金额',
  `periods` int NOT NULL COMMENT '总期数',
  `paidPeriods` int NOT NULL COMMENT '已还期数',
  `monthlyPayment` decimal(65,30) NOT NULL COMMENT '每期还款额',
  `dueDate` int NOT NULL COMMENT '每月还款日',
  `status` enum('ACTIVE','PAID_OFF','OVERDUE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '贷款状态',
  `matchKeywords` json DEFAULT NULL COMMENT '匹配关键词',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `Loan_userId_status_idx` (`userId`,`status`),
  KEY `Loan_accountId_idx` (`accountId`),
  CONSTRAINT `Loan_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON 
UPDATE CASCADE,
  CONSTRAINT `Loan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='贷款信息'

====================================================================================================

===== 表：savingsgoal (储蓄目标) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    目标ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
name                     varchar(191)        NO                  NULL                                    目标 
名称
targetAmount             decimal(65,30)      NO                  NULL                                    目标 
金额
currentAmount            decimal(65,30)      NO                  0.000000000000000000000000000000
       当前金额
deadline                 datetime(3)         YES                 NULL                                    截止 
时间
type                     enum('MONTHLY','YEARLY','LONG_TERM','BI_MONTHLY_ODD','BI_MONTHLY_EVEN')NO
      LONG_TERM                               储蓄周期类型
status                   enum('ACTIVE','COMPLETED','ARCHIVED')NO                  ACTIVE
            目标状态
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间
depositType              enum('CASH','FIXED_TERM','HELP_DEPOSIT')NO                  CASH
               存入方式
planConfig               json                YES                 NULL                                    计划 
配置

记录数：0

创建语句：
CREATE TABLE `savingsgoal` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '目标名称',
  `targetAmount` decimal(65,30) NOT NULL COMMENT '目标金额',
  `currentAmount` decimal(65,30) NOT NULL DEFAULT '0.000000000000000000000000000000' COMMENT '当前金额',      
  `deadline` datetime(3) DEFAULT NULL COMMENT '截止时间',
  `type` enum('MONTHLY','YEARLY','LONG_TERM','BI_MONTHLY_ODD','BI_MONTHLY_EVEN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LONG_TERM' COMMENT '储蓄周期类型',
  `status` enum('ACTIVE','COMPLETED','ARCHIVED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '目标状态',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  `depositType` enum('CASH','FIXED_TERM','HELP_DEPOSIT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT 
NULL DEFAULT 'CASH' COMMENT '存入方式',
  `planConfig` json DEFAULT NULL COMMENT '计划配置',
  PRIMARY KEY (`id`),
  KEY `SavingsGoal_userId_fkey` (`userId`),
  KEY `SavingsGoal_accountId_idx` (`accountId`),
  CONSTRAINT `SavingsGoal_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SavingsGoal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='储蓄目标'

====================================================================================================

===== 表：savingsplan (储蓄计划) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    计划ID
goalId                   varchar(191)        NO        MUL       NULL                                    储蓄 
目标ID
amount                   decimal(65,30)      NO                  NULL                                    计划 
金额
status                   enum('PENDING','COMPLETED','SKIPPED')NO                  PENDING
            计划状态
month                    varchar(191)        NO                  NULL                                    计划 
月份
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间
expenses                 json                YES                 NULL                                    支出 
明细
remark                   varchar(191)        YES                 NULL                                    备注 
salary                   decimal(65,30)      YES                 0.000000000000000000000000000000
       当月工资
proofImage               longtext            YES                 NULL                                    打卡 
凭证图片

记录数：0

创建语句：
CREATE TABLE `savingsplan` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计划ID',
  `goalId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '储蓄目标ID',       
  `amount` decimal(65,30) NOT NULL COMMENT '计划金额',
  `status` enum('PENDING','COMPLETED','SKIPPED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT '计划状态',
  `month` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '计划月份',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  `expenses` json DEFAULT NULL COMMENT '支出明细',
  `remark` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `salary` decimal(65,30) DEFAULT '0.000000000000000000000000000000' COMMENT '当月工资',
  `proofImage` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '打卡凭证图片',
  PRIMARY KEY (`id`),
  KEY `SavingsPlan_goalId_idx` (`goalId`),
  CONSTRAINT `SavingsPlan_goalId_fkey` FOREIGN KEY (`goalId`) REFERENCES `savingsgoal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='储蓄计划'

====================================================================================================

===== 表：themeconfig (主题配置) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    配置ID
userId                   varchar(191)        NO        UNI       NULL                                    用户ID
accountId                varchar(191)        YES       MUL       NULL                                    账户ID
themeId                  varchar(191)        NO                  default                                 主题 
标识
primaryColor             varchar(191)        YES                 NULL                                    主色 
radius                   double              YES                 NULL                                    圆角 
半径
isDarkMode               tinyint(1)          NO                  0                                       是否 
深色模式
chartStyle               json                YES                 NULL                                    图表 
样式配置
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间

记录数：0

创建语句：
CREATE TABLE `themeconfig` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '账户ID',
  `themeId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default' COMMENT '主题标识',
  `primaryColor` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '主色',   
  `radius` double DEFAULT NULL COMMENT '圆角半径',
  `isDarkMode` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否深色模式',
  `chartStyle` json DEFAULT NULL COMMENT '图表样式配置',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ThemeConfig_userId_key` (`userId`),
  KEY `ThemeConfig_accountId_fkey` (`accountId`),
  CONSTRAINT `ThemeConfig_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE SET 
NULL ON UPDATE CASCADE,
  CONSTRAINT `ThemeConfig_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主题配置'

====================================================================================================

===== 表：transaction (交易流水) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    交易ID
userId                   varchar(191)        NO        MUL       NULL                                    用户ID
accountId                varchar(191)        NO        MUL       NULL                                    账户ID
amount                   decimal(65,30)      NO                  NULL                                    交易 
金额
type                     enum('INCOME','EXPENSE','TRANSFER','REPAYMENT')NO                  NULL
                      交易类型
category                 varchar(191)        NO                  NULL                                    交易 
分类
platform                 varchar(191)        NO                  NULL                                    交易 
平台
merchant                 varchar(191)        YES                 NULL                                    商户 
名称
date                     datetime(3)         NO                  NULL                                    交易 
时间
description              varchar(191)        YES                 NULL                                    交易 
描述
orderId                  varchar(191)        YES       UNI       NULL                                    订单 
号
paymentMethod            varchar(191)        YES                 NULL                                    支付 
方式
status                   varchar(191)        YES                 NULL                                    交易 
状态
loanId                   varchar(191)        YES       MUL       NULL                                    关联 
贷款ID
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间

记录数：6318

创建语句：
CREATE TABLE `transaction` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易ID',
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `accountId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账户ID',        
  `amount` decimal(65,30) NOT NULL COMMENT '交易金额',
  `type` enum('INCOME','EXPENSE','TRANSFER','REPAYMENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT 
NULL COMMENT '交易类型',
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易分类',       
  `platform` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易平台',       
  `merchant` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商户名称',   
  `date` datetime(3) NOT NULL COMMENT '交易时间',
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '交易描述',  `orderId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '订单号',      
  `paymentMethod` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '支付方式
',
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '交易状态',     
  `loanId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联贷款ID',   
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Transaction_orderId_key` (`orderId`),
  KEY `Transaction_userId_date_idx` (`userId`,`date`),
  KEY `Transaction_userId_loanId_idx` (`userId`,`loanId`),
  KEY `Transaction_loanId_fkey` (`loanId`),
  KEY `Transaction_accountId_idx` (`accountId`),
  CONSTRAINT `Transaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Transaction_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易流水'

====================================================================================================

===== 表：user (用户信息) =====

表结构：
字段名                      类型                  允许NULL    键         默认值                 额外信息      
          注释
------------------------------------------------------------------------------------------------------------------------
id                       varchar(191)        NO        PRI       NULL                                    用户ID
email                    varchar(191)        NO        UNI       NULL                                    邮箱 
password                 varchar(191)        NO                  NULL                                    密码 
哈希
name                     varchar(191)        YES                 NULL                                    用户 
名
defaultAccountId         varchar(191)        YES       MUL       NULL                                    默认 
账户ID
createdAt                datetime(3)         NO                  CURRENT_TIMESTAMP(3)DEFAULT_GENERATED   创建 
时间
updatedAt                datetime(3)         NO                  NULL                                    更新 
时间
role                     enum('USER','ADMIN')NO                  USER                                    用户 
角色

记录数：5

创建语句：
CREATE TABLE `user` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱',
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',       
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户名',
  `defaultAccountId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '默认账户ID',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  `updatedAt` datetime(3) NOT NULL COMMENT '更新时间',
  `role` enum('USER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER' COMMENT '用户角色',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_defaultAccountId_idx` (`defaultAccountId`),
  CONSTRAINT `User_defaultAccountId_fkey` FOREIGN KEY (`defaultAccountId`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息'

====================================================================================================