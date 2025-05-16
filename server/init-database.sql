-- 初始化数据库脚本
-- 这个脚本将创建所有必要的表格并设置它们之间的关系

-- 设置外键检查为0，以便于删除表
SET FOREIGN_KEY_CHECKS = 0;

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS branch_age_distribution;
DROP TABLE IF EXISTS branch_education_distribution;
DROP TABLE IF EXISTS branch_skill_distribution;
DROP TABLE IF EXISTS branch_title_distribution;
DROP TABLE IF EXISTS branch_annual_work;
DROP TABLE IF EXISTS branch_personnel;
DROP TABLE IF EXISTS member_positions;
DROP TABLE IF EXISTS employee_data;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS branches;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 创建支部表
CREATE TABLE branches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  secretary VARCHAR(50),
  deputy_secretary VARCHAR(50),
  organizational_commissioner VARCHAR(50),
  disciplinary_commissioner VARCHAR(50),
  propaganda_commissioner VARCHAR(50),
  learning_commissioner VARCHAR(50),
  production_commissioner VARCHAR(50), -- 新增生产委员
  member_count INT,
  average_age FLOAT,
  performance_2024 VARCHAR(10),
  secretary_project VARCHAR(200),
  honors TEXT
);

-- 创建员工表
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  employee_code VARCHAR(50),
  gender VARCHAR(10),
  birth_date DATE,
  age INT,
  ethnicity VARCHAR(20),
  native_place VARCHAR(100),
  work_years FLOAT,
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
  tenure_years FLOAT,
  current_position_date DATE,
  work_start_date DATE,
  continuous_work_start_date DATE,
  join_system_date DATE,
  join_company_date DATE,
  mobile_phone VARCHAR(20),
  education_history TEXT,
  professional_certs TEXT,
  current_cert_name VARCHAR(100),
  current_cert_level VARCHAR(50),
  current_cert_specialty VARCHAR(100),
  current_cert_sub_specialty VARCHAR(100),
  current_cert_date DATE,
  current_cert_issuer VARCHAR(100),
  current_cert_import_date DATE,
  competency_certs TEXT,
  current_competency_name VARCHAR(100),
  current_competency_level VARCHAR(50),
  current_competency_date DATE,
  current_competency_issuer VARCHAR(100),
  vocational_certs TEXT,
  current_vocational_name VARCHAR(100),
  current_vocational_level VARCHAR(50),
  current_vocational_type VARCHAR(100),
  current_vocational_date DATE,
  current_vocational_issuer VARCHAR(100),
  current_vocational_number VARCHAR(100),
  current_vocational_import_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_employee_code (employee_code),
  INDEX idx_department_path (department_path),
  INDEX idx_position_name (position_name)
);

-- 创建员工数据表（用于导入）
CREATE TABLE employee_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sequence_number VARCHAR(20),
  name VARCHAR(100),
  department_path VARCHAR(255),
  highest_skill_level_category VARCHAR(100),
  highest_skill_level_type VARCHAR(100),
  highest_skill_level_date VARCHAR(50),
  highest_tech_level_category VARCHAR(100),
  highest_tech_level_type VARCHAR(100),
  highest_tech_level_date VARCHAR(50),
  highest_education VARCHAR(50),
  age VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建支部人员关联表
CREATE TABLE branch_personnel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT,
  name VARCHAR(50) NOT NULL,
  department_path VARCHAR(255),
  skill_category VARCHAR(100),
  skill_type VARCHAR(100),
  skill_date DATE,
  tech_category VARCHAR(100),
  tech_type VARCHAR(100),
  tech_date DATE,
  education VARCHAR(50),
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);

-- 创建党员职务表
CREATE TABLE member_positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  branch_id INT NOT NULL,
  position_type VARCHAR(50) NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
  UNIQUE KEY unique_position (employee_id, branch_id, position_type)
);

-- 创建支部年龄分布表
CREATE TABLE branch_age_distribution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  age_group VARCHAR(20) NOT NULL,
  percentage INT NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 创建支部学历分布表
CREATE TABLE branch_education_distribution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  education_level VARCHAR(20) NOT NULL,
  percentage INT NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 创建支部技能等级分布表
CREATE TABLE branch_skill_distribution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  skill_level VARCHAR(20) NOT NULL,
  percentage INT NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 创建支部职称分布表
CREATE TABLE branch_title_distribution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  title VARCHAR(20) NOT NULL,
  percentage INT NOT NULL,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 创建支部年度工作表
CREATE TABLE branch_annual_work (
  id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  task VARCHAR(200) NOT NULL,
  start_time VARCHAR(20),
  end_time VARCHAR(20),
  status VARCHAR(20),
  progress INT,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 插入初始支部数据
INSERT INTO branches (name) VALUES 
('党建人事部党支部'),
('综合党支部'),
('生产技术党支部'),
('安监党支部'),
('数字运行党支部'),
('检修试验党支部'),
('继保自动化党支部'),
('500kV科北数字巡维中心党支部'),
('500kV北郊数字巡维中心党支部'),
('220kV罗涌数字巡维中心党支部'),
('220kV田心数字巡维中心党支部');

-- 为每个支部创建年度工作示例
INSERT INTO branch_annual_work (branch_id, task, start_time, end_time, status, progress) VALUES
(1, '组织党员学习党的二十大精神', '2024-01', '2024-12', '进行中', 35),
(1, '开展"学习强国"学习竞赛活动', '2024-03', '2024-08', '进行中', 45),
(1, '组织党员参观红色教育基地', '2024-05', '2024-05', '准备中', 0),
(1, '举办青年职工技能大赛', '2024-06', '2024-07', '准备中', 0),
(1, '开展"党员先锋岗"评选活动', '2024-09', '2024-10', '未开始', 0),
(1, '党建品牌创建活动', '2024-04', '2024-11', '进行中', 25),
(1, '基层党组织标准化建设', '2024-03', '2024-12', '进行中', 30),
(1, '党员示范岗创建活动', '2024-05', '2024-09', '准备中', 0),
(1, '青年人才培养计划', '2024-06', '2024-12', '未开始', 0),
(1, '党建工作创新项目', '2024-07', '2024-12', '未开始', 0);
