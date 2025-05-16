/**
 * 导入全部员工信息脚本
 * 
 * 此脚本用于导入员工信息Excel文件到数据库
 * 在导入前会清空相关表，以防止重复数据
 */

const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

/**
 * 将日期字符串转换为MySQL日期格式
 * @param {string|number} dateValue 日期值
 * @returns {string|null} MySQL日期格式或null
 */
function formatDate(dateValue) {
  if (!dateValue) return null;

  // 如果是日期对象，直接格式化
  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return null;
    return dateValue.toISOString().split('T')[0];
  }

  try {
    let date;

    if (typeof dateValue === 'string') {
      // 处理特殊格式
      if (dateValue.includes('/')) {
        // 处理 MM/DD/YYYY 或 YYYY/MM/DD 格式
        const parts = dateValue.split('/');
        if (parts.length === 3) {
          // 判断是哪种格式
          if (parseInt(parts[0]) > 1000) {
            // YYYY/MM/DD
            date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else {
            // MM/DD/YYYY
            date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          }
        } else {
          date = new Date(dateValue);
        }
      } else if (dateValue.includes('-')) {
        // 处理 YYYY-MM-DD 格式
        date = new Date(dateValue);
      } else if (dateValue.includes('.')) {
        // 处理 DD.MM.YYYY 格式
        const parts = dateValue.split('.');
        if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          date = new Date(dateValue);
        }
      } else if (/^\d{8}$/.test(dateValue)) {
        // 处理 YYYYMMDD 格式
        const year = parseInt(dateValue.substring(0, 4));
        const month = parseInt(dateValue.substring(4, 6)) - 1;
        const day = parseInt(dateValue.substring(6, 8));
        date = new Date(year, month, day);
      } else {
        // 尝试其他格式
        date = new Date(dateValue);
      }
    } else if (typeof dateValue === 'number') {
      // Excel日期是从1900年1月1日开始的天数
      date = new Date((dateValue - 25569) * 86400 * 1000);
    }

    if (isNaN(date.getTime())) {
      // 如果日期无效，返回null
      return null;
    }

    // 检查日期是否合理
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) {
      // 年份超出合理范围
      return null;
    }

    // 格式化为 YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error(`日期格式化错误: ${dateValue}`, error);
    return null;
  }
}

/**
 * 清空数据库中的相关表
 */
