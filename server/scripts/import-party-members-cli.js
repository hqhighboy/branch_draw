#!/usr/bin/env node

/**
 * 党员信息导入命令行工具
 * 使用方法: node import-party-members-cli.js <Excel文件路径>
 */
const path = require('path');
const { importPartyMembers, ensureTablesExist } = require('./import-party-members');

async function main() {
  try {
    // 检查命令行参数
    if (process.argv.length < 3) {
      console.error('使用方法: node import-party-members-cli.js <Excel文件路径>');
      process.exit(1);
    }

    const filePath = process.argv[2];
    console.log(`准备导入文件: ${filePath}`);

    // 确保必要的表存在
    await ensureTablesExist();

    // 导入数据
    const result = await importPartyMembers(filePath);
    
    if (result.success) {
      console.log('导入成功!');
      console.log(`总记录数: ${result.stats.total}`);
      console.log(`新增记录: ${result.stats.inserted}`);
      console.log(`更新记录: ${result.stats.updated}`);
      console.log(`添加职务: ${result.stats.positions_added}`);
      
      if (result.stats.errors.length > 0) {
        console.log('\n警告:');
        result.stats.errors.forEach((err, index) => {
          console.log(`  ${index + 1}. ${err}`);
        });
      }
    } else {
      console.error(`导入失败: ${result.message}`);
      if (result.stats.errors.length > 0) {
        console.error('\n错误详情:');
        result.stats.errors.forEach((err, index) => {
          console.error(`  ${index + 1}. ${err}`);
        });
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('导入过程中发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main();
