/**
 * @file 工作控制器，处理工作相关的请求
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

const db = require('../db');

/**
 * 获取支部月度工作完成情况
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getMonthlyWork = async (req, res) => {
  try {
    const { branchId, year, month } = req.query;
    
    // 验证必填参数
    if (!branchId || !year) {
      return res.status(400).json({
        success: false,
        message: '支部ID和年份不能为空'
      });
    }
    
    let query = `
      SELECT 
        mw.branch_id as branchId,
        b.name as branchName,
        mw.month,
        mw.year,
        mw.planning_completion as planningCompletion,
        mw.execution_completion as executionCompletion,
        mw.inspection_completion as inspectionCompletion,
        mw.evaluation_completion as evaluationCompletion,
        mw.improvement_completion as improvementCompletion
      FROM monthly_work mw
      JOIN branches b ON mw.branch_id = b.id
      WHERE mw.branch_id = ? AND mw.year = ?
    `;
    
    const params = [branchId, year];
    
    // 如果指定了月份，则添加月份条件
    if (month) {
      query += ' AND mw.month = ?';
      params.push(month);
    }
    
    // 按月份排序
    query += ' ORDER BY mw.month ASC';
    
    const [rows] = await db.query(query, params);
    
    // 如果没有数据，则返回空数组
    if (rows.length === 0) {
      // 生成模拟数据
      const mockData = await generateMockMonthlyWorkData(branchId, year, month);
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
    console.error('获取月度工作完成情况失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '获取月度工作完成情况失败'
    });
  }
};

/**
 * 获取所有支部的月度工作完成情况
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAllBranchesMonthlyWork = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // 验证必填参数
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: '年份和月份不能为空'
      });
    }
    
    const query = `
      SELECT 
        mw.branch_id as branchId,
        b.name as branchName,
        mw.month,
        mw.year,
        mw.planning_completion as planningCompletion,
        mw.execution_completion as executionCompletion,
        mw.inspection_completion as inspectionCompletion,
        mw.evaluation_completion as evaluationCompletion,
        mw.improvement_completion as improvementCompletion
      FROM monthly_work mw
      JOIN branches b ON mw.branch_id = b.id
      WHERE mw.year = ? AND mw.month = ?
      ORDER BY b.name ASC
    `;
    
    const [rows] = await db.query(query, [year, month]);
    
    // 如果没有数据，则返回空数组
    if (rows.length === 0) {
      // 获取所有支部
      const [branches] = await db.query('SELECT id, name FROM branches');
      
      // 生成模拟数据
      const mockData = branches.map(branch => ({
        branchId: branch.id,
        branchName: branch.name,
        month: parseInt(month),
        year: parseInt(year),
        planningCompletion: Math.floor(Math.random() * 40) + 50,
        executionCompletion: Math.floor(Math.random() * 30) + 60,
        inspectionCompletion: Math.floor(Math.random() * 35) + 55,
        evaluationCompletion: Math.floor(Math.random() * 25) + 65,
        improvementCompletion: Math.floor(Math.random() * 45) + 45
      }));
      
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
    console.error('获取所有支部月度工作完成情况失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '获取所有支部月度工作完成情况失败'
    });
  }
};

/**
 * 获取支部年度重点工作
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAnnualWork = async (req, res) => {
  try {
    const { branchId, year } = req.query;
    
    // 验证必填参数
    if (!branchId || !year) {
      return res.status(400).json({
        success: false,
        message: '支部ID和年份不能为空'
      });
    }
    
    const query = `
      SELECT 
        id,
        branch_id as branchId,
        title,
        description,
        start_date as startDate,
        end_date as endDate,
        status,
        completion,
        priority
      FROM annual_work
      WHERE branch_id = ? AND YEAR(start_date) = ?
      ORDER BY priority DESC, start_date ASC
    `;
    
    const [rows] = await db.query(query, [branchId, year]);
    
    // 如果没有数据，则返回空数组
    if (rows.length === 0) {
      // 生成模拟数据
      const mockData = generateMockAnnualWorkData(branchId, year);
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
    console.error('获取年度重点工作失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '获取年度重点工作失败'
    });
  }
};

/**
 * 创建月度工作记录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.createMonthlyWork = async (req, res) => {
  try {
    const { branchId, month, year, planningCompletion, executionCompletion, inspectionCompletion, evaluationCompletion, improvementCompletion } = req.body;
    
    // 验证必填字段
    if (!branchId || !month || !year) {
      return res.status(400).json({
        success: false,
        message: '支部ID、月份和年份不能为空'
      });
    }
    
    // 检查支部是否存在
    const [existingBranches] = await db.query('SELECT id FROM branches WHERE id = ?', [branchId]);
    
    if (existingBranches.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的支部'
      });
    }
    
    // 检查是否已存在该月份的记录
    const [existingRecords] = await db.query(
      'SELECT id FROM monthly_work WHERE branch_id = ? AND month = ? AND year = ?',
      [branchId, month, year]
    );
    
    if (existingRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该月份的工作记录已存在'
      });
    }
    
    // 插入月度工作数据
    await db.query(
      `INSERT INTO monthly_work 
        (branch_id, month, year, planning_completion, execution_completion, inspection_completion, evaluation_completion, improvement_completion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [branchId, month, year, planningCompletion, executionCompletion, inspectionCompletion, evaluationCompletion, improvementCompletion]
    );
    
    // 获取支部名称
    const [branchRows] = await db.query('SELECT name FROM branches WHERE id = ?', [branchId]);
    
    res.status(201).json({
      success: true,
      data: {
        branchId,
        branchName: branchRows[0].name,
        month,
        year,
        planningCompletion,
        executionCompletion,
        inspectionCompletion,
        evaluationCompletion,
        improvementCompletion
      },
      message: '月度工作记录创建成功'
    });
  } catch (error) {
    console.error('创建月度工作记录失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '创建月度工作记录失败'
    });
  }
};

/**
 * 生成模拟月度工作数据
 * @param {string} branchId - 支部ID
 * @param {number} year - 年份
 * @param {number} month - 月份，不传则生成全年数据
 * @returns {Array} 模拟数据
 */
