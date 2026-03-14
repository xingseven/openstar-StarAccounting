const mysql = require('mysql2/promise');

async function migrateData() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Admin123.',
    database: 'xf_dashboard'
  });

  const adminUserId = 'cmmoxdifo0000va045bngl0cy';
  const devUserId = 'cmmp1x8jb0000vac0mnt9cdhk';

  try {
    console.log('1. 查找 dev 用户的储蓄目标 ID...');
    const [goals] = await conn.query('SELECT id FROM savingsgoal WHERE userId = ?', [adminUserId]);
    console.log('找到目标ID:', goals.map(g => g.id));

    console.log('\n2. 查找这些目标相关的 savingsplan...');
    const goalIds = goals.map(g => g.id);
    if (goalIds.length > 0) {
      const placeholders = goalIds.map(() => '?').join(',');
      const [plans] = await conn.query(`SELECT id, goalId FROM savingsplan WHERE goalId IN (${placeholders})`, goalIds);
      console.log('找到计划数量:', plans.length);
    }

    console.log('\n3. 删除 dev@local 用户...');
    await conn.query('DELETE FROM user WHERE id = ?', [devUserId]);
    console.log('✓ dev@local 用户已删除');

    console.log('\n=== 最终结果 ===');
    const [users] = await conn.query('SELECT id, email FROM user');
    console.log('用户列表:', users);

    const [goals2] = await conn.query('SELECT userId, name FROM savingsgoal');
    console.log('储蓄目标:', goals2);

    const [plans2] = await conn.query('SELECT COUNT(*) as count FROM savingsplan');
    console.log('储蓄计划数量:', plans2[0].count);

    const [txs] = await conn.query('SELECT userId, category, amount FROM transaction');
    console.log('交易记录:', txs);

  } finally {
    await conn.end();
  }
}

migrateData();
