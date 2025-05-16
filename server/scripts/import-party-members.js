/**
 * 党员信息导入工具
 * 支持增量导入党员信息和职务信息
 */
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const db = require('../db');

// 职务类型映射
const POSITION_TYPES = {
  '党委书记': 'party_committee_secretary',
  '党委副书记': 'party_committee_deputy_secretary',
  '纪委书记': 'discipline_committee_secretary',
  '工会主席': 'union_chairman',
  '党委委员': 'party_committee_member',
  '支部书记': 'branch_secretary',
  '支部副书记': 'branch_deputy_secretary',
  '组织委员': 'organizational_commissioner',
  '纪检委员': 'disciplinary_commissioner',
  '宣传委员': 'propaganda_commissioner',
  '青年委员': 'youth_commissioner',
  '生产委员': 'production_commissioner'
};

/**
 * 导入党员信息
 * @param {string} filePath - Excel文件路径
 * @returns {Promise<{success: boolean, message: string, stats: object}>}
 */
async function importPartyMembers(filePath) {
  const stats = {
    total: 0,
    inserted: 0,
    updated: 0,
    positions_added: 0,
    errors: []
  };

  try {
    // 读取Excel文件
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    stats.total = data.length;
    console.log(`开始导入 ${stats.total} 条党员信息...`);

    // 获取数据库连接
    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      // 获取所有支部信息，用于匹配
      const [branches] = await connection.query('SELECT id, name FROM branches');
      const branchMap = {};
      branches.forEach(branch => {
        branchMap[branch.name] = branch.id;
      });

      // 处理每一行数据
      for (const row of data) {
        try {
          // 检查必要字段
          if (!row['姓名']) {
            stats.errors.push(`行 ${stats.total} 缺少姓名字段`);
            continue;
          }

          // 查找员工信息
          const [employees] = await connection.query(
            'SELECT id FROM employees WHERE name = ?',
            [row['姓名']]
          );

          let employeeId;
          if (employees.length > 0) {
            // 员工已存在
            employeeId = employees[0].id;
          } else {
            // 创建新员工记录
            const [result] = await connection.query(
              'INSERT INTO employees (name, political_status, created_at) VALUES (?, ?, NOW())',
              [row['姓名'], row['政治面貌'] || '党员']
            );
            employeeId = result.insertId;
            stats.inserted++;
          }

          // 处理支部信息
          const branchName = row['支部信息'];
          if (branchName && branchMap[branchName]) {
            const branchId = branchMap[branchName];

            // 检查员工是否已经在该支部
            const [existingMember] = await connection.query(
              'SELECT id FROM branch_personnel WHERE name = ? AND branch_id = ?',
              [row['姓名'], branchId]
            );

            if (existingMember.length === 0) {
              // 添加员工到支部
              await connection.query(
                'INSERT INTO branch_personnel (name, branch_id, department_path, created_at) VALUES (?, ?, ?, NOW())',
                [row['姓名'], branchId, row['支部信息']]
              );
            } else {
              // 更新员工信息
              await connection.query(
                'UPDATE branch_personnel SET department_path = ?, updated_at = NOW() WHERE name = ? AND branch_id = ?',
                [row['支部信息'], row['姓名'], branchId]
              );
              stats.updated++;
            }

            // 处理职务信息
            for (const [positionName, positionKey] of Object.entries(POSITION_TYPES)) {
              if (row[positionName] === '是' || row[positionName] === 'Y' || row[positionName] === '√') {
                // 添加职务
                try {
                  await connection.query(
                    'INSERT INTO member_positions (employee_id, branch_id, position_type) VALUES (?, ?, ?)',
                    [employeeId, branchId, positionKey]
                  );
                  stats.positions_added++;
                } catch (posErr) {
                  console.error(`添加职务失败: ${posErr.message}`);
                }
              }
            }
          } else if (branchName) {
            stats.errors.push(`找不到支部: ${branchName}`);
          }
        } catch (rowErr) {
          stats.errors.push(`处理 ${row['姓名']} 时出错: ${rowErr.message}`);
        }
      }

      await connection.commit();
      console.log('导入完成!');
      return {
        success: true,
        message: '导入成功',
        stats
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('导入失败:', error);
    return {
      success: false,
      message: `导入失败: ${error.message}`,
      stats
    };
  }
}

/**
 * 创建必要的数据库表
 */
async function ensureTablesExist() {
  const connection = await db.pool.getConnection();
  try {
    // 检查并确保必要的字段存在
    console.log('检查必要的字段...');

    // 检查并创建职务表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS member_positions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        branch_id INT NOT NULL,
        position_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (branch_id) REFERENCES branches(id),
        UNIQUE KEY unique_position (employee_id, branch_id, position_type)
      )
    `);
    console.log('已确保 member_positions 表存在');
  } catch (error) {
    console.error('创建表失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 导出函数
module.exports = {
  importPartyMembers,
  ensureTablesExist,
  POSITION_TYPES
};
