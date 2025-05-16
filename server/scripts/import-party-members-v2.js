/**
 * 导入党员信息脚本 V2
 * 
 * 此脚本用于导入党员信息Excel文件到数据库
 */

const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

/**
 * 导入党员信息
 * @param {string} filePath Excel文件路径
 */
async function importPartyMembers(filePath) {
  console.log(`开始导入党员信息: ${filePath}`);
  
  // 读取Excel文件
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`读取到 ${data.length} 条党员记录`);
  
  // 连接数据库
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 开始事务
    await conn.beginTransaction();
    
    // 清空相关表
    console.log('清空相关表...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE branch_personnel');
    await conn.query('TRUNCATE TABLE member_positions');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // 导入党员信息
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // 获取所有支部
    const [branches] = await conn.query('SELECT id, name FROM branches');
    const branchMap = {};
    branches.forEach(branch => {
      branchMap[branch.name] = branch.id;
    });
    
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      
      try {
        // 检查必填字段
        if (!record['姓名']) {
          throw new Error('党员姓名为必填项');
        }
        
        if (!record['支部信息']) {
          throw new Error('支部信息为必填项');
        }
        
        // 查找员工ID
        const [employees] = await conn.query(
          'SELECT id FROM employees WHERE name = ?',
          [record['姓名']]
        );
        
        if (employees.length === 0) {
          // 如果员工不存在，则创建新员工
          const [result] = await conn.query(
            `INSERT INTO employees (name, political_status)
             VALUES (?, ?)`,
            [record['姓名'], record['政治面貌'] || '党员']
          );
          var employeeId = result.insertId;
          console.log(`创建新员工: ${record['姓名']}, ID: ${employeeId}`);
        } else {
          var employeeId = employees[0].id;
          
          // 更新员工政治面貌
          await conn.query(
            `UPDATE employees SET political_status = ? WHERE id = ?`,
            [record['政治面貌'] || '党员', employeeId]
          );
        }
        
        // 查找支部ID
        const branchName = record['支部信息'];
        const branchId = branchMap[branchName];
        
        if (!branchId) {
          throw new Error(`找不到支部: ${branchName}`);
        }
        
        // 添加到branch_personnel表
        await conn.query(
          `INSERT INTO branch_personnel (branch_id, name, department_path)
           VALUES (?, ?, ?)`,
          [branchId, record['姓名'], record['部门路径'] || null]
        );
        
        // 处理党员职务
        const positionFields = [
          { field: '党委书记', type: 'party_committee_secretary' },
          { field: '党委副书记', type: 'party_committee_deputy_secretary' },
          { field: '纪委书记', type: 'discipline_secretary' },
          { field: '工会主席', type: 'union_chairman' },
          { field: '党委委员', type: 'party_committee_member' },
          { field: '支部书记', type: 'branch_secretary' },
          { field: '支部副书记', type: 'branch_deputy_secretary' },
          { field: '组织委员', type: 'organizational_commissioner' },
          { field: '纪检委员', type: 'disciplinary_commissioner' },
          { field: '宣传委员', type: 'propaganda_commissioner' },
          { field: '青年委员', type: 'youth_commissioner' },
          { field: '生产委员', type: 'production_commissioner' }
        ];
        
        for (const position of positionFields) {
          const value = record[position.field];
          if (value && ['是', '√', 'Y', 'y', 'yes', 'Yes', 'YES', 'true', 'True', 'TRUE', '1'].includes(value)) {
            await conn.query(
              `INSERT INTO member_positions (employee_id, branch_id, position_type)
               VALUES (?, ?, ?)`,
              [employeeId, branchId, position.type]
            );
            
            // 更新支部表中的职务信息
            if (position.type === 'branch_secretary') {
              await conn.query(
                'UPDATE branches SET secretary = ? WHERE id = ?',
                [record['姓名'], branchId]
              );
            } else if (position.type === 'branch_deputy_secretary') {
              await conn.query(
                'UPDATE branches SET deputy_secretary = ? WHERE id = ?',
                [record['姓名'], branchId]
              );
            } else if (position.type === 'organizational_commissioner') {
              await conn.query(
                'UPDATE branches SET organizational_commissioner = ? WHERE id = ?',
                [record['姓名'], branchId]
              );
            } else if (position.type === 'disciplinary_commissioner') {
              await conn.query(
                'UPDATE branches SET disciplinary_commissioner = ? WHERE id = ?',
                [record['姓名'], branchId]
              );
            } else if (position.type === 'propaganda_commissioner') {
              await conn.query(
                'UPDATE branches SET propaganda_commissioner = ? WHERE id = ?',
                [record['姓名'], branchId]
              );
            } else if (position.type === 'youth_commissioner') {
              await conn.query(
                'UPDATE branches SET learning_commissioner = ? WHERE id = ?',
                [record['姓名'], branchId]
              );
            } else if (position.type === 'production_commissioner') {
              await conn.query(
                'UPDATE branches SET production_commissioner = ? WHERE id = ?',
                [record['姓名'], branchId]
              );
            }
          }
        }
        
        successCount++;
        
        // 每100条记录输出一次进度
        if (successCount % 100 === 0 || successCount === data.length) {
          console.log(`已处理 ${successCount}/${data.length} 条记录`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          index: i,
          name: record['姓名'] || '未知',
          error: error.message
        });
        
        console.error(`导入第 ${i+1} 条记录失败:`, error.message);
      }
    }
    
    // 更新支部人数
    for (const branch of branches) {
      const branchId = branch.id;
      
      // 计算党员数量
      const [countResult] = await conn.query(
        'SELECT COUNT(*) as count FROM branch_personnel WHERE branch_id = ?',
        [branchId]
      );
      const memberCount = countResult[0].count;
      
      // 更新支部信息
      await conn.query(
        'UPDATE branches SET member_count = ? WHERE id = ?',
        [memberCount, branchId]
      );
      
      console.log(`支部 ${branch.name} 的党员数量: ${memberCount}`);
    }
    
    // 提交事务
    await conn.commit();
    
    console.log('\n导入完成!');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);
    
    if (errorCount > 0) {
      console.log('\n失败记录:');
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. 姓名: ${error.name}, 错误: ${error.error}`);
      });
      
      if (errors.length > 5) {
        console.log(`  ...以及其他 ${errors.length - 5} 条错误记录`);
      }
    }
    
    return {
      success: true,
      total: data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // 只返回前10条错误
    };
  } catch (error) {
    // 回滚事务
    await conn.rollback();
    console.error('导入过程中发生错误:', error);
    
    return {
      success: false,
      message: error.message,
      error
    };
  } finally {
    await conn.end();
  }
}

/**
 * 主函数
 */
async function main() {
  const filePath = process.argv[2] || 'D:/Projects/cursor/branch-analysis/server/党员信息导入模板V2.xlsx';
  
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }
  
  try {
    // 导入党员信息
    const result = await importPartyMembers(filePath);
    
    if (result.success) {
      console.log('导入成功!');
    } else {
      console.error('导入失败:', result.message);
    }
  } catch (error) {
    console.error('程序执行出错:', error);
  }
}

// 执行主函数
main().catch(console.error);
