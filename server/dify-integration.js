/**
 * Dify集成接口
 *
 * 此脚本提供了与Dify平台集成的API接口，用于接收Excel数据并更新到系统中
 */

const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
const { importDataToDatabase } = require('./scripts/import-excel');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 只接受Excel文件
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只支持Excel文件格式(.xlsx, .xls)'));
    }
  }
});

// 创建路由器
const router = express.Router();

/**
 * 从Excel文件中读取数据
 * @param {string} filePath Excel文件路径
 * @returns {Object} 包含所有工作表数据的对象
 */
function readExcelFile(filePath) {
  try {
    // 读取Excel文件
    const workbook = xlsx.readFile(filePath);

    // 获取所有工作表
    const result = {};
    workbook.SheetNames.forEach(sheetName => {
      // 将工作表转换为JSON
      const worksheet = workbook.Sheets[sheetName];
      result[sheetName] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    });

    return result;
  } catch (error) {
    console.error('读取Excel文件失败:', error);
    throw new Error(`读取Excel文件失败: ${error.message}`);
  }
}

/**
 * 处理Excel数据并导入到数据库
 * @param {string} filePath Excel文件路径
 * @returns {Promise<Object>} 处理结果
 */
async function processExcelData(filePath) {
  try {
    // 读取Excel文件
    const excelData = readExcelFile(filePath);

    // 连接数据库
    const connection = await mysql.createConnection(dbConfig);

    // 处理支部基本信息
    let branchesSheet = null;

    // 尝试找到包含支部信息的工作表
    for (const sheetName in excelData) {
      if (sheetName.toLowerCase().includes('支部') ||
          sheetName.toLowerCase().includes('branch') ||
          sheetName.toLowerCase().includes('基本')) {
        branchesSheet = sheetName;
        break;
      }
    }

    if (!branchesSheet) {
      throw new Error('未找到支部基本信息工作表');
    }

    // 解析支部基本信息
    const branchesData = parseExcelData(excelData[branchesSheet], 'branches');

    // 导入支部基本信息
    const branchImportResult = await importDataToDatabase(branchesData.data, 'branches', connection);

    // 处理其他数据...

    // 关闭数据库连接
    await connection.end();

    return {
      success: true,
      message: '数据导入成功',
      stats: {
        branches: {
          inserted: branchImportResult.inserted,
          updated: branchImportResult.updated,
          errors: branchImportResult.errors.length
        }
      }
    };
  } catch (error) {
    console.error('处理Excel数据失败:', error);
    return {
      success: false,
      message: `处理Excel数据失败: ${error.message}`
    };
  }
}

// API路由

/**
 * 上传Excel文件并导入数据
 * POST /api/dify/import-excel
 */
router.post('/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传Excel文件'
      });
    }

    // 处理Excel数据
    const result = await processExcelData(req.file.path);

    // 返回处理结果
    res.json(result);
  } catch (error) {
    console.error('导入Excel数据失败:', error);
    res.status(500).json({
      success: false,
      message: `导入Excel数据失败: ${error.message}`
    });
  }
});

/**
 * 获取导入模板
 * GET /api/dify/template
 */
router.get('/template', (req, res) => {
  const templatePath = path.join(__dirname, 'import_template.xlsx');

  if (!fs.existsSync(templatePath)) {
    return res.status(404).json({
      success: false,
      message: '导入模板不存在'
    });
  }

  res.download(templatePath, 'import_template.xlsx');
});

/**
 * 获取导入历史
 * GET /api/dify/import-history
 */
router.get('/import-history', async (req, res) => {
  try {
    // 连接数据库
    const connection = await mysql.createConnection(dbConfig);

    // 查询导入历史
    const [rows] = await connection.execute(`
      SELECT * FROM import_history
      ORDER BY import_time DESC
      LIMIT 10
    `);

    // 关闭数据库连接
    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取导入历史失败:', error);
    res.status(500).json({
      success: false,
      message: `获取导入历史失败: ${error.message}`
    });
  }
});

/**
 * 获取Dify配置
 * GET /api/dify/config
 */
router.get('/config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config/dify-config.json');

    if (!fs.existsSync(configPath)) {
      return res.json({
        success: true,
        config: {
          apiKey: '',
          baseUrl: 'https://api.dify.ai/v1',
          workflowId: ''
        }
      });
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('获取Dify配置失败:', error);
    res.status(500).json({
      success: false,
      message: `获取Dify配置失败: ${error.message}`
    });
  }
});

