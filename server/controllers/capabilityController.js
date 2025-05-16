/**
 * @file 支部能力画像控制器，处理支部能力画像相关的请求
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

const db = require('../db');

/**
 * 获取支部能力画像
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getBranchCapability = async (req, res) => {
  try {
    const branchId = req.params.id;
    
    // 查询支部能力画像
    const [rows] = await db.query(`
      SELECT 
        branch_id as branchId,
        branch_name as branchName,
        management_level as managementLevel,
        kpi_execution as kpiExecution,
        talent_development as talentDevelopment,
        party_building as partyBuilding,
        task_follow_up as taskFollowUp,
        safety_compliance as safetyCompliance,
        innovation_capability as innovationCapability,
        team_collaboration as teamCollaboration,
        resource_utilization as resourceUtilization,
        overall_score as overallScore
      FROM branch_capability
      WHERE branch_id = ?
    `, [branchId]);
    
    if (rows.length === 0) {
      // 如果没有数据，生成模拟数据
      const mockData = await generateMockCapabilityData(branchId);
      return res.json({
        success: true,
        data: mockData
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error(`获取支部(ID: ${req.params.id})能力画像失败:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '获取支部能力画像失败'
    });
  }
};

/**
 * 获取所有支部的能力画像
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAllBranchesCapability = async (req, res) => {
  try {
    // 查询所有支部能力画像
    const [rows] = await db.query(`
      SELECT 
        branch_id as branchId,
        branch_name as branchName,
        management_level as managementLevel,
        kpi_execution as kpiExecution,
        talent_development as talentDevelopment,
        party_building as partyBuilding,
        task_follow_up as taskFollowUp,
        safety_compliance as safetyCompliance,
        innovation_capability as innovationCapability,
        team_collaboration as teamCollaboration,
        resource_utilization as resourceUtilization,
        overall_score as overallScore
      FROM branch_capability
      ORDER BY branch_name
    `);
    
    if (rows.length === 0) {
      // 如果没有数据，获取所有支部并生成模拟数据
      const [branches] = await db.query('SELECT id, name FROM branches');
      
      const mockData = await Promise.all(
        branches.map(branch => generateMockCapabilityData(branch.id, branch.name))
      );
      
      return res.json({
        success: true,
        data: mockData
      });
    }
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取所有支部能力画像失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '获取所有支部能力画像失败'
    });
  }
};

/**
 * 更新支部能力画像
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateBranchCapability = async (req, res) => {
  try {
    const branchId = req.params.id;
    const {
      managementLevel,
      kpiExecution,
      talentDevelopment,
      partyBuilding,
      taskFollowUp,
      safetyCompliance,
      innovationCapability,
      teamCollaboration,
      resourceUtilization
    } = req.body;
    
    // 验证必填字段
    if (!managementLevel || !kpiExecution || !talentDevelopment || !partyBuilding || 
        !taskFollowUp || !safetyCompliance || !innovationCapability || 
        !teamCollaboration || !resourceUtilization) {
      return res.status(400).json({
        success: false,
        message: '所有能力维度得分不能为空'
      });
    }
    
    // 检查支部是否存在
    const [existingBranches] = await db.query('SELECT id, name FROM branches WHERE id = ?', [branchId]);
    
    if (existingBranches.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的支部'
      });
    }
    
    // 计算综合得分
    const overallScore = Math.round(
      (managementLevel + kpiExecution + talentDevelopment + partyBuilding + 
       taskFollowUp + safetyCompliance + innovationCapability + 
       teamCollaboration + resourceUtilization) / 9
    );
    
    // 检查是否已存在该支部的能力画像
    const [existingCapability] = await db.query(
      'SELECT id FROM branch_capability WHERE branch_id = ?',
      [branchId]
    );
    
    if (existingCapability.length > 0) {
      // 更新现有数据
      await db.query(`
        UPDATE branch_capability
        SET 
          management_level = ?,
          kpi_execution = ?,
          talent_development = ?,
          party_building = ?,
          task_follow_up = ?,
          safety_compliance = ?,
          innovation_capability = ?,
          team_collaboration = ?,
          resource_utilization = ?,
          overall_score = ?
        WHERE branch_id = ?
      `, [
        managementLevel,
        kpiExecution,
        talentDevelopment,
        partyBuilding,
        taskFollowUp,
        safetyCompliance,
        innovationCapability,
        teamCollaboration,
        resourceUtilization,
        overallScore,
        branchId
      ]);
    } else {
      // 插入新数据
      await db.query(`
        INSERT INTO branch_capability (
          branch_id,
          branch_name,
          management_level,
          kpi_execution,
          talent_development,
          party_building,
          task_follow_up,
          safety_compliance,
          innovation_capability,
          team_collaboration,
          resource_utilization,
          overall_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        branchId,
        existingBranches[0].name,
        managementLevel,
        kpiExecution,
        talentDevelopment,
        partyBuilding,
        taskFollowUp,
        safetyCompliance,
        innovationCapability,
        teamCollaboration,
        resourceUtilization,
        overallScore
      ]);
    }
    
    res.json({
      success: true,
      data: {
        branchId,
        branchName: existingBranches[0].name,
        managementLevel,
        kpiExecution,
        talentDevelopment,
        partyBuilding,
        taskFollowUp,
        safetyCompliance,
        innovationCapability,
        teamCollaboration,
        resourceUtilization,
        overallScore
      },
      message: '支部能力画像更新成功'
    });
  } catch (error) {
    console.error(`更新支部(ID: ${req.params.id})能力画像失败:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '更新支部能力画像失败'
    });
  }
};

/**
 * 生成模拟能力画像数据
 * @param {string} branchId - 支部ID
 * @param {string} branchName - 支部名称
 * @returns {Object} 模拟数据
 */
