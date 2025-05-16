/**
 * 超简化版Excel导入工具
 * 
 * 此脚本专门解决中文字段名和特殊字符导致的SQL语法错误问题
 */

const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// 字段映射表 - 将中文字段名映射为英文字段名
const fieldMapping = {
  '员工基本信息-姓名': 'name',
  '员工基本信息-员工编码': 'employee_code',
  '员工基本信息-性别': 'gender',
  '员工基本信息-出生日期': 'birth_date',
  '员工基本信息-年龄': 'age',
  '员工基本信息-民族': 'ethnicity',
  '员工基本信息-籍贯': 'native_place',
  '员工基本信息-工龄': 'work_years',
  '员工基本信息-出生地': 'birth_place',
  '员工基本信息-文化程度': 'education_level',
  '员工基本信息-政治面貌': 'political_status',
  '组织信息-单位名称': 'company_name',
  '组织信息-部门名称': 'department_name',
  '组织信息-部门路径': 'department_path',
  '组织信息-班组名称': 'team_name',
  '组织信息-岗位名称': 'position_name',
  '组织信息-岗位层级': 'position_level',
  '组织信息-岗位类别': 'position_category',
  '组织信息-岗位专业分类': 'position_specialty',
  '组织信息-岗位序列': 'position_sequence',
  '职务信息-现任职务': 'current_position',
  '职务信息-现任职务级别': 'current_position_level',
  '技术专家-技术专家等级': 'tech_expert_level',
  '技术专家-技术专家专业': 'tech_expert_specialty',
  '技能专家-技能专家等级': 'skill_expert_level',
  '技能专家-技能专家专业': 'skill_expert_specialty',
  '员工工作信息-任职年限': 'tenure_years',
  '员工工作信息-现任岗位聘任日期': 'current_position_date',
  '员工工作信息-参加工作日期': 'work_start_date',
  '员工工作信息-连续工龄起算日期': 'continuous_work_start_date',
  '员工工作信息-入南网系统日期': 'join_system_date',
  '员工工作信息-入本单位日期': 'join_company_date',
  '员工联系信息-手机': 'mobile_phone',
  '学历学位教育-有学历学位教育-(入学日期,毕业日期,毕业院校,院校类别)': 'education_history',
  '职称资格证书-多个职称资格证书-(资格名称,资格等级,专业名称,分支专业,资格取得时间,审批发证单位,是否当前证书,入库时间)': 'professional_certs',
  '职称资格证书-当前-职称资格证书资格名称': 'current_cert_name',
  '职称资格证书-当前-职称资格证书资格等级': 'current_cert_level',
  '职称资格证书-当前-职称资格证书专业名称': 'current_cert_specialty',
  '职称资格证书-当前-职称资格证书分支专业': 'current_cert_sub_specialty',
  '职称资格证书-当前-职称资格证书资格取得时间': 'current_cert_date',
  '职称资格证书-当前-职称资格证书审批发证单位': 'current_cert_issuer',
  '职称资格证书-当前-职称资格证书入库时间': 'current_cert_import_date',
  '岗位胜任能力资格证书-多个岗位胜任能力资格证书-(资格名称,岗位胜任能力证书等级,资格取得时间,审批发证单位,是否当前)': 'competency_certs',
  '岗位胜任能力资格证书-当前-岗位胜任能力资格证书资格名称': 'current_competency_name',
  '岗位胜任能力资格证书-当前-岗位胜任能力证书等级': 'current_competency_level',
  '岗位胜任能力资格证书-当前-岗位胜任能力资格证书资格取得时间': 'current_competency_date',
  '岗位胜任能力资格证书-当前-岗位胜任能力资格证书审批发证单位': 'current_competency_issuer',
  '职业技能等级认定证书-多个职业技能等级认定证书-(资格名称,资格等级,工种名称,资格取得时间,审批发证单位,证书编号,入库时间,是否当前证书)': 'vocational_certs',
  '职业技能等级认定证书-当前-职业技能等级认定证书资格名称': 'current_vocational_name',
  '职业技能等级认定证书-当前-职业技能等级认定证书资格等级': 'current_vocational_level',
  '职业技能等级认定证书-当前-职业技能等级认定证书工种名称': 'current_vocational_type',
  '职业技能等级认定证书-当前-职业技能等级认定证书资格取得时间': 'current_vocational_date',
  '职业技能等级认定证书-当前-职业技能等级认定证书审批发证单位': 'current_vocational_issuer',
  '职业技能等级认定证书-当前-职业技能等级认定证书证书编号': 'current_vocational_number',
  '职业技能等级认定证书-当前-职业技能等级认定证书入库时间': 'current_vocational_import_date'
};

