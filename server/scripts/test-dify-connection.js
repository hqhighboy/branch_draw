/**
 * 测试Dify连接脚本
 *
 * 此脚本用于测试与本地Docker安装的Dify的连接
 */

const DifyClient = require('../dify-client');
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

/**
 * 主函数
 */
async function main() {
  try {
    console.log('=== Dify连接测试工具 ===');
    console.log('此工具用于测试与本地Docker安装的Dify的连接\n');
    console.log('获取API密钥的步骤:');
    console.log('1. 登录您的本地Dify实例(http://localhost/apps)');
    console.log('2. 在Dify控制台中，点击左侧菜单中的"应用"，选择您要使用的应用');
    console.log('3. 在应用详情页面，点击"API访问"或"API参考"选项卡');
    console.log('4. 在API访问页面，您可以找到API密钥(通常有"API Key"或"Secret Key"标识)\n');

    // 获取API密钥
    const apiKey = await question('请输入Dify API密钥: ');
    if (!apiKey) {
      console.error('错误: API密钥不能为空');
      return;
    }

    // 获取API基础URL
    const defaultBaseUrl = 'http://localhost/api/v1';
    const baseUrlInput = await question(`请输入Dify API基础URL [${defaultBaseUrl}]: `);
    const baseUrl = baseUrlInput || defaultBaseUrl;

    console.log('\n正在测试连接...');

    // 创建Dify客户端
    const client = new DifyClient({
      apiKey,
      baseUrl
    });

    // 测试连接
    try {
      const result = await client.getWorkflows();
      console.log('\n连接成功!');
      console.log('工作流列表:');
      console.log(JSON.stringify(result, null, 2));

      // 保存配置
      const configDir = path.join(__dirname, '../config');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const configPath = path.join(configDir, 'dify-config.json');
      fs.writeFileSync(configPath, JSON.stringify({
        apiKey,
        baseUrl,
        workflowId: result.workflows && result.workflows.length > 0 ? result.workflows[0].id : ''
      }, null, 2), 'utf8');

      console.log('\n配置已保存到:', configPath);
    } catch (error) {
      console.error('\n连接失败:', error.message);
      console.log('\n请检查:');
      console.log('1. API密钥是否正确');
      console.log('2. API基础URL是否正确');
      console.log('3. Dify服务是否正常运行');
      console.log('4. 网络连接是否正常');
    }
  } catch (error) {
    console.error('程序执行出错:', error);
  } finally {
    rl.close();
  }
}

// 执行主函数
main().catch(console.error);
