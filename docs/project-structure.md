# 党支部分析系统项目结构文档

## 项目概述

党支部分析系统是一个用于分析党支部工作情况、人员构成和综合能力的Web应用程序。系统采用前后端分离架构，前端使用React框架，后端使用Express.js和MySQL数据库。

## 目录结构

```
branch-analysis/
├── docs/                    # 项目文档
├── public/                  # 静态资源
├── server/                  # 后端服务器代码
│   ├── controllers/         # 控制器层
│   ├── models/              # 数据访问层
│   ├── routes/              # API路由
│   ├── middleware/          # 中间件
│   ├── utils/               # 工具函数
│   ├── db.js                # 数据库连接
│   └── server.js            # Express服务器入口
├── src/                     # 前端React代码
│   ├── components/          # 组件
│   │   ├── common/          # 公共组件
│   │   ├── BasicInfo/       # 支部基本情况组件
│   │   ├── PersonnelAnalysis/ # 支部人员分析组件
│   │   ├── AnnualWork/      # 年度重点工作组件
│   │   ├── MonthlyWork/     # 月度工作完成情况组件
│   │   └── BranchCapability/ # 支部能力画像组件
│   ├── context/             # React Context
│   ├── hooks/               # 自定义Hooks
│   ├── pages/               # 页面组件
│   ├── services/            # API服务
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── App.tsx              # 应用入口组件
│   └── index.tsx            # React入口文件
├── tests/                   # 测试文件
├── .github/                 # GitHub配置
├── package.json             # 项目依赖配置
└── README.md                # 项目说明
```

## 架构设计

### 前端架构

前端采用React框架，使用TypeScript进行开发，主要包括以下几个部分：

1. **组件层**：
   - 公共组件：可复用的UI组件
   - 业务组件：实现具体业务功能的组件
   - 页面组件：整合多个业务组件的完整页面

2. **状态管理**：
   - React Context API：管理全局状态
   - 组件内部状态：管理组件私有状态

3. **服务层**：
   - API服务：封装与后端API的交互
   - 工具服务：提供通用功能

4. **路由管理**：
   - React Router：管理前端路由

### 后端架构

后端采用Express.js框架，使用Node.js进行开发，主要包括以下几个部分：

1. **路由层**：
   - 定义API端点
   - 处理HTTP请求

2. **控制器层**：
   - 处理业务逻辑
   - 调用数据访问层

3. **数据访问层**：
   - 与数据库交互
   - 执行CRUD操作

4. **中间件层**：
   - 身份验证
   - 错误处理
   - 请求日志

5. **工具层**：
   - 辅助函数
   - 通用服务

## 数据流

1. **前端到后端**：
   - 前端组件通过API服务调用后端API
   - 请求经过路由层到达控制器层
   - 控制器调用数据访问层获取数据
   - 数据返回给前端

2. **后端到数据库**：
   - 数据访问层执行SQL查询
   - 数据库返回查询结果
   - 结果经过处理后返回给控制器

3. **全局状态管理**：
   - Context Provider在应用顶层提供全局状态
   - 组件通过Context Hooks访问全局状态
   - 状态更新触发组件重新渲染

## 组件职责

### 前端组件

1. **DashboardPage**：
   - 主页面组件
   - 管理全局状态
   - 整合所有子组件

2. **BasicInfo**：
   - 显示支部基本情况
   - 包括支部名称、书记等信息

3. **PersonnelAnalysis**：
   - 显示支部人员分析
   - 包括年龄、学历等分布

4. **AnnualWork**：
   - 显示年度重点工作
   - 展示工作完成情况

5. **MonthlyWork**：
   - 显示月度工作完成情况
   - 使用柱状图展示

6. **BranchCapability**：
   - 显示支部综合能力画像
   - 使用雷达图展示

7. **AIConfig**：
   - AI配置组件
   - 设置AI模型参数

8. **AIAnalysis**：
   - AI智能分析组件
   - 展示AI分析结果

### 后端模块

1. **branchController**：
   - 处理支部相关请求
   - 获取支部列表和详情

2. **personnelController**：
   - 处理人员相关请求
   - 获取人员分析数据

3. **workController**：
   - 处理工作相关请求
   - 获取年度和月度工作数据

4. **capabilityController**：
   - 处理能力画像相关请求
   - 获取支部能力评估数据

5. **aiController**：
   - 处理AI相关请求
   - 调用AI服务进行分析

## 技术栈

### 前端
- React
- TypeScript
- Ant Design
- Chart.js
- Axios

### 后端
- Node.js
- Express.js
- MySQL
- Multer (文件上传)
- Dify API (AI服务)

## 开发规范

详见 `coding-standards.md` 文档。
