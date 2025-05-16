/**
 * 员工信息查询工具
 * 
 * 此脚本用于查询员工信息数据库
 */

const mysql = require('mysql2/promise');
const readline = require('readline');
const { promisify } = require('util');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

/**
 * 主函数
 */
async function main() {
  console.log('=== 员工信息查询工具 ===');
  
  let connection;
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 查询总记录数
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM employees');
    const total = countResult[0].total;
    console.log(`\n数据库中共有 ${total} 条员工记录`);
    
    if (total === 0) {
      console.log('数据库中没有员工记录，请先导入数据');
      return;
    }
    
    // 查询部门分布
    const [departmentsResult] = await connection.execute(`
      SELECT department_name, COUNT(*) as count 
      FROM employees 
      WHERE department_name IS NOT NULL 
      GROUP BY department_name 
      ORDER BY count DESC
    `);
    
    console.log('\n部门分布:');
    departmentsResult.slice(0, 10).forEach((dept, index) => {
      console.log(`  ${index + 1}. ${dept.department_name}: ${dept.count} 人`);
    });
    
    if (departmentsResult.length > 10) {
      console.log(`  ...以及其他 ${departmentsResult.length - 10} 个部门`);
    }
    
    // 查询岗位分布
    const [positionsResult] = await connection.execute(`
      SELECT position_name, COUNT(*) as count 
      FROM employees 
      WHERE position_name IS NOT NULL 
      GROUP BY position_name 
      ORDER BY count DESC
    `);
    
    console.log('\n岗位分布:');
    positionsResult.slice(0, 10).forEach((pos, index) => {
      console.log(`  ${index + 1}. ${pos.position_name}: ${pos.count} 人`);
    });
    
    if (positionsResult.length > 10) {
      console.log(`  ...以及其他 ${positionsResult.length - 10} 个岗位`);
    }
    
    // 查询学历分布
    const [educationResult] = await connection.execute(`
      SELECT education_level, COUNT(*) as count 
      FROM employees 
      WHERE education_level IS NOT NULL 
      GROUP BY education_level 
      ORDER BY count DESC
    `);
    
    console.log('\n学历分布:');
    educationResult.forEach((edu, index) => {
      console.log(`  ${index + 1}. ${edu.education_level}: ${edu.count} 人`);
    });
    
    // 查询年龄分布
    const [ageResult] = await connection.execute(`
      SELECT 
        CASE 
          WHEN age < 30 THEN '30岁以下'
          WHEN age >= 30 AND age < 40 THEN '30-40岁'
          WHEN age >= 40 AND age < 50 THEN '40-50岁'
          ELSE '50岁以上'
        END as age_group,
        COUNT(*) as count
      FROM employees 
      WHERE age IS NOT NULL 
      GROUP BY age_group 
      ORDER BY 
        CASE age_group
          WHEN '30岁以下' THEN 1
          WHEN '30-40岁' THEN 2
          WHEN '40-50岁' THEN 3
          WHEN '50岁以上' THEN 4
        END
    `);
    
    console.log('\n年龄分布:');
    ageResult.forEach((age, index) => {
      console.log(`  ${index + 1}. ${age.age_group}: ${age.count} 人`);
    });
    
    // 交互式查询
    console.log('\n您可以进行交互式查询:');
    
    let continueQuery = true;
    while (continueQuery) {
      console.log('\n查询选项:');
      console.log('  1. 按姓名查询');
      console.log('  2. 按部门查询');
      console.log('  3. 按岗位查询');
      console.log('  4. 按学历查询');
      console.log('  5. 退出');
      
      const option = await question('请选择查询选项 (1-5): ');
      
      switch (option) {
        case '1': {
          const name = await question('请输入姓名: ');
          const [result] = await connection.execute(
            'SELECT * FROM employees WHERE name LIKE ?',
            [`%${name}%`]
          );
          
          console.log(`\n查询结果: 找到 ${result.length} 条记录`);
          result.forEach((emp, index) => {
            console.log(`\n记录 ${index + 1}:`);
            console.log(`  姓名: ${emp.name}`);
            console.log(`  员工编码: ${emp.employee_code}`);
            console.log(`  部门: ${emp.department_name}`);
            console.log(`  岗位: ${emp.position_name}`);
            console.log(`  学历: ${emp.education_level}`);
            console.log(`  年龄: ${emp.age}`);
          });
          break;
        }
        
        case '2': {
          const department = await question('请输入部门名称: ');
          const [result] = await connection.execute(
            'SELECT * FROM employees WHERE department_name LIKE ?',
            [`%${department}%`]
          );
          
          console.log(`\n查询结果: 找到 ${result.length} 条记录`);
          if (result.length > 10) {
            console.log('显示前10条记录:');
            result.slice(0, 10).forEach((emp, index) => {
              console.log(`  ${index + 1}. ${emp.name} - ${emp.position_name}`);
            });
            console.log(`  ...以及其他 ${result.length - 10} 条记录`);
          } else {
            result.forEach((emp, index) => {
              console.log(`  ${index + 1}. ${emp.name} - ${emp.position_name}`);
            });
          }
          break;
        }
        
        case '3': {
          const position = await question('请输入岗位名称: ');
          const [result] = await connection.execute(
            'SELECT * FROM employees WHERE position_name LIKE ?',
            [`%${position}%`]
          );
          
          console.log(`\n查询结果: 找到 ${result.length} 条记录`);
          if (result.length > 10) {
            console.log('显示前10条记录:');
            result.slice(0, 10).forEach((emp, index) => {
              console.log(`  ${index + 1}. ${emp.name} - ${emp.department_name}`);
            });
            console.log(`  ...以及其他 ${result.length - 10} 条记录`);
          } else {
            result.forEach((emp, index) => {
              console.log(`  ${index + 1}. ${emp.name} - ${emp.department_name}`);
            });
          }
          break;
        }
        
        case '4': {
          const education = await question('请输入学历: ');
          const [result] = await connection.execute(
            'SELECT * FROM employees WHERE education_level LIKE ?',
            [`%${education}%`]
          );
          
          console.log(`\n查询结果: 找到 ${result.length} 条记录`);
          if (result.length > 10) {
            console.log('显示前10条记录:');
            result.slice(0, 10).forEach((emp, index) => {
              console.log(`  ${index + 1}. ${emp.name} - ${emp.department_name} - ${emp.position_name}`);
            });
            console.log(`  ...以及其他 ${result.length - 10} 条记录`);
          } else {
            result.forEach((emp, index) => {
              console.log(`  ${index + 1}. ${emp.name} - ${emp.department_name} - ${emp.position_name}`);
            });
          }
          break;
        }
        
        case '5':
          continueQuery = false;
          break;
          
        default:
          console.log('无效选项，请重新选择');
      }
    }
    
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

// 执行主函数
main().catch(console.error);
