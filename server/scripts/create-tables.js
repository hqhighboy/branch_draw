/**
 * 创建表结构工具
 * 
 * 此脚本用于创建所有必要的表结构
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

async function main() {
  console.log('=== 创建表结构工具 ===');
  
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 创建支部表
    console.log('\n创建branches表...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS branches (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL COMMENT '支部名称',
          secretary VARCHAR(50) COMMENT '书记',
          deputy_secretary VARCHAR(50) COMMENT '副书记',
          organizational_commissioner VARCHAR(50) COMMENT '组织委员',
          disciplinary_commissioner VARCHAR(50) COMMENT '纪律委员',
          propaganda_commissioner VARCHAR(50) COMMENT '宣传委员',
          learning_commissioner VARCHAR(50) COMMENT '学习委员',
          member_count INT DEFAULT 0 COMMENT '党员数量',
          average_age FLOAT DEFAULT 0 COMMENT '平均年龄',
          performance_2024 VARCHAR(255) COMMENT '2024年绩效',
          secretary_project VARCHAR(255) COMMENT '书记项目',
          honors TEXT COMMENT '荣誉',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='党支部信息表';
      `);
      console.log('branches表创建成功');
    } catch (error) {
      console.error('创建branches表失败:', error.message);
    }
    
    // 创建支部年龄分布表
    console.log('\n创建branch_age_distribution表...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS branch_age_distribution (
          id INT AUTO_INCREMENT PRIMARY KEY,
          branch_id INT NOT NULL COMMENT '支部ID',
          age_group VARCHAR(50) NOT NULL COMMENT '年龄段',
          percentage FLOAT NOT NULL COMMENT '百分比',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支部年龄分布表';
      `);
      console.log('branch_age_distribution表创建成功');
    } catch (error) {
      console.error('创建branch_age_distribution表失败:', error.message);
    }
    
    // 创建支部学历分布表
    console.log('\n创建branch_education_distribution表...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS branch_education_distribution (
          id INT AUTO_INCREMENT PRIMARY KEY,
          branch_id INT NOT NULL COMMENT '支部ID',
          education_level VARCHAR(50) NOT NULL COMMENT '学历',
          percentage FLOAT NOT NULL COMMENT '百分比',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支部学历分布表';
      `);
      console.log('branch_education_distribution表创建成功');
    } catch (error) {
      console.error('创建branch_education_distribution表失败:', error.message);
    }
    
    // 创建支部技能分布表
    console.log('\n创建branch_skill_distribution表...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS branch_skill_distribution (
          id INT AUTO_INCREMENT PRIMARY KEY,
          branch_id INT NOT NULL COMMENT '支部ID',
          skill_level VARCHAR(50) NOT NULL COMMENT '技能等级',
          percentage FLOAT NOT NULL COMMENT '百分比',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支部技能分布表';
      `);
      console.log('branch_skill_distribution表创建成功');
    } catch (error) {
      console.error('创建branch_skill_distribution表失败:', error.message);
    }
    
    // 创建支部职称分布表
    console.log('\n创建branch_title_distribution表...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS branch_title_distribution (
          id INT AUTO_INCREMENT PRIMARY KEY,
          branch_id INT NOT NULL COMMENT '支部ID',
          title VARCHAR(50) NOT NULL COMMENT '职称',
          percentage FLOAT NOT NULL COMMENT '百分比',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支部职称分布表';
      `);
      console.log('branch_title_distribution表创建成功');
    } catch (error) {
      console.error('创建branch_title_distribution表失败:', error.message);
    }
    
    // 创建支部年度工作表
    console.log('\n创建branch_annual_work表...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS branch_annual_work (
          id INT AUTO_INCREMENT PRIMARY KEY,
          branch_id INT NOT NULL COMMENT '支部ID',
          task VARCHAR(255) NOT NULL COMMENT '工作任务',
          start_time DATE COMMENT '开始时间',
          end_time DATE COMMENT '结束时间',
          status VARCHAR(50) DEFAULT '未开始' COMMENT '状态',
          progress INT DEFAULT 0 COMMENT '进度',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支部年度工作表';
      `);
      console.log('branch_annual_work表创建成功');
    } catch (error) {
      console.error('创建branch_annual_work表失败:', error.message);
    }
    
    // 创建员工表（简化版）
    console.log('\n创建employees表...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS employees (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) COMMENT '姓名',
          employee_code VARCHAR(50) COMMENT '员工编码',
          gender VARCHAR(10) COMMENT '性别',
          age INT COMMENT '年龄',
          department VARCHAR(255) COMMENT '部门',
          position VARCHAR(100) COMMENT '岗位',
          education VARCHAR(50) COMMENT '学历',
          skill_level VARCHAR(50) COMMENT '技能等级',
          skill_type VARCHAR(100) COMMENT '技能工种',
          tech_level VARCHAR(50) COMMENT '技术等级',
          tech_type VARCHAR(100) COMMENT '技术工种',
          political_status VARCHAR(50) COMMENT '政治面貌',
          branch_id INT COMMENT '所属支部ID',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_branch_id (branch_id),
          INDEX idx_department (department),
          INDEX idx_name (name),
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工信息表';
      `);
      console.log('employees表创建成功');
    } catch (error) {
      console.error('创建employees表失败:', error.message);
    }
    
    // 插入示例数据
    console.log('\n插入示例数据...');
    
    // 检查branches表是否为空
    const [branchCount] = await connection.execute('SELECT COUNT(*) as count FROM branches');
    
    if (branchCount[0].count === 0) {
      try {
        // 插入示例支部数据
        await connection.execute(`
          INSERT INTO branches (name, secretary, deputy_secretary, organizational_commissioner, 
                               disciplinary_commissioner, propaganda_commissioner, learning_commissioner, 
                               member_count, average_age)
          VALUES 
          ('第一党支部', '张三', '李四', '王五', '赵六', '钱七', '孙八', 25, 42.5),
          ('第二党支部', '刘一', '陈二', '张三', '李四', '王五', '赵六', 18, 38.2),
          ('第三党支部', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', 30, 45.7);
        `);
        
        // 获取插入的支部ID
        const [branches] = await connection.execute('SELECT id FROM branches');
        
        // 为每个支部插入年龄分布数据
        for (const branch of branches) {
          await connection.execute(`
            INSERT INTO branch_age_distribution (branch_id, age_group, percentage)
            VALUES 
            (?, '30岁以下', ?),
            (?, '30-40岁', ?),
            (?, '40-50岁', ?),
            (?, '50岁以上', ?);
          `, [
            branch.id, Math.random() * 25,
            branch.id, Math.random() * 35,
            branch.id, Math.random() * 25,
            branch.id, Math.random() * 15
          ]);
          
          // 插入学历分布数据
          await connection.execute(`
            INSERT INTO branch_education_distribution (branch_id, education_level, percentage)
            VALUES 
            (?, '博士', ?),
            (?, '硕士', ?),
            (?, '本科', ?),
            (?, '大专', ?),
            (?, '中专及以下', ?);
          `, [
            branch.id, Math.random() * 5,
            branch.id, Math.random() * 15,
            branch.id, Math.random() * 40,
            branch.id, Math.random() * 30,
            branch.id, Math.random() * 10
          ]);
          
          // 插入技能分布数据
          await connection.execute(`
            INSERT INTO branch_skill_distribution (branch_id, skill_level, percentage)
            VALUES 
            (?, '高级技师', ?),
            (?, '技师', ?),
            (?, '高级工', ?),
            (?, '中级工', ?),
            (?, '初级工', ?);
          `, [
            branch.id, Math.random() * 10,
            branch.id, Math.random() * 20,
            branch.id, Math.random() * 30,
            branch.id, Math.random() * 25,
            branch.id, Math.random() * 15
          ]);
          
          // 插入职称分布数据
          await connection.execute(`
            INSERT INTO branch_title_distribution (branch_id, title, percentage)
            VALUES 
            (?, '正高级', ?),
            (?, '副高级', ?),
            (?, '中级', ?),
            (?, '助理级', ?),
            (?, '员级', ?);
          `, [
            branch.id, Math.random() * 5,
            branch.id, Math.random() * 15,
            branch.id, Math.random() * 35,
            branch.id, Math.random() * 30,
            branch.id, Math.random() * 15
          ]);
          
          // 插入年度工作数据
          await connection.execute(`
            INSERT INTO branch_annual_work (branch_id, task, start_time, end_time, status, progress)
            VALUES 
            (?, '组织党员学习十九大精神', '2024-01-15', '2024-03-15', '已完成', 100),
            (?, '开展"不忘初心，牢记使命"主题教育', '2024-02-01', '2024-04-30', '进行中', 75),
            (?, '党员志愿服务活动', '2024-05-01', '2024-05-31', '未开始', 0),
            (?, '党支部换届选举', '2024-06-15', '2024-06-30', '未开始', 0),
            (?, '党员发展工作', '2024-01-01', '2024-12-31', '进行中', 40);
          `, [
            branch.id, branch.id, branch.id, branch.id, branch.id
          ]);
        }
        
        console.log('示例数据插入成功');
      } catch (error) {
        console.error('插入示例数据失败:', error.message);
      }
    } else {
      console.log('branches表已有数据，跳过示例数据插入');
    }
    
    // 关闭数据库连接
    await connection.end();
    console.log('\n表结构创建完成');
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error);
