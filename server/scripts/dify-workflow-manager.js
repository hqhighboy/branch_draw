/**
 * Dify工作流管理工具
 * 
 * 此脚本用于管理Dify工作流，包括创建、更新、删除和执行工作流
 */

const DifyClient = require('../dify-client');
const { workflowDefinition } = require('../dify-workflow-config');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// 配置文件路径
const configPath = path.join(__dirname, '../config/dify-config.json');

/**
 * 加载配置
 * @returns {Object} 配置对象
 */
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
    
    return {
      apiKey: '',
      baseUrl: 'https://api.dify.ai/v1',
      workflowId: ''
    };
  } catch (error) {
    console.error('加载配置失败:', error);
    return {
      apiKey: '',
      baseUrl: 'https://api.dify.ai/v1',
      workflowId: ''
    };
  }
}

/**
 * 保存配置
 * @param {Object} config 配置对象
 */
function saveConfig(config) {
  try {
    // 确保目录存在
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log('配置已保存');
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

/**
 * 创建Dify客户端
 * @param {Object} config 配置对象
 * @returns {DifyClient} Dify客户端
 */
function createDifyClient(config) {
  return new DifyClient({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl
  });
}

/**
 * 创建工作流
 * @param {DifyClient} client Dify客户端
 * @returns {Promise<Object>} 创建结果
 */
async function createWorkflow(client) {
  try {
    console.log('正在创建工作流...');
    const result = await client.createWorkflow(workflowDefinition);
    console.log('工作流创建成功:', result);
    return result;
  } catch (error) {
    console.error('创建工作流失败:', error);
    throw error;
  }
}

/**
 * 更新工作流
 * @param {DifyClient} client Dify客户端
 * @param {string} workflowId 工作流ID
 * @returns {Promise<Object>} 更新结果
 */
async function updateWorkflow(client, workflowId) {
  try {
    console.log('正在更新工作流...');
    const result = await client.updateWorkflow(workflowId, workflowDefinition);
    console.log('工作流更新成功:', result);
    return result;
  } catch (error) {
    console.error('更新工作流失败:', error);
    throw error;
  }
}

/**
 * 删除工作流
 * @param {DifyClient} client Dify客户端
 * @param {string} workflowId 工作流ID
 * @returns {Promise<Object>} 删除结果
 */
async function deleteWorkflow(client, workflowId) {
  try {
    console.log('正在删除工作流...');
    const result = await client.deleteWorkflow(workflowId);
    console.log('工作流删除成功:', result);
    return result;
  } catch (error) {
    console.error('删除工作流失败:', error);
    throw error;
  }
}

/**
 * 执行工作流
 * @param {DifyClient} client Dify客户端
 * @param {string} workflowId 工作流ID
 * @param {string} filePath Excel文件路径
 * @returns {Promise<Object>} 执行结果
 */
async function executeWorkflow(client, workflowId, filePath) {
  try {
    console.log('正在上传文件...');
    const fileResult = await client.uploadFile(filePath);
    
    console.log('正在执行工作流...');
    const result = await client.executeWorkflow(workflowId, {
      file: fileResult.fileId
    });
    
    console.log('工作流执行成功:', result);
    return result;
  } catch (error) {
    console.error('执行工作流失败:', error);
    throw error;
  }
}

/**
 * 显示菜单
 */
async function showMenu() {
  console.log('\n=== Dify工作流管理工具 ===');
  console.log('1. 配置Dify API');
  console.log('2. 创建工作流');
  console.log('3. 更新工作流');
  console.log('4. 删除工作流');
  console.log('5. 执行工作流');
  console.log('6. 查看工作流列表');
  console.log('7. 查看工作流执行历史');
  console.log('0. 退出');
  
  const choice = await question('请选择操作: ');
  return choice;
}

/**
 * 配置Dify API
 * @returns {Promise<Object>} 配置对象
 */
async function configureApi() {
  const config = loadConfig();
  
  console.log('\n=== 配置Dify API ===');
  
  const apiKey = await question(`请输入Dify API密钥 [${config.apiKey}]: `);
  const baseUrl = await question(`请输入Dify API基础URL [${config.baseUrl}]: `);
  
  config.apiKey = apiKey || config.apiKey;
  config.baseUrl = baseUrl || config.baseUrl;
  
  saveConfig(config);
  
  return config;
}

/**
 * 主函数
 */
async function main() {
  try {
    let config = loadConfig();
    let client = createDifyClient(config);
    
    while (true) {
      const choice = await showMenu();
      
      switch (choice) {
        case '1':
          // 配置Dify API
          config = await configureApi();
          client = createDifyClient(config);
          break;
          
        case '2':
          // 创建工作流
          if (!config.apiKey) {
            console.log('请先配置Dify API密钥');
            break;
          }
          
          try {
            const result = await createWorkflow(client);
            config.workflowId = result.id;
            saveConfig(config);
          } catch (error) {
            console.error('创建工作流失败:', error);
          }
          break;
          
        case '3':
          // 更新工作流
          if (!config.apiKey) {
            console.log('请先配置Dify API密钥');
            break;
          }
          
          if (!config.workflowId) {
            console.log('请先创建工作流');
            break;
          }
          
          try {
            await updateWorkflow(client, config.workflowId);
          } catch (error) {
            console.error('更新工作流失败:', error);
          }
          break;
          
        case '4':
          // 删除工作流
          if (!config.apiKey) {
            console.log('请先配置Dify API密钥');
            break;
          }
          
          if (!config.workflowId) {
            console.log('请先创建工作流');
            break;
          }
          
          try {
            await deleteWorkflow(client, config.workflowId);
            config.workflowId = '';
            saveConfig(config);
          } catch (error) {
            console.error('删除工作流失败:', error);
          }
          break;
          
        case '5':
          // 执行工作流
          if (!config.apiKey) {
            console.log('请先配置Dify API密钥');
            break;
          }
          
          if (!config.workflowId) {
            console.log('请先创建工作流');
            break;
          }
          
          try {
            const filePath = await question('请输入Excel文件路径: ');
            
            if (!fs.existsSync(filePath)) {
              console.log('文件不存在，请检查路径是否正确');
              break;
            }
            
            await executeWorkflow(client, config.workflowId, filePath);
          } catch (error) {
            console.error('执行工作流失败:', error);
          }
          break;
          
        case '6':
          // 查看工作流列表
          if (!config.apiKey) {
            console.log('请先配置Dify API密钥');
            break;
          }
          
          try {
            const result = await client.getWorkflows();
            console.log('工作流列表:');
            console.log(JSON.stringify(result, null, 2));
          } catch (error) {
            console.error('获取工作流列表失败:', error);
          }
          break;
          
        case '7':
          // 查看工作流执行历史
          if (!config.apiKey) {
            console.log('请先配置Dify API密钥');
            break;
          }
          
          if (!config.workflowId) {
            console.log('请先创建工作流');
            break;
          }
          
          try {
            const result = await client.getWorkflowExecutions(config.workflowId);
            console.log('工作流执行历史:');
            console.log(JSON.stringify(result, null, 2));
          } catch (error) {
            console.error('获取工作流执行历史失败:', error);
          }
          break;
          
        case '0':
          // 退出
          console.log('再见!');
          rl.close();
          return;
          
        default:
          console.log('无效的选择，请重新输入');
          break;
      }
    }
  } catch (error) {
    console.error('程序执行出错:', error);
  } finally {
    rl.close();
  }
}

// 如果直接运行此脚本，则执行main函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  loadConfig,
  saveConfig,
  createDifyClient,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow
};
