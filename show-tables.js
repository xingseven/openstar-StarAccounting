import mysql from 'mysql2/promise';

console.log("===== 数据库表结构详细信息 =====\n");

async function showTables() {
    try {
        // 数据库连接配置
        const host = "localhost";
        const username = "root";
        const password = "Admin123.";
        const dbname = "star_accounting";

        // 创建连接
        const conn = await mysql.createConnection({
            host: host,
            user: username,
            password: password,
            database: dbname,
            charset: 'utf8mb4'
        });

        console.log("数据库连接成功!");
        console.log(`服务器: ${host}`);
        console.log(`数据库: ${dbname}\n`);

        // 获取所有表名和注释
        const [tables] = await conn.execute(`
            SELECT 
                TABLE_NAME, 
                TABLE_COMMENT 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [dbname]);
        
        console.log(`数据库中共有 ${tables.length} 个表：`);
        tables.forEach(table => {
            console.log(`- ${table.TABLE_NAME}${table.TABLE_COMMENT ? ` (${table.TABLE_COMMENT})` : ""}`);
        });
        console.log("");

        // 遍历每个表
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            console.log(`===== 表：${tableName}${table.TABLE_COMMENT ? ` (${table.TABLE_COMMENT})` : ""} =====\n`);
            
            // 获取列信息（包含注释）
            const [columns] = await conn.execute(`SHOW FULL COLUMNS FROM \`${tableName}\``);
            
            console.log("表结构：");
            console.log(`${padString("字段名", 25)}${padString("类型", 20)}${padString("允许NULL", 10)}${padString("键", 10)}${padString("默认值", 20)}${padString("额外信息", 20)}注释`);
            console.log("-".repeat(120));
            
            columns.forEach(column => {
                console.log(
                    `${padString(column.Field, 25)}` +
                    `${padString(column.Type, 20)}` +
                    `${padString(column.Null, 10)}` +
                    `${padString(column.Key, 10)}` +
                    `${padString(column.Default === null ? "NULL" : column.Default, 20)}` +
                    `${padString(column.Extra, 20)}` +
                    `${column.Comment || ""}`
                );
            });
            
            // 获取表的记录数
            const [countResult] = await conn.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            const count = countResult[0].count;
            console.log(`\n记录数：${count}\n`);

            // 显示创建表的SQL
            const [createTableResult] = await conn.execute(`SHOW CREATE TABLE \`${tableName}\``);
            console.log("创建语句：");
            console.log(createTableResult[0]['Create Table']);
            console.log("\n" + "=".repeat(100) + "\n");
        }

        // 关闭连接
        await conn.end();

    } catch (error) {
        console.error("数据库错误:", error.message);
    }
}

// 辅助函数：字符串填充，模拟PHP的str_pad
function padString(str, length) {
    let result = str.toString();
    while (result.length < length) {
        result += ' ';
    }
    return result;
}

// 执行函数
showTables();