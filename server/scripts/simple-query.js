/**
 * 简单查询工具
 * 
 * 此脚本用于查询employees表中的数据
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

async function main() {
  console.log('=== 简单查询工具 ===');
  
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 检查表是否存在
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'employees'",
      [dbConfig.database]
    );
    
    if (tables.length === 0) {
      console.error('employees表不存在，请先导入数据');
      await connection.end();
      return;
    }
    
    // 查询记录总数
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM employees');
    const total = countResult[0].total;
    
    console.log(`\n数据库中共有 ${total} 条员工记录`);
    
    if (total === 0) {
      console.log('没有找到任何记录，请先导入数据');
      await connection.end();
      return;
    }
    
    // 查询前10条记录
    console.log('\n前10条记录:');
    const [records] = await connection.execute('SELECT * FROM employees LIMIT 10');
    
    records.forEach((record, index) => {
      console.log(`\n记录 ${index + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  姓名: ${record.name || '未知'}`);
      console.log(`  员工编码: ${record.employee_code || '未知'}`);
      console.log(`  部门: ${record.department_name || '未知'}`);
      console.log(`  岗位: ${record.position_name || '未知'}`);
    });
    
    // 查询部门分布
    const [departments] = await connection.execute(`
      SELECT department_name, COUNT(*) as count 
      FROM employees 
      WHERE department_name IS NOT NULL 
      GROUP BY department_name 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log('\n部门分布 (前10个):');
    departments.forEach((dept, index) => {
      console.log(`  ${index + 1}. ${dept.department_name || '未知'}: ${dept.count} 人`);
    });
    
    // 关闭数据库连接
    await connection.end();
    console.log('\n查询完成');
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error);
