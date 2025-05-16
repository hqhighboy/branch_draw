/**
 * 合并员工数据脚本
 * 
 * 此脚本用于合并员工信息和党员信息数据，确保不会有重复计算
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

/**
 * 合并员工数据
 */
async function mergeEmployeeData() {
  console.log('开始合并员工数据...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 开始事务
    await conn.beginTransaction();
    
    // 1. 查找重复的员工记录
    console.log('查找重复的员工记录...');
    const [duplicates] = await conn.query(`
      SELECT name, COUNT(*) as count
      FROM employees
      GROUP BY name
      HAVING COUNT(*) > 1
    `);
    
    console.log(`找到 ${duplicates.length} 个重复的员工记录`);
    
    // 2. 处理重复的员工记录
    for (const dup of duplicates) {
      const name = dup.name;
      console.log(`处理重复员工: ${name}`);
      
      // 查找该员工的所有记录
      const [records] = await conn.query(`
        SELECT id, name, political_status, department_path
        FROM employees
        WHERE name = ?
        ORDER BY id
      `, [name]);
      
      if (records.length <= 1) {
        continue; // 没有重复记录，跳过
      }
      
      // 保留第一条记录，删除其他记录
      const keepId = records[0].id;
      const deleteIds = records.slice(1).map(r => r.id);
      
      console.log(`  保留ID: ${keepId}, 删除IDs: ${deleteIds.join(', ')}`);
      
      // 更新member_positions表中的employee_id
      for (const deleteId of deleteIds) {
        await conn.query(`
          UPDATE member_positions
          SET employee_id = ?
          WHERE employee_id = ?
        `, [keepId, deleteId]);
      }
      
      // 删除重复的员工记录
      await conn.query(`
        DELETE FROM employees
        WHERE id IN (?)
      `, [deleteIds]);
    }
    
    // 3. 更新branch_personnel表
    console.log('\n更新branch_personnel表...');
    
    // 清空branch_personnel表
    await conn.query('TRUNCATE TABLE branch_personnel');
    
    // 从member_positions表重新填充branch_personnel表
    const [positions] = await conn.query(`
      SELECT DISTINCT mp.employee_id, mp.branch_id, e.name, e.department_path
      FROM member_positions mp
      JOIN employees e ON mp.employee_id = e.id
    `);
    
    console.log(`从member_positions表中找到 ${positions.length} 条记录`);
    
    for (const pos of positions) {
      await conn.query(`
        INSERT INTO branch_personnel (branch_id, name, department_path)
        VALUES (?, ?, ?)
      `, [pos.branch_id, pos.name, pos.department_path]);
    }
    
    // 4. 更新支部人数
    console.log('\n更新支部人数...');
    const [branches] = await conn.query('SELECT id, name FROM branches');
    
    for (const branch of branches) {
      // 计算党员数量
      const [countResult] = await conn.query(
        'SELECT COUNT(*) as count FROM branch_personnel WHERE branch_id = ?',
        [branch.id]
      );
      const memberCount = countResult[0].count;
      
      // 更新支部信息
      await conn.query(
        'UPDATE branches SET member_count = ? WHERE id = ?',
        [memberCount, branch.id]
      );
      
      console.log(`支部 ${branch.name} 的党员数量: ${memberCount}`);
    }
    
    // 提交事务
    await conn.commit();
    
    // 5. 显示最终结果
    console.log('\n合并后的数据统计:');
    
    const [employeeCount] = await conn.query('SELECT COUNT(*) as count FROM employees');
    console.log(`员工总数: ${employeeCount[0].count}`);
    
    const [branchPersonnelCount] = await conn.query('SELECT COUNT(*) as count FROM branch_personnel');
    console.log(`支部人员总数: ${branchPersonnelCount[0].count}`);
    
    const [positionCount] = await conn.query('SELECT COUNT(*) as count FROM member_positions');
    console.log(`党员职务总数: ${positionCount[0].count}`);
    
    console.log('\n员工数据合并完成');
  } catch (error) {
    // 回滚事务
    await conn.rollback();
    console.error('合并员工数据时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行合并
mergeEmployeeData().catch(console.error);