/**
 * 保存Dify配置
 * POST /api/dify/config
 */
router.post('/config', (req, res) => {
  try {
    const { apiKey, baseUrl, workflowId } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: '请提供API密钥'
      });
    }

    const config = {
      apiKey,
      baseUrl: baseUrl || 'https://api.dify.ai/v1',
      workflowId: workflowId || ''
    };

    const configDir = path.join(__dirname, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, 'dify-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

    res.json({
      success: true,
      message: '配置已保存'
    });
  } catch (error) {
    console.error('保存Dify配置失败:', error);
    res.status(500).json({
      success: false,
      message: `保存Dify配置失败: ${error.message}`
    });
  }
});

/**
 * 测试Dify API连接
 * GET /api/dify/test-connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config/dify-config.json');

    if (!fs.existsSync(configPath)) {
      return res.status(400).json({
        success: false,
        message: '未找到配置文件'
      });
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        message: '未配置API密钥'
      });
    }

    // 导入Dify客户端
    const DifyClient = require('./dify-client');
    const client = new DifyClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl
    });

    // 测试连接
    const result = await client.getWorkflows();

    res.json({
      success: true,
      message: 'API连接成功'
    });
  } catch (error) {
    console.error('测试Dify API连接失败:', error);
    res.status(500).json({
      success: false,
      message: `测试Dify API连接失败: ${error.message}`
    });
  }
});

/**
 * 创建工作流
 * POST /api/dify/create-workflow
 */
router.post('/create-workflow', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config/dify-config.json');

    if (!fs.existsSync(configPath)) {
      return res.status(400).json({
        success: false,
        message: '未找到配置文件'
      });
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        message: '未配置API密钥'
      });
    }

    // 导入Dify客户端和工作流配置
    const DifyClient = require('./dify-client');
    const { workflowDefinition } = require('./dify-workflow-config');

    const client = new DifyClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl
    });

    // 创建工作流
    const result = await client.createWorkflow(workflowDefinition);

    // 更新配置
    config.workflowId = result.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

    res.json({
      success: true,
      message: '工作流创建成功',
      workflowId: result.id
    });
  } catch (error) {
    console.error('创建工作流失败:', error);
    res.status(500).json({
      success: false,
      message: `创建工作流失败: ${error.message}`
    });
  }
});

/**
 * 更新工作流
 * PUT /api/dify/update-workflow/:id
 */
router.put('/update-workflow/:id', async (req, res) => {
  try {
    const workflowId = req.params.id;

    const configPath = path.join(__dirname, 'config/dify-config.json');

    if (!fs.existsSync(configPath)) {
      return res.status(400).json({
        success: false,
        message: '未找到配置文件'
      });
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        message: '未配置API密钥'
      });
    }

    // 导入Dify客户端和工作流配置
    const DifyClient = require('./dify-client');
    const { workflowDefinition } = require('./dify-workflow-config');

    const client = new DifyClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl
    });

    // 更新工作流
    await client.updateWorkflow(workflowId, workflowDefinition);

    res.json({
      success: true,
      message: '工作流更新成功'
    });
  } catch (error) {
    console.error('更新工作流失败:', error);
    res.status(500).json({
      success: false,
      message: `更新工作流失败: ${error.message}`
    });
  }
});

/**
 * 获取工作流执行历史
 * GET /api/dify/executions/:id
 */
router.get('/executions/:id', async (req, res) => {
  try {
    const workflowId = req.params.id;

    const configPath = path.join(__dirname, 'config/dify-config.json');

    if (!fs.existsSync(configPath)) {
      return res.status(400).json({
        success: false,
        message: '未找到配置文件'
      });
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);

    if (!config.apiKey) {
      return res.status(400).json({
        success: false,
        message: '未配置API密钥'
      });
    }

    // 导入Dify客户端
    const DifyClient = require('./dify-client');

    const client = new DifyClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl
    });

    // 获取工作流执行历史
    const result = await client.getWorkflowExecutions(workflowId);

    res.json({
      success: true,
      executions: result.executions
    });
  } catch (error) {
    console.error('获取工作流执行历史失败:', error);
    res.status(500).json({
      success: false,
      message: `获取工作流执行历史失败: ${error.message}`
    });
  }
});

module.exports = router;
