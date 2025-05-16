/**
 * 员工数据查询工具
 * 
 * 此脚本用于查询employee_data表中的数据
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
 * 显示菜单
 */
function showMenu() {
  console.log('\n=== 员工数据查询工具 ===');
  console.log('1. 查看所有员工数据');
  console.log('2. 按部门查询');
  console.log('3. 按姓名查询');
  console.log('4. 按技能等级查询');
  console.log('5. 按技术等级查询');
  console.log('6. 按学历查询');
  console.log('7. 按年龄段查询');
  console.log('8. 统计部门分布');
  console.log('9. 统计学历分布');
  console.log('0. 退出');
  console.log('======================');
}

/**
 * 查询所有员工数据
 * @param {mysql.Connection} connection 数据库连接
 * @param {number} limit 限制条数
 * @param {number} offset 偏移量
 */
async function queryAllEmployees(connection, limit = 10, offset = 0) {
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM employee_data LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM employee_data`
    );
    
    const total = countResult[0].total;
    
    console.log(`\n员工数据 (${offset + 1} - ${Math.min(offset + limit, total)} / ${total}):`);
    
    rows.forEach((row, index) => {
      console.log(`\n${index + 1 + offset}. ${row.name || '未知姓名'}`);
      console.log(`   部门: ${row.department_path || '未知'}`);
      console.log(`   最高技能: ${row.highest_skill_level_category || '未知'} ${row.highest_skill_level_type || ''}`);
      console.log(`   最高技术: ${row.highest_tech_level_category || '未知'} ${row.highest_tech_level_type || ''}`);
      console.log(`   最高学历: ${row.highest_education || '未知'}`);
      console.log(`   年龄: ${row.age || '未知'}`);
    });
    
    if (total > offset + limit) {
      const viewMore = await question('\n查看更多? (y/n): ');
      if (viewMore.toLowerCase() === 'y') {
        await queryAllEmployees(connection, limit, offset + limit);
      }
    }
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

/**
 * 按部门查询
 * @param {mysql.Connection} connection 数据库连接
 */
async function queryByDepartment(connection) {
  try {
    // 获取所有部门
    const [departments] = await connection.execute(
      `SELECT DISTINCT department_path FROM employee_data WHERE department_path IS NOT NULL ORDER BY department_path`
    );
    
    console.log('\n可用部门:');
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.department_path}`);
    });
    
    const deptChoice = await question('\n请选择部门编号 (输入0返回): ');
    
    if (deptChoice === '0') {
      return;
    }
    
    const deptIndex = parseInt(deptChoice) - 1;
    
    if (deptIndex >= 0 && deptIndex < departments.length) {
      const selectedDept = departments[deptIndex].department_path;
      
      const [employees] = await connection.execute(
        `SELECT * FROM employee_data WHERE department_path = ?`,
        [selectedDept]
      );
      
      console.log(`\n${selectedDept} 部门的员工 (共 ${employees.length} 人):`);
      
      employees.forEach((emp, index) => {
        console.log(`\n${index + 1}. ${emp.name || '未知姓名'}`);
        console.log(`   最高技能: ${emp.highest_skill_level_category || '未知'} ${emp.highest_skill_level_type || ''}`);
        console.log(`   最高技术: ${emp.highest_tech_level_category || '未知'} ${emp.highest_tech_level_type || ''}`);
        console.log(`   最高学历: ${emp.highest_education || '未知'}`);
        console.log(`   年龄: ${emp.age || '未知'}`);
      });
    } else {
      console.log('无效的选择');
    }
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

/**
 * 按姓名查询
 * @param {mysql.Connection} connection 数据库连接
 */