async function clearDatabase() {
  console.log('开始清空数据库...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 禁用外键检查
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 清空相关表
    const tablesToClear = [
      'employees',
      'branch_personnel',
      'member_positions'
    ];
    
    for (const table of tablesToClear) {
      console.log(`清空表: ${table}`);
      await conn.query(`TRUNCATE TABLE ${table}`);
    }
    
    // 重新启用外键检查
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('数据库清空完成');
  } catch (error) {
    console.error('清空数据库时出错:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

/**
 * 导入员工信息
 * @param {string} filePath Excel文件路径
 */
async function importEmployees(filePath) {
  console.log(`开始导入员工信息: ${filePath}`);
  
  // 读取Excel文件
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`读取到 ${data.length} 条员工记录`);
  
  // 连接数据库
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 开始事务
    await conn.beginTransaction();
    
    // 导入员工基本信息
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      
      try {
        // 检查必填字段
        if (!record['员工基本信息-姓名']) {
          throw new Error('员工姓名为必填项');
        }
        
        // 构建插入语句
        const insertSQL = `
          INSERT INTO employees (
            name, employee_code, gender, birth_date, age, ethnicity, native_place, work_years,
            birth_place, education_level, political_status, company_name, department_name,
            department_path, team_name, position_name, position_level, position_category,
            position_specialty, position_sequence, current_position, current_position_level,
            tech_expert_level, tech_expert_specialty, skill_expert_level, skill_expert_specialty,
            tenure_years, current_position_date, work_start_date, continuous_work_start_date,
            join_system_date, join_company_date, mobile_phone, education_history,
            professional_certs, current_cert_name, current_cert_level, current_cert_specialty,
            current_cert_sub_specialty, current_cert_date, current_cert_issuer, current_cert_import_date,
            competency_certs, current_competency_name, current_competency_level, current_competency_date,
            current_competency_issuer, vocational_certs, current_vocational_name, current_vocational_level,
            current_vocational_type, current_vocational_date, current_vocational_issuer,
            current_vocational_number, current_vocational_import_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // 准备参数
        const params = [
          record['员工基本信息-姓名'] || null,
          record['员工基本信息-员工编码'] || null,
          record['员工基本信息-性别'] || null,
          formatDate(record['员工基本信息-出生日期']),
          record['员工基本信息-年龄'] || null,
          record['员工基本信息-民族'] || null,
          record['员工基本信息-籍贯'] || null,
          record['员工基本信息-工龄'] || null,
          record['员工基本信息-出生地'] || null,
          record['员工基本信息-文化程度'] || null,
          record['员工基本信息-政治面貌'] || record['政治面貌'] || null,
          record['组织信息-单位名称'] || null,
          record['组织信息-部门名称'] || null,
          record['组织信息-部门路径'] || null,
          record['组织信息-班组名称'] || null,
          record['组织信息-岗位名称'] || null,
          record['组织信息-岗位层级'] || null,
          record['组织信息-岗位类别'] || null,
          record['组织信息-岗位专业分类'] || null,
          record['组织信息-岗位序列'] || null,
          record['职务信息-现任职务'] || null,
          record['职务信息-现任职务级别'] || null,
          record['技术专家-技术专家等级'] || null,
          record['技术专家-技术专家专业'] || null,
          record['技能专家-技能专家等级'] || null,
          record['技能专家-技能专家专业'] || null,
          record['员工工作信息-任职年限'] || null,
          formatDate(record['员工工作信息-现任岗位聘任日期']),
          formatDate(record['员工工作信息-参加工作日期']),
          formatDate(record['员工工作信息-连续工龄起算日期']),
          formatDate(record['员工工作信息-入南网系统日期']),
          formatDate(record['员工工作信息-入本单位日期']),
          record['员工联系信息-手机'] || null,
          record['学历学位教育-有学历学位教育-(入学日期,毕业日期,毕业院校,院校类别)'] || null,
          record['职称资格证书-多个职称资格证书-(资格名称,资格等级,专业名称,分支专业,资格取得时间,审批发证单位,是否当前证书,入库时间)'] || null,
          record['职称资格证书-当前-职称资格证书资格名称'] || null,
          record['职称资格证书-当前-职称资格证书资格等级'] || null,
          record['职称资格证书-当前-职称资格证书专业名称'] || null,
          record['职称资格证书-当前-职称资格证书分支专业'] || null,
          formatDate(record['职称资格证书-当前-职称资格证书资格取得时间']),
          record['职称资格证书-当前-职称资格证书审批发证单位'] || null,
          formatDate(record['职称资格证书-当前-职称资格证书入库时间']),
          record['岗位胜任能力资格证书-多个岗位胜任能力资格证书-(资格名称,岗位胜任能力证书等级,资格取得时间,审批发证单位,是否当前)'] || null,
          record['岗位胜任能力资格证书-当前-岗位胜任能力资格证书资格名称'] || null,
          record['岗位胜任能力资格证书-当前-岗位胜任能力证书等级'] || null,
          formatDate(record['岗位胜任能力资格证书-当前-岗位胜任能力资格证书资格取得时间']),
          record['岗位胜任能力资格证书-当前-岗位胜任能力资格证书审批发证单位'] || null,
          record['职业技能等级认定证书-多个职业技能等级认定证书-(资格名称,资格等级,工种名称,资格取得时间,审批发证单位,证书编号,入库时间,是否当前证书)'] || null,
          record['职业技能等级认定证书-当前-职业技能等级认定证书资格名称'] || null,
          record['职业技能等级认定证书-当前-职业技能等级认定证书资格等级'] || null,
          record['职业技能等级认定证书-当前-职业技能等级认定证书工种名称'] || null,
          formatDate(record['职业技能等级认定证书-当前-职业技能等级认定证书资格取得时间']),
          record['职业技能等级认定证书-当前-职业技能等级认定证书审批发证单位'] || null,
          record['职业技能等级认定证书-当前-职业技能等级认定证书证书编号'] || null,
          formatDate(record['职业技能等级认定证书-当前-职业技能等级认定证书入库时间'])
        ];
        
        // 执行插入
        const [result] = await conn.execute(insertSQL, params);
        const employeeId = result.insertId;
        
        // 处理支部信息和党员职务
        if (record['支部信息']) {
          // 查找支部ID
          const [branches] = await conn.query(
            'SELECT id FROM branches WHERE name = ?',
            [record['支部信息']]
          );
          
          if (branches.length > 0) {
            const branchId = branches[0].id;
            
            // 添加到branch_personnel表
            await conn.query(
              `INSERT INTO branch_personnel (branch_id, name, department_path)
               VALUES (?, ?, ?)`,
              [branchId, record['员工基本信息-姓名'], record['组织信息-部门路径']]
            );
            
            // 处理党员职务
            const positionFields = [
              { field: '党委书记', type: 'party_committee_secretary' },
              { field: '党委副书记', type: 'party_committee_deputy_secretary' },
              { field: '纪委书记', type: 'discipline_secretary' },
              { field: '工会主席', type: 'union_chairman' },
              { field: '党委委员', type: 'party_committee_member' },
              { field: '支部书记', type: 'branch_secretary' },
              { field: '支部副书记', type: 'branch_deputy_secretary' },
              { field: '组织委员', type: 'organizational_commissioner' },
              { field: '纪检委员', type: 'disciplinary_commissioner' },
              { field: '宣传委员', type: 'propaganda_commissioner' },
              { field: '青年委员', type: 'youth_commissioner' },
              { field: '生产委员', type: 'production_commissioner' }
            ];
            
            for (const position of positionFields) {
              const value = record[position.field];
              if (value && ['是', '√', 'Y', 'y', 'yes', 'Yes', 'YES', 'true', 'True', 'TRUE', '1'].includes(value)) {
                await conn.query(
                  `INSERT INTO member_positions (employee_id, branch_id, position_type)
                   VALUES (?, ?, ?)`,
                  [employeeId, branchId, position.type]
                );
                
                // 更新支部表中的职务信息
                if (position.type === 'branch_secretary') {
                  await conn.query(
                    'UPDATE branches SET secretary = ? WHERE id = ?',
                    [record['员工基本信息-姓名'], branchId]
                  );
                } else if (position.type === 'branch_deputy_secretary') {
                  await conn.query(
                    'UPDATE branches SET deputy_secretary = ? WHERE id = ?',
                    [record['员工基本信息-姓名'], branchId]
                  );
                } else if (position.type === 'organizational_commissioner') {
                  await conn.query(
                    'UPDATE branches SET organizational_commissioner = ? WHERE id = ?',
                    [record['员工基本信息-姓名'], branchId]
                  );
                } else if (position.type === 'disciplinary_commissioner') {
                  await conn.query(
                    'UPDATE branches SET disciplinary_commissioner = ? WHERE id = ?',
                    [record['员工基本信息-姓名'], branchId]
                  );
                } else if (position.type === 'propaganda_commissioner') {
                  await conn.query(
                    'UPDATE branches SET propaganda_commissioner = ? WHERE id = ?',
                    [record['员工基本信息-姓名'], branchId]
                  );
                } else if (position.type === 'youth_commissioner') {
                  await conn.query(
                    'UPDATE branches SET learning_commissioner = ? WHERE id = ?',
                    [record['员工基本信息-姓名'], branchId]
                  );
                } else if (position.type === 'production_commissioner') {
                  await conn.query(
                    'UPDATE branches SET production_commissioner = ? WHERE id = ?',
                    [record['员工基本信息-姓名'], branchId]
                  );
                }
              }
            }
          } else {
            console.warn(`找不到支部: ${record['支部信息']}`);
          }
        }
        
        successCount++;
        
        // 每100条记录输出一次进度
        if (successCount % 100 === 0 || successCount === data.length) {
          console.log(`已处理 ${successCount}/${data.length} 条记录`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          index: i,
          name: record['员工基本信息-姓名'] || '未知',
          error: error.message
        });
        
        console.error(`导入第 ${i+1} 条记录失败:`, error.message);
      }
    }
    
    // 更新支部人数
    const [branches] = await conn.query('SELECT id FROM branches');
    for (const branch of branches) {
      const branchId = branch.id;
      
      // 计算党员数量
      const [countResult] = await conn.query(
        'SELECT COUNT(*) as count FROM branch_personnel WHERE branch_id = ?',
        [branchId]
      );
      const memberCount = countResult[0].count;
      
      // 更新支部信息
      await conn.query(
        'UPDATE branches SET member_count = ? WHERE id = ?',
        [memberCount, branchId]
      );
    }
    
    // 提交事务
    await conn.commit();
    
    console.log('\n导入完成!');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);
    
    if (errorCount > 0) {
      console.log('\n失败记录:');
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. 姓名: ${error.name}, 错误: ${error.error}`);
      });
      
      if (errors.length > 5) {
        console.log(`  ...以及其他 ${errors.length - 5} 条错误记录`);
      }
    }
    
    return {
      success: true,
      total: data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10) // 只返回前10条错误
    };
  } catch (error) {
    // 回滚事务
    await conn.rollback();
    console.error('导入过程中发生错误:', error);
    
    return {
      success: false,
      message: error.message,
      error
    };
  } finally {
    await conn.end();
  }
}

/**
 * 主函数
 */
async function main() {
  const filePath = process.argv[2] || 'D:/Projects/cursor/branch-analysis/server/员工信息导入模板-all.xlsx';
  
  if (!fs.existsSync(filePath)) {
    console.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }
  
  try {
    // 清空数据库
    await clearDatabase();
    
    // 导入员工信息
    const result = await importEmployees(filePath);
    
    if (result.success) {
      console.log('导入成功!');
    } else {
      console.error('导入失败:', result.message);
    }
  } catch (error) {
    console.error('程序执行出错:', error);
  }
}

// 执行主函数
main().catch(console.error);
