/**
 * @file 服务器入口文件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const db = require('./db');
const { importPartyMembers, ensureTablesExist } = require('./scripts/import-party-members');
const { createPartyMemberTemplate } = require('./scripts/create-party-member-template');
const { createEmployeeTemplate } = require('./scripts/create-employee-template');

// 导入路由模块
const branchesRoutes = require('./routes/branches');
const workRoutes = require('./routes/work');
const branchCapabilityRoutes = require('./routes/branchCapability');
const aiIntegration = require('./routes/ai-integration');
const difyIntegration = require('./dify-integration');

// 导入上传控制器
const uploadController = require('./controllers/uploadController');

const app = express();
const port = 3002;

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// 配置内存存储，用于处理Excel文件
const memoryStorage = multer.memoryStorage();

const upload = multer({ storage: storage });
const memoryUpload = multer({ storage: memoryStorage });

// 测试数据库连接
app.get('/api/test-db', async (req, res) => {
  try {
    const connected = await db.testConnection();
    if (connected) {
      res.json({ success: true, message: '数据库连接成功' });
    } else {
      res.status(500).json({ success: false, message: '数据库连接失败' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 使用路由模块
app.use('/api/branches', branchesRoutes);
app.use('/api/work', workRoutes);
app.use('/api', branchCapabilityRoutes);
app.use('/api/dify', difyIntegration);
app.use('/api/ai', aiIntegration);

// 数据上传路由
app.post('/api/upload/branch-info', memoryUpload.single('file'), uploadController.uploadBranchInfo);
app.post('/api/upload/branch-capability', memoryUpload.single('file'), uploadController.uploadBranchCapability);

// 上传Excel文件并更新数据库
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);

    // 处理支部基本信息
    const branchesSheet = workbook.Sheets['支部基本信息'];
    if (!branchesSheet) {
      return res.status(400).json({ success: false, message: 'Excel文件缺少"支部基本信息"工作表' });
    }

    const branchesData = xlsx.utils.sheet_to_json(branchesSheet);

    // 处理人员分布数据
    const distributionSheet = workbook.Sheets['人员分布'];
    if (!distributionSheet) {
      return res.status(400).json({ success: false, message: 'Excel文件缺少"人员分布"工作表' });
    }

    const distributionData = xlsx.utils.sheet_to_json(distributionSheet);

    // 处理年度工作数据
    const annualWorkSheet = workbook.Sheets['年度重点工作'];
    if (!annualWorkSheet) {
      return res.status(400).json({ success: false, message: 'Excel文件缺少"年度重点工作"工作表' });
    }

    const annualWorkData = xlsx.utils.sheet_to_json(annualWorkSheet);

    // 构建完整的支部数据并更新数据库
    // 这里需要根据实际的Excel模板格式进行处理
    // 以下是示例代码，需要根据实际情况调整
    for (const branch of branchesData) {
      const branchId = branch.id;

      // 获取该支部的人员分布数据
      const ageDistribution = {};
      const educationDistribution = {};
      const skillDistribution = {};
      const titleDistribution = {};

      for (const item of distributionData.filter(d => d.branch_id === branchId)) {
        if (item.type === 'age') {
          ageDistribution[item.category] = item.percentage;
        } else if (item.type === 'education') {
          educationDistribution[item.category] = item.percentage;
        } else if (item.type === 'skill') {
          skillDistribution[item.category] = item.percentage;
        } else if (item.type === 'title') {
          titleDistribution[item.category] = item.percentage;
        }
      }

      // 获取该支部的年度工作数据
      const annualWork = annualWorkData
        .filter(work => work.branch_id === branchId)
        .map(work => ({
          id: work.id,
          task: work.task,
          startTime: work.start_time,
          endTime: work.end_time,
          status: work.status,
          progress: work.progress
        }));

      // 构建完整的支部数据
      const branchData = {
        id: branchId,
        name: branch.name,
        secretary: branch.secretary,
        deputySecretary: branch.deputy_secretary,
        organizationalCommissioner: branch.organizational_commissioner,
        disciplinaryCommissioner: branch.disciplinary_commissioner,
        propagandaCommissioner: branch.propaganda_commissioner,
        learningCommissioner: branch.learning_commissioner,
        memberCount: branch.member_count,
        averageAge: branch.average_age,
        performance2024: branch.performance_2024,
        secretaryProject: branch.secretary_project,
        honors: branch.honors,
        ageDistribution,
        educationDistribution,
        skillDistribution,
        titleDistribution,
        annualWork
      };

      // 更新数据库
      await db.updateBranchData(branchData);
    }

    // 删除上传的文件
    fs.unlinkSync(filePath);

    res.json({ success: true, message: '数据已成功更新' });
  } catch (error) {
    console.error('处理上传文件失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 导入党员信息
app.post('/api/import-party-members', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }

    const filePath = req.file.path;

    // 确保必要的表存在
    await ensureTablesExist();

    // 导入党员数据
    const result = await importPartyMembers(filePath);

    // 删除上传的文件
    fs.unlinkSync(filePath);

    res.json(result);
  } catch (error) {
    console.error('导入党员信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 下载党员信息导入模板
app.get('/api/party-member-template', (req, res) => {
  try {
    const templateDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }

    const templatePath = path.join(templateDir, '党员信息导入模板.xlsx');
    createPartyMemberTemplate(templatePath);

    res.download(templatePath, '党员信息导入模板.xlsx', (err) => {
      if (err) {
        console.error('模板下载失败:', err);
      }
    });
  } catch (error) {
    console.error('生成模板失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 下载员工信息导入模板
app.get('/api/employee-template', (req, res) => {
  try {
    const templateDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }

    const templatePath = path.join(templateDir, '员工信息导入模板.xlsx');
    createEmployeeTemplate(templatePath);

    res.download(templatePath, '员工信息导入模板.xlsx', (err) => {
      if (err) {
        console.error('模板下载失败:', err);
      }
    });
  } catch (error) {
    console.error('生成模板失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取党员职务信息
app.get('/api/branch/:id/positions', async (req, res) => {
  try {
    const branchId = req.params.id;

    const [positions] = await db.query(`
      SELECT mp.position_type, e.name, e.id as employee_id
      FROM member_positions mp
      JOIN employees e ON mp.employee_id = e.id
      WHERE mp.branch_id = ?
      ORDER BY mp.position_type
    `, [branchId]);

    res.json(positions);
  } catch (error) {
    console.error('获取党员职务信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取党员统计信息
app.get('/api/party-member-stats', async (req, res) => {
  try {
    // 获取党员总数
    const [totalResult] = await db.pool.query(`
      SELECT COUNT(*) as total FROM employees WHERE political_status = '党员'
    `);
    const totalMembers = totalResult[0].total;

    // 获取各党支部党员数量
    const [branchCountResult] = await db.pool.query(`
      SELECT b.name as branch_name, COUNT(bp.id) as member_count
      FROM branches b
      LEFT JOIN branch_personnel bp ON b.id = bp.branch_id
      GROUP BY b.id
      ORDER BY b.id
    `);

    // 获取党员年龄分布
    const [ageDistributionResult] = await db.pool.query(`
      SELECT
        CASE
          WHEN age < 30 THEN '30岁以下'
          WHEN age >= 30 AND age < 40 THEN '30-40岁'
          WHEN age >= 40 AND age < 50 THEN '40-50岁'
          WHEN age >= 50 THEN '50岁以上'
        END as age_group,
        COUNT(*) as count
      FROM employees
      WHERE political_status = '党员' AND age IS NOT NULL
      GROUP BY age_group
    `);

    // 获取党员学历分布
    const [educationDistributionResult] = await db.pool.query(`
      SELECT education_level, COUNT(*) as count
      FROM employees
      WHERE political_status = '党员' AND education_level IS NOT NULL
      GROUP BY education_level
    `);

    // 获取党员职务分布
    const [positionDistributionResult] = await db.pool.query(`
      SELECT position_type, COUNT(*) as count
      FROM member_positions
      GROUP BY position_type
    `);

    // 构建响应数据
    const stats = {
      totalMembers,
      branchDistribution: branchCountResult,
      ageDistribution: ageDistributionResult,
      educationDistribution: educationDistributionResult,
      positionDistribution: positionDistributionResult
    };

    res.json(stats);
  } catch (error) {
    console.error('获取党员统计信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取指定党支部的党员统计信息
app.get('/api/branch/:id/member-stats', async (req, res) => {
  try {
    const branchId = req.params.id;

    // 获取党支部党员总数
    const [totalResult] = await db.pool.query(`
      SELECT COUNT(*) as total
      FROM branch_personnel
      WHERE branch_id = ?
    `, [branchId]);
    const totalMembers = totalResult[0].total;

    // 获取党支部党员年龄分布
    const [ageDistributionResult] = await db.pool.query(`
      SELECT
        CASE
          WHEN e.age < 30 THEN '30岁以下'
          WHEN e.age >= 30 AND e.age < 40 THEN '30-40岁'
          WHEN e.age >= 40 AND e.age < 50 THEN '40-50岁'
          WHEN e.age >= 50 THEN '50岁以上'
        END as age_group,
        COUNT(*) as count
      FROM branch_personnel bp
      JOIN employees e ON bp.name = e.name
      WHERE bp.branch_id = ? AND e.age IS NOT NULL
      GROUP BY age_group
    `, [branchId]);

    // 获取党支部党员学历分布
    const [educationDistributionResult] = await db.pool.query(`
      SELECT e.education_level, COUNT(*) as count
      FROM branch_personnel bp
      JOIN employees e ON bp.name = e.name
      WHERE bp.branch_id = ? AND e.education_level IS NOT NULL
      GROUP BY e.education_level
    `, [branchId]);

    // 获取党支部党员职务分布
    const [positionDistributionResult] = await db.pool.query(`
      SELECT position_type, COUNT(*) as count
      FROM member_positions
      WHERE branch_id = ?
      GROUP BY position_type
    `, [branchId]);

    // 构建响应数据
    const stats = {
      totalMembers,
      ageDistribution: ageDistributionResult,
      educationDistribution: educationDistributionResult,
      positionDistribution: positionDistributionResult
    };

    res.json(stats);
  } catch (error) {
    console.error('获取党支部党员统计信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 下载支部综合能力画像模板已移至 routes/branchCapability.js

// 下载年度重点工作模板
app.get('/api/annual-work-template', (req, res) => {
  try {
    const templateDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(templateDir)) {
      fs.mkdirSync(templateDir, { recursive: true });
    }

    const templatePath = path.join(templateDir, '年度重点工作模板.xlsx');

    // 如果模板文件不存在，则创建它
    if (!fs.existsSync(templatePath)) {
      // 导入创建模板的函数
      const createAnnualWorkTemplate = require('./create-annual-work-template');
      createAnnualWorkTemplate();
    }

    res.download(templatePath, '年度重点工作模板.xlsx', (err) => {
      if (err) {
        console.error('模板下载失败:', err);
      }
    });
  } catch (error) {
    console.error('生成模板失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 上传支部综合能力画像数据已移至 routes/branchCapability.js

// 上传年度重点工作数据
app.post('/api/upload-annual-work', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);

    // 处理年度重点工作数据
    const annualWorkSheet = workbook.Sheets['年度重点工作'];
    if (!annualWorkSheet) {
      return res.status(400).json({ success: false, message: 'Excel文件缺少"年度重点工作"工作表' });
    }

    const annualWorkData = xlsx.utils.sheet_to_json(annualWorkSheet);

    // 验证数据
    const validBranches = [
      '党建人事党支部',
      '综合党支部',
      '生技党支部',
      '安监党支部',
      '数字运行部党支部',
      '检修试验党支部',
      '继保自动化党支部',
      '500千伏科北数字巡维中心党支部',
      '500千伏北郊数字巡维中心党支部',
      '220千伏罗涌数字巡维中心党支部',
      '220千伏田心数字巡维中心党支部'
    ];

    // 格式化数据
    const formattedData = annualWorkData.map(item => ({
      id: item['ID'] || item['id'],
      branch: item['支部名称'],
      task: item['工作任务'],
      startTime: item['开始时间'],
      endTime: item['结束时间'],
      status: item['状态'],
      progress: item['进度(%)'] || item['进度'] || 0
    }));

    // 验证数据
    const invalidItems = formattedData.filter(item => !validBranches.includes(item.branch));
    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: `以下数据的支部名称无效: ${invalidItems.map(item => item.id).join(', ')}`
      });
    }

    // 按支部分组数据
    const branchWorkData = {};
    validBranches.forEach(branch => {
      branchWorkData[branch] = formattedData.filter(item => item.branch === branch);
    });

    // 统计数据
    let totalCount = 0;
    let insertedCount = 0;
    let updatedCount = 0;
    let errors = [];

    // 增量更新数据库
    for (const branch of validBranches) {
      const branchId = await db.getBranchIdByName(branch);
      if (branchId) {
        // 获取当前支部的年度重点工作数据
        const [existingWorks] = await db.pool.query(
          'SELECT id, task, start_time, end_time, status, progress FROM branch_annual_work WHERE branch_id = ?',
          [branchId]
        );

        // 将现有数据转换为以task为键的对象
        const existingWorkMap = {};
        existingWorks.forEach(work => {
          existingWorkMap[work.task] = work;
        });

        // 处理每一条工作数据
        for (const work of branchWorkData[branch]) {
          totalCount++;

          try {
            // 检查是否已存在相同任务的数据
            if (existingWorkMap[work.task]) {
              // 更新现有数据
              await db.pool.query(`
                UPDATE branch_annual_work
                SET start_time = ?, end_time = ?, status = ?, progress = ?
                WHERE id = ?
              `, [work.startTime, work.endTime, work.status, work.progress, existingWorkMap[work.task].id]);
              updatedCount++;
            } else {
              // 插入新数据
              await db.pool.query(`
                INSERT INTO branch_annual_work (branch_id, task, start_time, end_time, status, progress)
                VALUES (?, ?, ?, ?, ?, ?)
              `, [branchId, work.task, work.startTime, work.endTime, work.status, work.progress]);
              insertedCount++;
            }
          } catch (err) {
            errors.push(`处理支部 "${branch}" 的任务 "${work.task}" 时出错: ${err.message}`);
          }
        }
      }
    }

    // 删除上传的文件
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: '年度重点工作数据已成功更新',
      stats: {
        total: totalCount,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errors
      }
    });
  } catch (error) {
    console.error('处理上传文件失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 注意：路由模块已在上面注册

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
