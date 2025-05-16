/**
 * 创建员工信息表结构
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

async function createEmployeeTable() {
  console.log('=== 创建员工信息表 ===');
  
  let connection;
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 检查表是否存在
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'employees'",
      [dbConfig.database]
    );
    
    if (tables.length > 0) {
      console.log('employees表已存在，正在删除...');
      await connection.execute('DROP TABLE employees');
      console.log('employees表已删除');
    }
    
    // 创建表
    console.log('正在创建employees表...');
    
    const createTableSQL = `
      CREATE TABLE employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        
        -- 基本信息
        name VARCHAR(50) COMMENT '姓名',
        employee_code VARCHAR(50) COMMENT '员工编码',
        gender VARCHAR(10) COMMENT '性别',
        birth_date DATE COMMENT '出生日期',
        age INT COMMENT '年龄',
        ethnicity VARCHAR(20) COMMENT '民族',
        native_place VARCHAR(100) COMMENT '籍贯',
        work_years FLOAT COMMENT '工龄',
        birth_place VARCHAR(100) COMMENT '出生地',
        education_level VARCHAR(50) COMMENT '文化程度',
        political_status VARCHAR(50) COMMENT '政治面貌',
        
        -- 组织信息
        company_name VARCHAR(100) COMMENT '单位名称',
        department_name VARCHAR(100) COMMENT '部门名称',
        department_path VARCHAR(255) COMMENT '部门路径',
        team_name VARCHAR(100) COMMENT '班组名称',
        position_name VARCHAR(100) COMMENT '岗位名称',
        position_level VARCHAR(50) COMMENT '岗位层级',
        position_category VARCHAR(50) COMMENT '岗位类别',
        position_specialty VARCHAR(50) COMMENT '岗位专业分类',
        position_sequence VARCHAR(50) COMMENT '岗位序列',
        
        -- 职务信息
        current_position VARCHAR(100) COMMENT '现任职务',
        current_position_level VARCHAR(50) COMMENT '现任职务级别',
        
        -- 专家信息
        tech_expert_level VARCHAR(50) COMMENT '技术专家等级',
        tech_expert_specialty VARCHAR(100) COMMENT '技术专家专业',
        skill_expert_level VARCHAR(50) COMMENT '技能专家等级',
        skill_expert_specialty VARCHAR(100) COMMENT '技能专家专业',
        
        -- 工作信息
        tenure_years FLOAT COMMENT '任职年限',
        current_position_date DATE COMMENT '现任岗位聘任日期',
        work_start_date DATE COMMENT '参加工作日期',
        continuous_work_start_date DATE COMMENT '连续工龄起算日期',
        join_system_date DATE COMMENT '入南网系统日期',
        join_company_date DATE COMMENT '入本单位日期',
        
        -- 联系信息
        mobile_phone VARCHAR(20) COMMENT '手机',
        
        -- 学历信息
        education_history TEXT COMMENT '学历学位教育历史',
        
        -- 职称信息
        professional_certs TEXT COMMENT '职称资格证书历史',
        current_cert_name VARCHAR(100) COMMENT '当前职称资格证书名称',
        current_cert_level VARCHAR(50) COMMENT '当前职称资格证书等级',
        current_cert_specialty VARCHAR(100) COMMENT '当前职称资格证书专业名称',
        current_cert_sub_specialty VARCHAR(100) COMMENT '当前职称资格证书分支专业',
        current_cert_date DATE COMMENT '当前职称资格证书取得时间',
        current_cert_issuer VARCHAR(100) COMMENT '当前职称资格证书审批发证单位',
        current_cert_import_date DATE COMMENT '当前职称资格证书入库时间',
        
        -- 岗位胜任能力证书
        competency_certs TEXT COMMENT '岗位胜任能力资格证书历史',
        current_competency_name VARCHAR(100) COMMENT '当前岗位胜任能力资格证书名称',
        current_competency_level VARCHAR(50) COMMENT '当前岗位胜任能力证书等级',
        current_competency_date DATE COMMENT '当前岗位胜任能力资格证书取得时间',
        current_competency_issuer VARCHAR(100) COMMENT '当前岗位胜任能力资格证书审批发证单位',
        
        -- 职业技能等级认定证书
        vocational_certs TEXT COMMENT '职业技能等级认定证书历史',
        current_vocational_name VARCHAR(100) COMMENT '当前职业技能等级认定证书名称',
        current_vocational_level VARCHAR(50) COMMENT '当前职业技能等级认定证书等级',
        current_vocational_type VARCHAR(100) COMMENT '当前职业技能等级认定证书工种名称',
        current_vocational_date DATE COMMENT '当前职业技能等级认定证书取得时间',
        current_vocational_issuer VARCHAR(100) COMMENT '当前职业技能等级认定证书审批发证单位',
        current_vocational_number VARCHAR(100) COMMENT '当前职业技能等级认定证书证书编号',
        current_vocational_import_date DATE COMMENT '当前职业技能等级认定证书入库时间',
        
        -- 元数据
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        -- 索引
        INDEX idx_name (name),
        INDEX idx_employee_code (employee_code),
        INDEX idx_department_path (department_path),
        INDEX idx_position_name (position_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工信息表';
    `;
    
    await connection.execute(createTableSQL);
    console.log('employees表创建成功');
    
  } catch (error) {
    console.error('创建表时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行创建表函数
createEmployeeTable().catch(console.error);