async function queryByName(connection) {
  try {
    const name = await question('\n请输入要查询的姓名 (支持模糊查询): ');
    
    const [employees] = await connection.execute(
      `SELECT * FROM employee_data WHERE name LIKE ?`,
      [`%${name}%`]
    );
    
    console.log(`\n查询结果 (共 ${employees.length} 人):`);
    
    employees.forEach((emp, index) => {
      console.log(`\n${index + 1}. ${emp.name || '未知姓名'}`);
      console.log(`   部门: ${emp.department_path || '未知'}`);
      console.log(`   最高技能: ${emp.highest_skill_level_category || '未知'} ${emp.highest_skill_level_type || ''}`);
      console.log(`   最高技术: ${emp.highest_tech_level_category || '未知'} ${emp.highest_tech_level_type || ''}`);
      console.log(`   最高学历: ${emp.highest_education || '未知'}`);
      console.log(`   年龄: ${emp.age || '未知'}`);
    });
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

/**
 * 按技能等级查询
 * @param {mysql.Connection} connection 数据库连接
 */
async function queryBySkillLevel(connection) {
  try {
    // 获取所有技能等级
    const [skillLevels] = await connection.execute(
      `SELECT DISTINCT highest_skill_level_category FROM employee_data 
       WHERE highest_skill_level_category IS NOT NULL 
       ORDER BY highest_skill_level_category`
    );
    
    console.log('\n可用技能等级:');
    skillLevels.forEach((level, index) => {
      console.log(`${index + 1}. ${level.highest_skill_level_category}`);
    });
    
    const levelChoice = await question('\n请选择技能等级编号 (输入0返回): ');
    
    if (levelChoice === '0') {
      return;
    }
    
    const levelIndex = parseInt(levelChoice) - 1;
    
    if (levelIndex >= 0 && levelIndex < skillLevels.length) {
      const selectedLevel = skillLevels[levelIndex].highest_skill_level_category;
      
      const [employees] = await connection.execute(
        `SELECT * FROM employee_data WHERE highest_skill_level_category = ?`,
        [selectedLevel]
      );
      
      console.log(`\n技能等级为 ${selectedLevel} 的员工 (共 ${employees.length} 人):`);
      
      employees.forEach((emp, index) => {
        console.log(`\n${index + 1}. ${emp.name || '未知姓名'}`);
        console.log(`   部门: ${emp.department_path || '未知'}`);
        console.log(`   技能工种: ${emp.highest_skill_level_type || '未知'}`);
        console.log(`   最高学历: ${emp.highest_education || '未知'}`);
        console.log(`   年龄: ${emp.age || '未知'}`);
      });
    } else {
      console.log('无效的选择');
    }
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

/**
 * 按技术等级查询
 * @param {mysql.Connection} connection 数据库连接
 */
async function queryByTechLevel(connection) {
  try {
    // 获取所有技术等级
    const [techLevels] = await connection.execute(
      `SELECT DISTINCT highest_tech_level_category FROM employee_data 
       WHERE highest_tech_level_category IS NOT NULL 
       ORDER BY highest_tech_level_category`
    );
    
    console.log('\n可用技术等级:');
    techLevels.forEach((level, index) => {
      console.log(`${index + 1}. ${level.highest_tech_level_category}`);
    });
    
    const levelChoice = await question('\n请选择技术等级编号 (输入0返回): ');
    
    if (levelChoice === '0') {
      return;
    }
    
    const levelIndex = parseInt(levelChoice) - 1;
    
    if (levelIndex >= 0 && levelIndex < techLevels.length) {
      const selectedLevel = techLevels[levelIndex].highest_tech_level_category;
      
      const [employees] = await connection.execute(
        `SELECT * FROM employee_data WHERE highest_tech_level_category = ?`,
        [selectedLevel]
      );
      
      console.log(`\n技术等级为 ${selectedLevel} 的员工 (共 ${employees.length} 人):`);
      
      employees.forEach((emp, index) => {
        console.log(`\n${index + 1}. ${emp.name || '未知姓名'}`);
        console.log(`   部门: ${emp.department_path || '未知'}`);
        console.log(`   技术工种: ${emp.highest_tech_level_type || '未知'}`);
        console.log(`   最高学历: ${emp.highest_education || '未知'}`);
        console.log(`   年龄: ${emp.age || '未知'}`);
      });
    } else {
      console.log('无效的选择');
    }
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

/**
 * 按学历查询
 * @param {mysql.Connection} connection 数据库连接
 */
async function queryByEducation(connection) {
  try {
    // 获取所有学历
    const [educations] = await connection.execute(
      `SELECT DISTINCT highest_education FROM employee_data 
       WHERE highest_education IS NOT NULL 
       ORDER BY highest_education`
    );
    
    console.log('\n可用学历:');
    educations.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.highest_education}`);
    });
    
    const eduChoice = await question('\n请选择学历编号 (输入0返回): ');
    
    if (eduChoice === '0') {
      return;
    }
    
    const eduIndex = parseInt(eduChoice) - 1;
    
    if (eduIndex >= 0 && eduIndex < educations.length) {
      const selectedEdu = educations[eduIndex].highest_education;
      
      const [employees] = await connection.execute(
        `SELECT * FROM employee_data WHERE highest_education = ?`,
        [selectedEdu]
      );
      
      console.log(`\n学历为 ${selectedEdu} 的员工 (共 ${employees.length} 人):`);
      
      employees.forEach((emp, index) => {
        console.log(`\n${index + 1}. ${emp.name || '未知姓名'}`);
        console.log(`   部门: ${emp.department_path || '未知'}`);
        console.log(`   最高技能: ${emp.highest_skill_level_category || '未知'} ${emp.highest_skill_level_type || ''}`);
        console.log(`   最高技术: ${emp.highest_tech_level_category || '未知'} ${emp.highest_tech_level_type || ''}`);
        console.log(`   年龄: ${emp.age || '未知'}`);
      });
    } else {
      console.log('无效的选择');
    }
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

/**
 * 按年龄段查询
 * @param {mysql.Connection} connection 数据库连接
 */
async function queryByAgeRange(connection) {
  try {
    console.log('\n年龄段查询:');
    console.log('1. 30岁以下');
    console.log('2. 30-40岁');
    console.log('3. 40-50岁');
    console.log('4. 50岁以上');
    
    const rangeChoice = await question('\n请选择年龄段 (输入0返回): ');
    
    if (rangeChoice === '0') {
      return;
    }
    
    let minAge = 0;
    let maxAge = 100;
    let rangeName = '';
    
    switch (rangeChoice) {
      case '1':
        maxAge = 30;
        rangeName = '30岁以下';
        break;
      case '2':
        minAge = 30;
        maxAge = 40;
        rangeName = '30-40岁';
        break;
      case '3':
        minAge = 40;
        maxAge = 50;
        rangeName = '40-50岁';
        break;
      case '4':
        minAge = 50;
        rangeName = '50岁以上';
        break;
      default:
        console.log('无效的选择');
        return;
    }
    
    const [employees] = await connection.execute(
      `SELECT * FROM employee_data WHERE age >= ? AND age < ?`,
      [minAge, maxAge]
    );
    
    console.log(`\n年龄段为 ${rangeName} 的员工 (共 ${employees.length} 人):`);
    
    employees.forEach((emp, index) => {
      console.log(`\n${index + 1}. ${emp.name || '未知姓名'} (${emp.age || '未知'}岁)`);
      console.log(`   部门: ${emp.department_path || '未知'}`);
      console.log(`   最高技能: ${emp.highest_skill_level_category || '未知'} ${emp.highest_skill_level_type || ''}`);
      console.log(`   最高技术: ${emp.highest_tech_level_category || '未知'} ${emp.highest_tech_level_type || ''}`);
      console.log(`   最高学历: ${emp.highest_education || '未知'}`);
    });
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

/**
 * 统计部门分布
 * @param {mysql.Connection} connection 数据库连接
 */
async function statDepartmentDistribution(connection) {
  try {
    const [result] = await connection.execute(`
      SELECT 
        department_path,
        COUNT(*) as count
      FROM 
        employee_data
      WHERE 
        department_path IS NOT NULL
      GROUP BY 
        department_path
      ORDER BY 
        count DESC
    `);
    
    console.log('\n部门人员分布:');
    
    let totalCount = 0;
    result.forEach(row => {
      totalCount += row.count;
    });
    
    result.forEach((row, index) => {
      const percentage = ((row.count / totalCount) * 100).toFixed(2);
      console.log(`${index + 1}. ${row.department_path}: ${row.count}人 (${percentage}%)`);
    });
  } catch (error) {
    console.error('统计失败:', error.message);
  }
}

/**
 * 统计学历分布
 * @param {mysql.Connection} connection 数据库连接
 */
async function statEducationDistribution(connection) {
  try {
    const [result] = await connection.execute(`
      SELECT 
        highest_education,
        COUNT(*) as count
      FROM 
        employee_data
      WHERE 
        highest_education IS NOT NULL
      GROUP BY 
        highest_education
      ORDER BY 
        count DESC
    `);
    
    console.log('\n学历分布:');
    
    let totalCount = 0;
    result.forEach(row => {
      totalCount += row.count;
    });
    
    result.forEach((row, index) => {
      const percentage = ((row.count / totalCount) * 100).toFixed(2);
      console.log(`${index + 1}. ${row.highest_education}: ${row.count}人 (${percentage}%)`);
    });
  } catch (error) {
    console.error('统计失败:', error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 检查employee_data表是否存在
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'employee_data'`,
      [dbConfig.database]
    );
    
    if (tables.length === 0) {
      console.error('employee_data表不存在，请先导入数据');
      await connection.end();
      rl.close();
      return;
    }
    
    // 检查表中是否有数据
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as count FROM employee_data`
    );
    
    if (countResult[0].count === 0) {
      console.error('employee_data表中没有数据，请先导入数据');
      await connection.end();
      rl.close();
      return;
    }
    
    console.log(`employee_data表中共有 ${countResult[0].count} 条记录`);
    
    let running = true;
    
    while (running) {
      showMenu();
      
      const choice = await question('请选择操作 (输入对应的数字): ');
      
      switch (choice) {
        case '1':
          await queryAllEmployees(connection);
          break;
        case '2':
          await queryByDepartment(connection);
          break;
        case '3':
          await queryByName(connection);
          break;
        case '4':
          await queryBySkillLevel(connection);
          break;
        case '5':
          await queryByTechLevel(connection);
          break;
        case '6':
          await queryByEducation(connection);
          break;
        case '7':
          await queryByAgeRange(connection);
          break;
        case '8':
          await statDepartmentDistribution(connection);
          break;
        case '9':
          await statEducationDistribution(connection);
          break;
        case '0':
          running = false;
          console.log('感谢使用，再见!');
          break;
        default:
          console.log('无效的选择，请重试');
      }
      
      if (running) {
        await question('\n按回车键继续...');
      }
    }
    
    // 关闭数据库连接
    await connection.end();
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    rl.close();
  }
}

// 执行主函数
main().catch(console.error);
