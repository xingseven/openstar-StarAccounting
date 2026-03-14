// 测试交易创建功能
const API_BASE = 'http://localhost:3006';

async function testTransaction() {
  try {
    // 1. 先登录获取 token
    console.log('1. 登录获取 token...');
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin@xfdashboard.com',
        password: 'Admin123.'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('登录结果:', loginData);
    
    if (!loginData.data?.token) {
      console.error('登录失败，请检查用户名密码');
      return;
    }
    
    const token = loginData.data.token;
    console.log('✓ Token 获取成功\n');

    // 2. 创建取款交易
    console.log('2. 创建取款交易...');
    const withdrawalRes = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: '1000',
        type: 'EXPENSE',
        category: '储蓄取款',
        platform: '手动',
        merchant: '双月储蓄目标',
        date: new Date().toISOString(),
        description: '测试取款'
      })
    });
    
    const withdrawalData = await withdrawalRes.json();
    console.log('取款交易结果:', withdrawalData);
    
    if (withdrawalData.data?.item) {
      console.log('✓ 取款交易创建成功\n');
    } else {
      console.error('✗ 取款交易创建失败\n');
    }

    // 3. 创建存款交易
    console.log('3. 创建存款交易...');
    const depositRes = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: '3000',
        type: 'INCOME',
        category: '储蓄存款',
        platform: '手动打卡',
        merchant: '双月储蓄目标',
        date: new Date().toISOString(),
        description: '储蓄打卡 - 2026/02'
      })
    });
    
    const depositData = await depositRes.json();
    console.log('存款交易结果:', depositData);
    
    if (depositData.data?.item) {
      console.log('✓ 存款交易创建成功\n');
    } else {
      console.error('✗ 存款交易创建失败\n');
    }

    // 4. 获取交易列表
    console.log('4. 获取交易列表...');
    const listRes = await fetch(`${API_BASE}/api/transactions?pageSize=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const listData = await listRes.json();
    console.log('交易列表:', listData);
    
    if (listData.data?.items && listData.data.items.length > 0) {
      console.log(`✓ 交易列表查询成功，共 ${listData.data.items.length} 条记录\n`);
      console.log('交易记录:');
      listData.data.items.forEach((tx, i) => {
        console.log(`  ${i+1}. ${tx.type} ${tx.category} ¥${tx.amount} - ${tx.description || tx.merchant}`);
      });
    } else {
      console.error('✗ 交易列表为空\n');
    }

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testTransaction();
