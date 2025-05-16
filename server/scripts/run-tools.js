/**
 * 工具运行脚本
 *
 * 此脚本用于运行各种数据库工具
 */

const readline = require('readline');
const { promisify } = require('util');
const { spawn } = require('child_process');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// 可用工具列表
const tools = [
  { id: 1, name: '检查数据库', script: 'check-db.js', description: '检查数据库连接和表结构' },
  { id: 2, name: '创建表结构', script: 'create-tables.js', description: '创建所有必要的表结构和示例数据' },
  { id: 3, name: '员工数据导入', script: 'employee-import.js', description: '专门导入员工数据，预定义字段映射' },
  { id: 4, name: '员工数据查询', script: 'employee-query.js', description: '查询和统计员工数据' },
  { id: 5, name: '简单Excel导入', script: 'simple-excel-import.js', description: '交互式选择字段并导入Excel数据' },
  { id: 6, name: '最小化导入', script: 'minimal-import.js', description: '使用最简单的方式导入Excel数据' },
  { id: 7, name: '超简化导入', script: 'ultra-simple-import.js', description: '专门解决中文字段名问题的导入工具' },
  { id: 8, name: '简单查询', script: 'simple-query.js', description: '查询employees表中的数据' },
  { id: 0, name: '退出', script: null, description: '退出工具' }
];

/**
 * 运行指定的脚本
 * @param {string} scriptPath 脚本路径
 */
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [scriptPath], { stdio: 'inherit' });

    process.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`脚本执行失败，退出码: ${code}`));
      }
    });

    process.on('error', err => {
      reject(err);
    });
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 数据库工具集 ===');

  let running = true;

  while (running) {
    console.log('\n可用工具:');
    tools.forEach(tool => {
      console.log(`${tool.id}. ${tool.name} - ${tool.description}`);
    });

    const choice = await question('\n请选择要运行的工具 (输入对应的数字): ');
    const selectedTool = tools.find(tool => tool.id === parseInt(choice));

    if (!selectedTool) {
      console.log('无效的选择，请重试');
      continue;
    }

    if (selectedTool.id === 0) {
      running = false;
      console.log('感谢使用，再见!');
      break;
    }

    console.log(`\n正在运行: ${selectedTool.name}`);

    try {
      await runScript(`./scripts/${selectedTool.script}`);
      console.log(`\n${selectedTool.name} 运行完成`);
    } catch (error) {
      console.error(`运行 ${selectedTool.name} 时出错:`, error.message);
    }

    await question('\n按回车键继续...');
  }

  rl.close();
}

// 执行主函数
main().catch(console.error);