/**
 * 主函数
 */
async function main() {
  console.log('=== 超简化版Excel导入工具 ===');
  
  try {
    // 提示用户输入Excel文件路径
    console.log('请将Excel数据文件放在任意位置，然后输入完整路径');
    console.log('例如：D:\\Data\\employees.xlsx 或 C:\\Users\\YourName\\Desktop\\employees.xlsx');
    
    const excelPath = await question('请输入Excel文件路径: ');
    
    if (!fs.existsSync(excelPath)) {
      console.error('文件不存在，请检查路径是否正确');
      rl.close();
      return;
    }
    
    console.log('正在读取Excel文件...');
    console.log('这可能需要一些时间，请耐心等待...');
    
    // 读取Excel文件
    const workbook = xlsx.readFile(excelPath, {
      cellFormula: false,
      cellHTML: false,
      cellText: false,
      cellStyles: false,
      cellDates: true,
      sheetStubs: false,
      dense: true
    });
    
    console.log('Excel文件读取成功');
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`使用工作表: ${sheetName}`);
    
    // 将工作表转换为JSON
    console.log('正在转换数据...');
    const rawData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`读取到 ${rawData.length} 条记录`);
    
    // 连接数据库
    console.log('\n正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 创建表
    console.log('准备创建/重置employees表...');
    
    // 先删除表（如果存在）
    try {
      await connection.execute('DROP TABLE IF EXISTS employees');
      console.log('已删除旧表');
    } catch (dropError) {
      console.error('删除旧表失败:', dropError.message);
    }
    
    // 创建新表
    try {
      const createTableSQL = `
        CREATE TABLE employees (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          employee_code VARCHAR(50),
          gender VARCHAR(10),
          birth_date VARCHAR(20),
          age VARCHAR(10),
          ethnicity VARCHAR(20),
          native_place VARCHAR(100),
          work_years VARCHAR(20),
          birth_place VARCHAR(100),
          education_level VARCHAR(50),
          political_status VARCHAR(50),
          company_name VARCHAR(100),
          department_name VARCHAR(100),
          department_path VARCHAR(255),
          team_name VARCHAR(100),
          position_name VARCHAR(100),
          position_level VARCHAR(50),
          position_category VARCHAR(50),
          position_specialty VARCHAR(50),
          position_sequence VARCHAR(50),
          current_position VARCHAR(100),
          current_position_level VARCHAR(50),
          tech_expert_level VARCHAR(50),
          tech_expert_specialty VARCHAR(100),
          skill_expert_level VARCHAR(50),
          skill_expert_specialty VARCHAR(100),
          tenure_years VARCHAR(20),
          current_position_date VARCHAR(20),
          work_start_date VARCHAR(20),
          continuous_work_start_date VARCHAR(20),
          join_system_date VARCHAR(20),
          join_company_date VARCHAR(20),
          mobile_phone VARCHAR(20),
          education_history TEXT,
          professional_certs TEXT,
          current_cert_name VARCHAR(100),
          current_cert_level VARCHAR(50),
          current_cert_specialty VARCHAR(100),
          current_cert_sub_specialty VARCHAR(100),
          current_cert_date VARCHAR(20),
          current_cert_issuer VARCHAR(100),
          current_cert_import_date VARCHAR(20),
          competency_certs TEXT,
          current_competency_name VARCHAR(100),
          current_competency_level VARCHAR(50),
          current_competency_date VARCHAR(20),
          current_competency_issuer VARCHAR(100),
          vocational_certs TEXT,
          current_vocational_name VARCHAR(100),
          current_vocational_level VARCHAR(50),
          current_vocational_type VARCHAR(100),
          current_vocational_date VARCHAR(20),
          current_vocational_issuer VARCHAR(100),
          current_vocational_number VARCHAR(100),
          current_vocational_import_date VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
      
      await connection.execute(createTableSQL);
      console.log('employees表创建成功');
    } catch (createError) {
      console.error('创建表失败:', createError.message);
      throw createError;
    }
    
    // 转换数据 - 将中文字段名转换为英文字段名
    console.log('正在转换字段名...');
    const data = rawData.map(record => {
      const newRecord = {};
      
      Object.keys(record).forEach(key => {
        // 如果有映射，使用映射的英文字段名
        if (fieldMapping[key]) {
          newRecord[fieldMapping[key]] = record[key];
        } else {
          // 否则尝试生成一个安全的字段名
          const safeName = key
            .replace(/[^a-zA-Z0-9_]/g, '_') // 替换非字母数字下划线字符为下划线
            .replace(/^[0-9]/, '_$&');      // 如果以数字开头，添加下划线前缀
          
          newRecord[safeName] = record[key];
        }
      });
      
      return newRecord;
    });
    
    console.log(`字段名转换完成，准备导入 ${data.length} 条记录`);
    
    // 开始导入数据
    console.log('\n开始导入数据...');
    
    // 设置批量处理大小
    const batchSize = 5;
    const totalRecords = data.length;
    
    let successCount = 0;
    let errorCount = 0;
    
    // 分批处理数据
    for (let i = 0; i < totalRecords; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, totalRecords);
      console.log(`正在处理第 ${i+1} 至 ${batchEnd} 条记录 (共 ${totalRecords} 条)...`);
      
      // 处理当前批次的数据
      for (let j = i; j < batchEnd; j++) {
        const record = data[j];
        
        try {
          // 只使用基本字段进行插入
          const insertSQL = `
            INSERT INTO employees (
              name, employee_code, department_name, position_name
            ) VALUES (?, ?, ?, ?)
          `;
          
          const params = [
            record.name || null,
            record.employee_code || null,
            record.department_name || null,
            record.position_name || null
          ];
          
          // 执行插入
          await connection.execute(insertSQL, params);
          
          // 获取插入的ID
          const [idResult] = await connection.execute('SELECT LAST_INSERT_ID() as id');
          const id = idResult[0].id;
          
          // 更新其他字段
          if (id) {
            const updateFields = [];
            const updateParams = [];
            
            Object.keys(record).forEach(key => {
              // 跳过已插入的基本字段
              if (key !== 'name' && key !== 'employee_code' && 
                  key !== 'department_name' && key !== 'position_name') {
                updateFields.push(`${key} = ?`);
                updateParams.push(record[key]);
              }
            });
            
            if (updateFields.length > 0) {
              const updateSQL = `
                UPDATE employees 
                SET ${updateFields.join(', ')}
                WHERE id = ?
              `;
              
              updateParams.push(id);
              
              await connection.execute(updateSQL, updateParams);
            }
          }
          
          successCount++;
          console.log(`记录 ${j+1} 导入成功`);
        } catch (error) {
          errorCount++;
          console.error(`导入第 ${j+1} 条记录失败:`, error.message);
        }
      }
      
      // 每批处理完成后暂停一下，避免数据库负载过高
      if (i + batchSize < totalRecords) {
        console.log('暂停1秒钟...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n导入完成!');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);
    
    // 关闭数据库连接
    await connection.end();
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    rl.close();
  }
}

// 执行主函数
main().catch(console.error);
