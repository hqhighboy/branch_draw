/**
 * @file 上传控制器，处理数据上传相关的请求
 * @author 党支部分析系统开发团队
 * @date 2024-06-01
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const db = require('../db');

/**
 * 处理支部基本信息上传
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.uploadBranchInfo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '未找到上传的文件'
      });
    }

    // 读取Excel文件
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: '上传的文件不包含任何数据'
      });
    }

    // 开始事务
    const connection = await db.pool.getConnection();
    await connection.beginTransaction();

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    try {
      for (const row of data) {
        // 验证必填字段
        if (!row['支部名称']) {
          failedCount++;
          errors.push(`第 ${data.indexOf(row) + 2} 行: 支部名称不能为空`);
          continue;
        }

        // 检查支部是否已存在
        const [existingBranches] = await connection.query(
          'SELECT id FROM branches WHERE name = ?',
          [row['支部名称']]
        );

        let branchId;
        if (existingBranches.length > 0) {
          // 更新现有支部
          branchId = existingBranches[0].id;
          await connection.query(
            `UPDATE branches 
             SET secretary = ?, 
                 deputy_secretary = ?, 
                 organizational_commissioner = ?,
                 disciplinary_commissioner = ?,
                 propaganda_commissioner = ?,
                 learning_commissioner = ?,
                 member_count = ?,
                 average_age = ?,
                 performance_2024 = ?,
                 secretary_project = ?,
                 honors = ?
             WHERE id = ?`,
            [
              row['书记'] || null,
              row['副书记'] || null,
              row['组织委员'] || null,
              row['纪律委员'] || null,
              row['宣传委员'] || null,
              row['学习委员'] || null,
              row['党员人数'] || null,
              row['平均年龄'] || null,
              row['2024年表现'] || null,
              row['书记项目'] || null,
              row['荣誉'] || null,
              branchId
            ]
          );
        } else {
          // 创建新支部
          const [insertResult] = await connection.query(
            `INSERT INTO branches (
              name, secretary, deputy_secretary, organizational_commissioner,
              disciplinary_commissioner, propaganda_commissioner, learning_commissioner,
              member_count, average_age, performance_2024, secretary_project, honors
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              row['支部名称'],
              row['书记'] || null,
              row['副书记'] || null,
              row['组织委员'] || null,
              row['纪律委员'] || null,
              row['宣传委员'] || null,
              row['学习委员'] || null,
              row['党员人数'] || null,
              row['平均年龄'] || null,
              row['2024年表现'] || null,
              row['书记项目'] || null,
              row['荣誉'] || null
            ]
          );
          branchId = insertResult.insertId;
        }

        // 处理年龄分布数据
        if (row['30岁以下'] || row['30-40岁'] || row['40-50岁'] || row['50岁以上']) {
          // 删除现有数据
          await connection.query('DELETE FROM branch_age_distribution WHERE branch_id = ?', [branchId]);
          
          // 插入新数据
          const ageGroups = [
            { group: '30岁以下', value: row['30岁以下'] },
            { group: '30-40岁', value: row['30-40岁'] },
            { group: '40-50岁', value: row['40-50岁'] },
            { group: '50岁以上', value: row['50岁以上'] }
          ];
          
          for (const ageGroup of ageGroups) {
            if (ageGroup.value) {
              await connection.query(
                'INSERT INTO branch_age_distribution (branch_id, age_group, percentage) VALUES (?, ?, ?)',
                [branchId, ageGroup.group, parseInt(ageGroup.value) || 0]
              );
            }
          }
        }

        // 处理学历分布数据
        if (row['博士'] || row['硕士'] || row['本科'] || row['大专及以下']) {
          // 删除现有数据
          await connection.query('DELETE FROM branch_education_distribution WHERE branch_id = ?', [branchId]);
          
          // 插入新数据
          const educationGroups = [
            { level: '博士', value: row['博士'] },
            { level: '硕士', value: row['硕士'] },
            { level: '本科', value: row['本科'] },
            { level: '大专及以下', value: row['大专及以下'] }
          ];
          
          for (const educationGroup of educationGroups) {
            if (educationGroup.value) {
              await connection.query(
                'INSERT INTO branch_education_distribution (branch_id, education_level, percentage) VALUES (?, ?, ?)',
                [branchId, educationGroup.level, parseInt(educationGroup.value) || 0]
              );
            }
          }
        }

        successCount++;
      }

      // 提交事务
      await connection.commit();

      res.json({
        success: true,
        success_count: successCount,
        failed_count: failedCount,
        errors: errors,
        message: `成功导入 ${successCount} 条数据，失败 ${failedCount} 条`
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('上传支部基本信息失败:', error);
    res.status(500).json({
      success: false,
      message: `上传失败: ${error.message}`
    });
  }
};

/**
 * 处理支部能力画像上传
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.uploadBranchCapability = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '未找到上传的文件'
      });
    }

    // 读取Excel文件
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: '上传的文件不包含任何数据'
      });
    }

    // 开始事务
    const connection = await db.pool.getConnection();
    await connection.beginTransaction();

    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    try {
      for (const row of data) {
        // 验证必填字段
        if (!row['支部名称']) {
          failedCount++;
          errors.push(`第 ${data.indexOf(row) + 2} 行: 支部名称不能为空`);
          continue;
        }

        // 查找支部ID
        const [branches] = await connection.query('SELECT id FROM branches WHERE name = ?', [row['支部名称']]);
        
        if (branches.length === 0) {
          failedCount++;
          errors.push(`第 ${data.indexOf(row) + 2} 行: 找不到名为 "${row['支部名称']}" 的支部`);
          continue;
        }

        const branchId = branches[0].id;

        // 检查是否已存在能力画像数据
        const [existingCapability] = await connection.query(
          'SELECT id FROM branch_capability WHERE branch_id = ?',
          [branchId]
        );

        if (existingCapability.length > 0) {
          // 更新现有数据
          await connection.query(
            `UPDATE branch_capability 
             SET management_level = ?, 
                 kpi_execution = ?, 
                 talent_development = ?,
                 party_building = ?,
                 task_follow_up = ?,
                 safety_compliance = ?,
                 innovation_capability = ?,
                 team_collaboration = ?,
                 resource_utilization = ?,
                 overall_score = ?
             WHERE branch_id = ?`,
            [
              parseFloat(row['管理水平']) || 0,
              parseFloat(row['KPI执行']) || 0,
              parseFloat(row['人才培养']) || 0,
              parseFloat(row['党建工作']) || 0,
              parseFloat(row['任务跟进']) || 0,
              parseFloat(row['安全合规']) || 0,
              parseFloat(row['创新能力']) || 0,
              parseFloat(row['团队协作']) || 0,
              parseFloat(row['资源利用']) || 0,
              parseFloat(row['总体得分']) || 0,
              branchId
            ]
          );
        } else {
          // 插入新数据
          await connection.query(
            `INSERT INTO branch_capability (
              branch_id, branch_name, management_level, kpi_execution, 
              talent_development, party_building, task_follow_up, 
              safety_compliance, innovation_capability, team_collaboration, 
              resource_utilization, overall_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              branchId,
              row['支部名称'],
              parseFloat(row['管理水平']) || 0,
              parseFloat(row['KPI执行']) || 0,
              parseFloat(row['人才培养']) || 0,
              parseFloat(row['党建工作']) || 0,
              parseFloat(row['任务跟进']) || 0,
              parseFloat(row['安全合规']) || 0,
              parseFloat(row['创新能力']) || 0,
              parseFloat(row['团队协作']) || 0,
              parseFloat(row['资源利用']) || 0,
              parseFloat(row['总体得分']) || 0
            ]
          );
        }

        successCount++;
      }

      // 提交事务
      await connection.commit();

      res.json({
        success: true,
        success_count: successCount,
        failed_count: failedCount,
        errors: errors,
        message: `成功导入 ${successCount} 条数据，失败 ${failedCount} 条`
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('上传支部能力画像失败:', error);
    res.status(500).json({
      success: false,
      message: `上传失败: ${error.message}`
    });
  }
};
