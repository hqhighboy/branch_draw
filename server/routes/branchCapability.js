const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// 设置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 数据存储路径
const dataDir = path.join(__dirname, '../data');
const branchCapabilityPath = path.join(dataDir, 'branchCapability.json');
const managementScoresPath = path.join(dataDir, 'managementScores.json');

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据文件
if (!fs.existsSync(branchCapabilityPath)) {
  fs.writeFileSync(branchCapabilityPath, JSON.stringify({ branches: [], lastUpdated: new Date().toISOString() }));
}

if (!fs.existsSync(managementScoresPath)) {
  fs.writeFileSync(managementScoresPath, JSON.stringify([]));
}

// 获取支部综合能力画像数据
router.get('/branch-capability', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(branchCapabilityPath, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('获取支部综合能力画像数据失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 上传支部综合能力画像数据
router.post('/upload-capability', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // 处理Excel数据，转换为应用所需格式
    const branches = data.map(row => {
      return {
        id: row.id || uuidv4(),
        name: row.name,
        baseDimensions: {
          organizationManagement: {
            name: '组织管理水平',
            score: parseFloat(row.organizationManagement) || 0,
            weight: 0.15,
            weightedScore: parseFloat(row.organizationManagement) * 0.15 || 0,
            grade: getGrade(parseFloat(row.organizationManagement) || 0),
            trend: row.organizationManagementTrend || 'stable'
          },
          kpiExecution: {
            name: '考核指标执行',
            score: parseFloat(row.kpiExecution) || 0,
            weight: 0.15,
            weightedScore: parseFloat(row.kpiExecution) * 0.15 || 0,
            grade: getGrade(parseFloat(row.kpiExecution) || 0),
            trend: row.kpiExecutionTrend || 'stable'
          },
          talentDevelopment: {
            name: '人才培养创新',
            score: parseFloat(row.talentDevelopment) || 0,
            weight: 0.15,
            weightedScore: parseFloat(row.talentDevelopment) * 0.15 || 0,
            grade: getGrade(parseFloat(row.talentDevelopment) || 0),
            trend: row.talentDevelopmentTrend || 'stable'
          },
          partyBuilding: {
            name: '党建基础工作',
            score: parseFloat(row.partyBuilding) || 0,
            weight: 0.15,
            weightedScore: parseFloat(row.partyBuilding) * 0.15 || 0,
            grade: getGrade(parseFloat(row.partyBuilding) || 0),
            trend: row.partyBuildingTrend || 'stable'
          },
          taskFollowUp: {
            name: '任务跟进落实',
            score: parseFloat(row.taskFollowUp) || 0,
            weight: 0.15,
            weightedScore: parseFloat(row.taskFollowUp) * 0.15 || 0,
            grade: getGrade(parseFloat(row.taskFollowUp) || 0),
            trend: row.taskFollowUpTrend || 'stable'
          },
          safetyCompliance: {
            name: '安全廉洁底线',
            score: parseFloat(row.safetyCompliance) || 0,
            weight: 0.15,
            weightedScore: parseFloat(row.safetyCompliance) * 0.15 || 0,
            grade: getGrade(parseFloat(row.safetyCompliance) || 0),
            trend: row.safetyComplianceTrend || 'stable'
          },
          satisfaction: {
            name: '群众满意度',
            score: parseFloat(row.satisfaction) || 0,
            weight: 0.10,
            weightedScore: parseFloat(row.satisfaction) * 0.10 || 0,
            grade: getGrade(parseFloat(row.satisfaction) || 0),
            trend: row.satisfactionTrend || 'stable'
          }
        },
        baseScore: 0, // 将在下面计算
        baseGrade: '', // 将在下面计算
        managementScores: [], // 将从管理赋值数据中获取
        managementScore: 0, // 将在下面计算
        totalScore: 0, // 将在下面计算
        grade: '', // 将在下面计算
        tags: (row.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag),
        radarData: {
          labels: [
            '组织管理水平',
            '考核指标执行',
            '人才培养创新',
            '党建基础工作',
            '任务跟进落实',
            '安全廉洁底线',
            '群众满意度',
            '管理赋值'
          ],
          data: [
            parseFloat(row.organizationManagement) || 0,
            parseFloat(row.kpiExecution) || 0,
            parseFloat(row.talentDevelopment) || 0,
            parseFloat(row.partyBuilding) || 0,
            parseFloat(row.taskFollowUp) || 0,
            parseFloat(row.safetyCompliance) || 0,
            parseFloat(row.satisfaction) || 0,
            0 // 管理赋值，将在下面计算
          ]
        },
        trendData: {
          months: ['1月', '2月', '3月', '4月', '5月', '6月'],
          baseScores: [
            parseFloat(row.baseScore1) || 0,
            parseFloat(row.baseScore2) || 0,
            parseFloat(row.baseScore3) || 0,
            parseFloat(row.baseScore4) || 0,
            parseFloat(row.baseScore5) || 0,
            parseFloat(row.baseScore6) || 0
          ],
          managementScores: [
            parseFloat(row.managementScore1) || 0,
            parseFloat(row.managementScore2) || 0,
            parseFloat(row.managementScore3) || 0,
            parseFloat(row.managementScore4) || 0,
            parseFloat(row.managementScore5) || 0,
            parseFloat(row.managementScore6) || 0
          ],
          totalScores: [
            parseFloat(row.totalScore1) || 0,
            parseFloat(row.totalScore2) || 0,
            parseFloat(row.totalScore3) || 0,
            parseFloat(row.totalScore4) || 0,
            parseFloat(row.totalScore5) || 0,
            parseFloat(row.totalScore6) || 0
          ]
        }
      };
    });

    // 获取管理赋值数据
    const managementScores = JSON.parse(fs.readFileSync(managementScoresPath, 'utf8'));

    // 计算各支部的得分
    branches.forEach(branch => {
      // 计算基础评价总分
      branch.baseScore = parseFloat((
        branch.baseDimensions.organizationManagement.weightedScore +
        branch.baseDimensions.kpiExecution.weightedScore +
        branch.baseDimensions.talentDevelopment.weightedScore +
        branch.baseDimensions.partyBuilding.weightedScore +
        branch.baseDimensions.taskFollowUp.weightedScore +
        branch.baseDimensions.safetyCompliance.weightedScore +
        branch.baseDimensions.satisfaction.weightedScore
      ).toFixed(1));

      // 计算基础评价等级
      branch.baseGrade = getGrade(branch.baseScore);

      // 获取该支部的管理赋值
      branch.managementScores = managementScores.filter(score => score.branchId === branch.id);

      // 计算管理赋值总分
      branch.managementScore = parseFloat(branch.managementScores.reduce((sum, item) => sum + item.score, 0).toFixed(1));

      // 更新雷达图中的管理赋值数据
      branch.radarData.data[7] = branch.managementScore * 10; // 转换为百分制

      // 计算综合得分
      branch.totalScore = parseFloat((branch.baseScore * 0.8 + branch.managementScore * 2).toFixed(1));

      // 计算综合等级
      branch.grade = getGrade(branch.totalScore);
    });

    // 保存数据
    fs.writeFileSync(branchCapabilityPath, JSON.stringify({
      branches,
      lastUpdated: new Date().toISOString()
    }));

    // 删除上传的文件
    fs.unlinkSync(filePath);

    res.json({ success: true, message: '数据上传成功' });
  } catch (error) {
    console.error('上传支部综合能力画像数据失败:', error);
    res.status(500).json({ error: '上传数据失败' });
  }
});

// 下载支部综合能力画像模板
router.get('/capability-template', (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../templates/capability-template.xlsx');
    res.download(templatePath);
  } catch (error) {
    console.error('下载模板失败:', error);
    res.status(500).json({ error: '下载模板失败' });
  }
});