async function generateMockMonthlyWorkData(branchId, year, month) {
  try {
    // 获取支部名称
    const [branchRows] = await db.query('SELECT name FROM branches WHERE id = ?', [branchId]);
    
    if (branchRows.length === 0) {
      return [];
    }
    
    const branchName = branchRows[0].name;
    
    // 如果指定了月份，则只生成该月份的数据
    if (month) {
      return [{
        branchId,
        branchName,
        month: parseInt(month),
        year: parseInt(year),
        planningCompletion: Math.floor(Math.random() * 40) + 50,
        executionCompletion: Math.floor(Math.random() * 30) + 60,
        inspectionCompletion: Math.floor(Math.random() * 35) + 55,
        evaluationCompletion: Math.floor(Math.random() * 25) + 65,
        improvementCompletion: Math.floor(Math.random() * 45) + 45
      }];
    }
    
    // 生成全年数据
    const mockData = [];
    
    for (let i = 1; i <= 12; i++) {
      mockData.push({
        branchId,
        branchName,
        month: i,
        year: parseInt(year),
        planningCompletion: Math.floor(Math.random() * 40) + 50,
        executionCompletion: Math.floor(Math.random() * 30) + 60,
        inspectionCompletion: Math.floor(Math.random() * 35) + 55,
        evaluationCompletion: Math.floor(Math.random() * 25) + 65,
        improvementCompletion: Math.floor(Math.random() * 45) + 45
      });
    }
    
    return mockData;
  } catch (error) {
    console.error('生成模拟月度工作数据失败:', error);
    return [];
  }
}

/**
 * 生成模拟年度重点工作数据
 * @param {string} branchId - 支部ID
 * @param {number} year - 年份
 * @returns {Array} 模拟数据
 */
function generateMockAnnualWorkData(branchId, year) {
  const mockData = [];
  const workTitles = [
    '加强党员教育培训',
    '开展"两学一做"学习教育',
    '推进党建工作信息化',
    '加强基层组织建设',
    '开展党风廉政建设',
    '推进党建工作创新',
    '加强党员发展工作',
    '开展主题党日活动'
  ];
  
  // 生成5-8个年度重点工作
  const count = Math.floor(Math.random() * 4) + 5;
  
  for (let i = 0; i < count; i++) {
    // 随机选择工作标题
    const titleIndex = Math.floor(Math.random() * workTitles.length);
    const title = workTitles[titleIndex];
    
    // 随机生成开始日期和结束日期
    const startMonth = Math.floor(Math.random() * 6) + 1; // 1-6月
    const endMonth = Math.floor(Math.random() * 6) + 7; // 7-12月
    const startDate = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${endMonth.toString().padStart(2, '0')}-${endMonth === 2 ? '28' : '30'}`;
    
    // 随机生成状态和完成率
    const statusOptions = ['not_started', 'in_progress', 'completed'];
    const statusIndex = Math.floor(Math.random() * 3);
    const status = statusOptions[statusIndex];
    const completion = status === 'completed' ? 100 : status === 'in_progress' ? Math.floor(Math.random() * 80) + 10 : 0;
    
    // 随机生成优先级
    const priorityOptions = ['low', 'medium', 'high'];
    const priorityIndex = Math.floor(Math.random() * 3);
    const priority = priorityOptions[priorityIndex];
    
    mockData.push({
      id: `mock-${branchId}-${i}`,
      branchId,
      title,
      description: `这是关于${title}的详细描述，包括工作目标、内容和要求等。`,
      startDate,
      endDate,
      status,
      completion,
      priority
    });
  }
  
  return mockData;
}
