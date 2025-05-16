-- 创建支部基本信息表
CREATE TABLE IF NOT EXISTS branch_info (
    branch_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    secretary VARCHAR(50) NOT NULL,
    deputy_secretary VARCHAR(50) NOT NULL,
    organizational_commissioner VARCHAR(50) NOT NULL,
    disciplinary_commissioner VARCHAR(50) NOT NULL,
    propaganda_commissioner VARCHAR(50) NOT NULL,
    learning_commissioner VARCHAR(50) NOT NULL,
    member_count INT NOT NULL,
    average_age DECIMAL(4,1) NOT NULL,
    performance_2024 VARCHAR(50) NOT NULL,
    secretary_project VARCHAR(100) NOT NULL,
    honors TEXT NOT NULL
);

-- 创建支部人员年龄分布表
CREATE TABLE IF NOT EXISTS branch_age_distribution (
    branch_id INT,
    age_range VARCHAR(20),
    percentage DECIMAL(5,2),
    PRIMARY KEY (branch_id, age_range),
    FOREIGN KEY (branch_id) REFERENCES branch_info(branch_id)
);

-- 创建支部人员学历分布表
CREATE TABLE IF NOT EXISTS branch_education_distribution (
    branch_id INT,
    education_level VARCHAR(20),
    percentage DECIMAL(5,2),
    PRIMARY KEY (branch_id, education_level),
    FOREIGN KEY (branch_id) REFERENCES branch_info(branch_id)
);

-- 创建支部人员技能等级分布表
CREATE TABLE IF NOT EXISTS branch_skill_distribution (
    branch_id INT,
    skill_level VARCHAR(20),
    percentage DECIMAL(5,2),
    PRIMARY KEY (branch_id, skill_level),
    FOREIGN KEY (branch_id) REFERENCES branch_info(branch_id)
);

-- 创建支部人员职称分布表
CREATE TABLE IF NOT EXISTS branch_title_distribution (
    branch_id INT,
    title_level VARCHAR(30),
    percentage DECIMAL(5,2),
    PRIMARY KEY (branch_id, title_level),
    FOREIGN KEY (branch_id) REFERENCES branch_info(branch_id)
);

-- 创建支部年度重点工作表
CREATE TABLE IF NOT EXISTS branch_annual_work (
    work_id INT PRIMARY KEY,
    branch_id INT,
    task_name VARCHAR(200) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    progress DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branch_info(branch_id)
);

-- 创建支部雷达图数据表
CREATE TABLE IF NOT EXISTS branch_radar_data (
    branch_id INT,
    dimension VARCHAR(30),
    score DECIMAL(5,2),
    PRIMARY KEY (branch_id, dimension),
    FOREIGN KEY (branch_id) REFERENCES branch_info(branch_id)
);

-- 创建支部标签表
CREATE TABLE IF NOT EXISTS branch_tags (
    branch_id INT,
    tag VARCHAR(30),
    PRIMARY KEY (branch_id, tag),
    FOREIGN KEY (branch_id) REFERENCES branch_info(branch_id)
);
