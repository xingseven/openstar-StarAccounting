// 测试 API 获取交易
const API_BASE = 'http://localhost:3006';

async function testGetTransactions() {
  try {
    // 登录
    console.log('1. 登录...');
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@xfdashboard.com',
        password: 'Admin123.'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('登录结果:', loginData);
    
    if (!loginData.data?.accessToken) {
      console.error('登录失败');
      return;
    }
    
    const token = loginData.data.accessToken;
    console.log('✓ Token:', token.substring(0, 20) + '...\n');

    // 获取所有交易
    console.log('2. 获取所有交易...');
    const res = await fetch(`${API_BASE}/api/transactions?pageSize=100`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await res.json();
    console.log('API 返回:', JSON.stringify(data, null, 2));
    
    if (data.data?.items && data.data.items.length > 0) {
      console.log(`\n✓ 共有 ${data.data.items.length} 条交易`);
      
      // 检查每条交易的 category 和 description
      console.log('\n交易详情:');
      data.data.items.forEach((t, i) => {
        console.log(`${i+1}. [${t.type}] ${t.category} - ${t.description || '无描述'}`);
      });
      
      // 测试过滤
      console.log('\n3. 测试过滤逻辑...');
      const savingsKeywords = ["储蓄", "存款", "理财", "基金", "股票", "定投", "Savings", "Deposit"];
      const filtered = data.data.items.filter(t => 
        savingsKeywords.some(k => 
          t.category.includes(k) || 
          (t.description && t.description.includes(k))
        )
      );
      
      console.log(`✓ 过滤后有 ${filtered.length} 条储蓄相关交易`);
      filtered.forEach((t, i) => {
        console.log(`${i+1}. [${t.type}] ${t.category} - ${t.description || '无描述'}`);
      });
    } else {
      console.log('⚠ 没有交易记录');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testGetTransactions();
