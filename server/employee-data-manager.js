/**
 * 员工信息数据管理工具
 * 
 * 此脚本提供一个菜单界面，用于管理员工信息数据
 */

const readline = require('readline');
const { promisify } = require('util');
const { spawn } = require('child_process');
const path = require('path');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

/**
 * 运行脚本
 * @param {string} scriptName 脚本名称
 */
function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'scripts', scriptName);
    
    console.log(`正在运行 ${scriptPath}...`);
    
    const process = spawn('node', [scriptPath], {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`脚本退出，代码: ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 显示菜单
 */
async function showMenu() {
  console.clear();
  console.log('=== 员工信息数据管理工具 ===');
  console.log('');
  console.log('1. 创建数据库表结构');
  console.log('2. 导入Excel数据');
  console.log('3. 查询员工数据');
  console.log('4. 查看使用指南');
  console.log('5. 退出');
  console.log('');
  
  const option = await question('请选择操作 (1-5): ');
  
  switch (option) {
    case '1':
      try {
        await runScript('create-employee-table.js');
      } catch (error) {
        console.error('创建表结构时出错:', error);
      }
      await question('\n按回车键继续...');
      return showMenu();
      
    case '2':
      try {
        await runScript('import-employee-data.js');
      } catch (error) {
        console.error('导入数据时出错:', error);
      }
      await question('\n按回车键继续...');
      return showMenu();
      
    case '3':
      try {
        await runScript('query-employees.js');
      } catch (error) {
        console.error('查询数据时出错:', error);
      }
      await question('\n按回车键继续...');
      return showMenu();
      
    case '4':
      console.clear();
      console.log('请查看 EMPLOYEE_DATA_GUIDE.md 文件获取详细使用指南');
      console.log('文件位置: ' + path.join(__dirname, 'EMPLOYEE_DATA_GUIDE.md'));
      await question('\n按回车键继续...');
      return showMenu();
      
    case '5':
      console.log('感谢使用，再见!');
      rl.close();
      break;
      
    default:
      console.log('无效选项，请重新选择');
      await question('\n按回车键继续...');
      return showMenu();
  }
}

// 启动菜单
showMenu().catch(error => {
  console.error('发生错误:', error);
  rl.close();
});