// 获取管理赋值列表
router.get('/management-scores', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(managementScoresPath, 'utf8'));
    res.json(data);
  } catch (error) {
    console.error('获取管理赋值列表失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 获取指定支部的管理赋值
router.get('/management-scores/:branchId', (req, res) => {
  try {
    const { branchId } = req.params;
    const data = JSON.parse(fs.readFileSync(managementScoresPath, 'utf8'));
    const branchScores = data.filter(score => score.branchId === parseInt(branchId));
    res.json(branchScores);
  } catch (error) {
    console.error('获取支部管理赋值失败:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 添加管理赋值
router.post('/management-scores', (req, res) => {
  try {
    const newScore = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };

    // 读取现有数据
    const data = JSON.parse(fs.readFileSync(managementScoresPath, 'utf8'));
    
    // 添加新数据
    data.push(newScore);
    
    // 保存数据
    fs.writeFileSync(managementScoresPath, JSON.stringify(data));

    // 更新支部综合能力画像数据
    updateBranchCapabilityData();

    res.json({ success: true, message: '添加管理赋值成功', data: newScore });
  } catch (error) {
    console.error('添加管理赋值失败:', error);
    res.status(500).json({ error: '添加数据失败' });
  }
});

// 更新管理赋值
router.put('/management-scores/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedScore = req.body;

    // 读取现有数据
    const data = JSON.parse(fs.readFileSync(managementScoresPath, 'utf8'));
    
    // 查找并更新数据
    const index = data.findIndex(score => score.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '未找到指定的管理赋值' });
    }
    
    data[index] = { ...data[index], ...updatedScore, updatedAt: new Date().toISOString() };
    
    // 保存数据
    fs.writeFileSync(managementScoresPath, JSON.stringify(data));

    // 更新支部综合能力画像数据
    updateBranchCapabilityData();

    res.json({ success: true, message: '更新管理赋值成功', data: data[index] });
  } catch (error) {
    console.error('更新管理赋值失败:', error);
    res.status(500).json({ error: '更新数据失败' });
  }
});

// 删除管理赋值
router.delete('/management-scores/:id', (req, res) => {
  try {
    const { id } = req.params;

    // 读取现有数据
    const data = JSON.parse(fs.readFileSync(managementScoresPath, 'utf8'));
    
    // 查找并删除数据
    const index = data.findIndex(score => score.id === id);
    if (index === -1) {
      return res.status(404).json({ error: '未找到指定的管理赋值' });
    }
    
    data.splice(index, 1);
    
    // 保存数据
    fs.writeFileSync(managementScoresPath, JSON.stringify(data));

    // 更新支部综合能力画像数据
    updateBranchCapabilityData();

    res.json({ success: true, message: '删除管理赋值成功' });
  } catch (error) {
    console.error('删除管理赋值失败:', error);
    res.status(500).json({ error: '删除数据失败' });
  }
});

// 上传佐证材料
router.post('/upload-evidence', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }

    res.json({ 
      success: true, 
      message: '佐证材料上传成功', 
      data: {
        filePath: req.file.path,
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('上传佐证材料失败:', error);
    res.status(500).json({ error: '上传佐证材料失败' });
  }
});

// 导出报表
router.get('/export-capability-report', (req, res) => {
  try {
    // 读取数据
    const data = JSON.parse(fs.readFileSync(branchCapabilityPath, 'utf8'));
    
    // 创建工作簿
    const workbook = xlsx.utils.book_new();
    
    // 创建工作表数据
    const wsData = data.branches.map(branch => ({
      '支部名称': branch.name,
      '组织管理水平': branch.baseDimensions.organizationManagement.score,
      '考核指标执行': branch.baseDimensions.kpiExecution.score,
      '人才培养创新': branch.baseDimensions.talentDevelopment.score,
      '党建基础工作': branch.baseDimensions.partyBuilding.score,
      '任务跟进落实': branch.baseDimensions.taskFollowUp.score,
      '安全廉洁底线': branch.baseDimensions.safetyCompliance.score,
      '群众满意度': branch.baseDimensions.satisfaction.score,
      '基础评价得分': branch.baseScore,
      '基础评价等级': branch.baseGrade,
      '管理赋值得分': branch.managementScore,
      '综合能力得分': branch.totalScore,
      '综合能力等级': branch.grade,
      '特征标签': branch.tags.join(',')
    }));
    
    // 创建工作表
    const ws = xlsx.utils.json_to_sheet(wsData);
    
    // 将工作表添加到工作簿
    xlsx.utils.book_append_sheet(workbook, ws, '支部综合能力画像');
    
    // 创建临时文件
    const tempFilePath = path.join(__dirname, '../../uploads', `支部综合能力画像报表_${Date.now()}.xlsx`);
    
    // 写入文件
    xlsx.writeFile(workbook, tempFilePath);
    
    // 发送文件
    res.download(tempFilePath, '支部综合能力画像报表.xlsx', (err) => {
      if (err) {
        console.error('下载报表失败:', err);
      }
      
      // 删除临时文件
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error('导出报表失败:', error);
    res.status(500).json({ error: '导出报表失败' });
  }
});

// 辅助函数：根据得分获取等级
function getGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  return 'C';
}

// 辅助函数：更新支部综合能力画像数据
function updateBranchCapabilityData() {
  try {
    // 读取数据
    const branchCapabilityData = JSON.parse(fs.readFileSync(branchCapabilityPath, 'utf8'));
    const managementScores = JSON.parse(fs.readFileSync(managementScoresPath, 'utf8'));
    
    // 更新各支部的管理赋值数据
    branchCapabilityData.branches.forEach(branch => {
      // 获取该支部的管理赋值
      branch.managementScores = managementScores.filter(score => score.branchId === branch.id);
      
      // 计算管理赋值总分
      branch.managementScore = parseFloat(branch.managementScores.reduce((sum, item) => sum + item.score, 0).toFixed(1));
      
      // 更新雷达图中的管理赋值数据
      branch.radarData.data[7] = branch.managementScore * 10; // 转换为百分制
      
      // 计算综合得分
      branch.totalScore = parseFloat((branch.baseScore * 0.8 + branch.managementScore * 2).toFixed(1));
      
      // 计算综合等级
      branch.grade = getGrade(branch.totalScore);
    });
    
    // 保存数据
    fs.writeFileSync(branchCapabilityPath, JSON.stringify({
      branches: branchCapabilityData.branches,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('更新支部综合能力画像数据失败:', error);
  }
}

module.exports = router;
