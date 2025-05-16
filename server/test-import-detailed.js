const { importPartyMembers, ensureTablesExist } = require('./scripts/import-party-members');
const path = require('path');

async function testImport() {
  try {
    // 确保必要的表存在
    await ensureTablesExist();
    
    // 导入党员信息
    const templatePath = path.join(__dirname, 'uploads/党员信息导入详细模板.xlsx');
    const result = await importPartyMembers(templatePath);
    
    console.log('导入结果:', result);
  } catch (err) {
    console.error('测试导入失败:', err);
  }
}

testImport();