async function generateMockCapabilityData(branchId, branchName = null) {
  try {
    // 如果没有传入支部名称，则查询支部名称
    if (!branchName) {
      const [branchRows] = await db.query('SELECT name FROM branches WHERE id = ?', [branchId]);
      
      if (branchRows.length > 0) {
        branchName = branchRows[0].name;
      } else {
        branchName = `支部${branchId}`;
      }
    }
    
    // 生成随机得分，范围在70-95之间
    const managementLevel = Math.floor(Math.random() * 25) + 70;
    const kpiExecution = Math.floor(Math.random() * 25) + 70;
    const talentDevelopment = Math.floor(Math.random() * 25) + 70;
    const partyBuilding = Math.floor(Math.random() * 25) + 70;
    const taskFollowUp = Math.floor(Math.random() * 25) + 70;
    const safetyCompliance = Math.floor(Math.random() * 25) + 70;
    const innovationCapability = Math.floor(Math.random() * 25) + 70;
    const teamCollaboration = Math.floor(Math.random() * 25) + 70;
    const resourceUtilization = Math.floor(Math.random() * 25) + 70;
    
    // 计算综合得分
    const overallScore = Math.round(
      (managementLevel + kpiExecution + talentDevelopment + partyBuilding + 
       taskFollowUp + safetyCompliance + innovationCapability + 
       teamCollaboration + resourceUtilization) / 9
    );
    
    return {
      branchId,
      branchName,
      managementLevel,
      kpiExecution,
      talentDevelopment,
      partyBuilding,
      taskFollowUp,
      safetyCompliance,
      innovationCapability,
      teamCollaboration,
      resourceUtilization,
      overallScore
    };
  } catch (error) {
    console.error('生成模拟能力画像数据失败:', error);
    return {
      branchId,
      branchName: branchName || `支部${branchId}`,
      managementLevel: 80,
      kpiExecution: 80,
      talentDevelopment: 80,
      partyBuilding: 80,
      taskFollowUp: 80,
      safetyCompliance: 80,
      innovationCapability: 80,
      teamCollaboration: 80,
      resourceUtilization: 80,
      overallScore: 80
    };
  }
}
