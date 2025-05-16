# 党支部数据展示系统

这是一个用于展示党支部数据的Web应用程序，包括支部基本情况、人员分析、年度重点工作等信息。

## 系统架构

- 前端：React + TypeScript + Chart.js
- 后端：Node.js + Express
- 数据库：MySQL

## 目录结构

```
branch-analysis/
├── public/                 # 静态资源
├── src/                    # 前端源代码
│   ├── data/               # 本地数据文件（用于开发和备份）
│   ├── App.tsx             # 主应用组件
│   ├── App.css             # 样式文件
│   └── ...
├── server/                 # 后端服务器
│   ├── db.js               # 数据库连接和操作
│   ├── server.js           # Express服务器
│   ├── setup.sql           # 数据库初始化脚本
│   └── package.json        # 后端依赖
├── package.json            # 前端依赖
└── start.bat               # 启动脚本
```

## 安装和运行

### 前提条件

- Node.js 14+
- MySQL 5.7+

### 数据库设置

1. 安装MySQL并创建一个名为`db`的数据库
2. 运行`server/setup.sql`脚本初始化数据库结构和示例数据

```bash
mysql -u root -p < server/setup.sql
```

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 启动应用

使用提供的启动脚本：

```bash
start.bat
```

或者手动启动：

```bash
# 启动后端服务器
cd server
node server.js

# 启动前端应用（在另一个终端中）
npm start
```

应用将在以下地址运行：
- 前端：http://localhost:3000
- 后端：http://localhost:3002

## 数据导入导出

系统支持通过Excel文件导入和导出数据：

1. 点击"模板下载"按钮获取Excel模板
2. 填写模板中的数据
3. 点击"数据上传"按钮上传填写好的Excel文件

## 开发者说明

### 前端开发

前端使用React和TypeScript开发，主要组件包括：

- `BasicInfo`：显示支部基本情况
- `PersonnelAnalysis`：显示支部人员分析（年龄、学历、技能、职称分布）
- `AnnualWork`：显示支部年度重点工作
- `MonthlyWork`：显示月度工作完成情况
- `BranchAnalysis`：显示支部综合能力画像

### 后端开发

后端使用Node.js和Express开发，主要功能包括：

- 提供API接口获取支部列表和详细信息
- 处理Excel文件上传和数据导入
- 与MySQL数据库交互

### 数据库结构

数据库包含以下表：

- `branches`：支部基本信息
- `branch_age_distribution`：支部年龄分布
- `branch_education_distribution`：支部学历分布
- `branch_skill_distribution`：支部技能分布
- `branch_title_distribution`：支部职称分布
- `branch_annual_work`：支部年度重点工作
