# 党支部分析系统编码规范

## 总则

1. 代码应当清晰、简洁、易于理解
2. 遵循DRY原则（Don't Repeat Yourself）
3. 优先考虑代码可读性和可维护性
4. 编写自文档化的代码，减少不必要的注释

## 命名约定

### 文件命名

1. **React组件文件**：
   - 使用PascalCase命名：`MonthlyWork.tsx`
   - 样式文件与组件同名：`MonthlyWork.css`
   - 测试文件添加`.test`后缀：`MonthlyWork.test.tsx`

2. **工具函数文件**：
   - 使用camelCase命名：`dataUtils.ts`
   - 类型定义文件使用`.types.ts`后缀：`branch.types.ts`

3. **后端文件**：
   - 控制器文件使用`Controller`后缀：`branchController.js`
   - 模型文件使用`Model`后缀：`branchModel.js`
   - 路由文件使用复数形式：`branches.js`

### 变量命名

1. **变量和函数**：
   - 使用camelCase命名：`getBranchData`
   - 使用有意义的名称，避免缩写
   - 布尔变量使用`is`、`has`、`should`等前缀：`isLoading`

2. **常量**：
   - 使用UPPER_SNAKE_CASE命名：`MAX_BRANCHES`
   - 放在文件顶部或单独的常量文件中

3. **组件**：
   - 使用PascalCase命名：`MonthlyWork`
   - 组件属性使用camelCase：`showAllBranches`

4. **接口和类型**：
   - 使用PascalCase命名：`BranchData`
   - 接口名称不使用`I`前缀

### CSS类命名

1. **类名**：
   - 使用kebab-case命名：`monthly-work-chart`
   - 组件主容器类名与组件同名：`monthly-work`
   - 子元素类名使用父元素名加后缀：`monthly-work-header`

2. **BEM命名法**（可选）：
   - 块（Block）：`card`
   - 元素（Element）：`card__title`
   - 修饰符（Modifier）：`card--large`

## 代码组织

### React组件

1. **组件结构**：
   ```typescript
   // 导入语句
   import React, { useState, useEffect } from 'react';
   
   // 接口/类型定义
   interface Props {
     // ...
   }
   
   // 常量定义
   const DEFAULT_VALUE = 'default';
   
   // 组件函数
   const ComponentName: React.FC<Props> = (props) => {
     // 状态和钩子
     const [state, setState] = useState(DEFAULT_VALUE);
     
     // 副作用
     useEffect(() => {
       // ...
     }, []);
     
     // 事件处理函数
     const handleEvent = () => {
       // ...
     };
     
     // 渲染辅助函数
     const renderItem = (item) => {
       // ...
     };
     
     // 返回JSX
     return (
       <div>
         {/* JSX内容 */}
       </div>
     );
   };
   
   // 导出语句
   export default ComponentName;
   ```

2. **组件拆分**：
   - 当组件超过200行时，考虑拆分
   - 将复杂逻辑提取为自定义Hook
   - 将可复用UI元素提取为子组件

### 后端代码

1. **路由文件结构**：
   ```javascript
   const express = require('express');
   const router = express.Router();
   const controller = require('../controllers/someController');
   
   // 路由定义
   router.get('/', controller.getAll);
   router.get('/:id', controller.getById);
   router.post('/', controller.create);
   router.put('/:id', controller.update);
   router.delete('/:id', controller.delete);
   
   module.exports = router;
   ```

2. **控制器文件结构**：
   ```javascript
   const model = require('../models/someModel');
   
   // 获取所有记录
   exports.getAll = async (req, res) => {
     try {
       // 业务逻辑
       const result = await model.getAll();
       res.json(result);
     } catch (error) {
       // 错误处理
       res.status(500).json({ error: error.message });
     }
   };
   
   // 其他控制器方法...
   ```

## 注释规范

1. **文件头注释**：
   ```typescript
   /**
    * @file 组件描述
    * @author 作者名
    * @date 创建日期
    */
   ```

2. **函数注释**（使用JSDoc格式）：
   ```typescript
   /**
    * 函数描述
    * @param {string} param1 - 参数1描述
    * @param {number} param2 - 参数2描述
    * @returns {Object} 返回值描述
    */
   function someFunction(param1, param2) {
     // 函数实现
   }
   ```

3. **复杂逻辑注释**：
   ```typescript
   // 对复杂算法或业务逻辑的解释
   // 多行注释应该清晰说明代码的目的和工作原理
   ```

## 代码格式

1. **缩进**：
   - 使用2个空格缩进
   - 不使用Tab字符

2. **行长度**：
   - 每行不超过100个字符
   - 长行应适当换行

3. **空行**：
   - 在逻辑块之间使用空行分隔
   - 在函数之间使用空行分隔
   - 不使用多个连续空行

4. **括号和空格**：
   - 控制语句的括号前加空格：`if (condition)`
   - 函数调用的括号前不加空格：`someFunction()`
   - 对象和数组字面量内部使用空格：`{ key: value }`

## TypeScript规范

1. **类型定义**：
   - 为所有变量、参数和返回值定义类型
   - 避免使用`any`类型，优先使用更具体的类型
   - 使用接口定义对象结构

2. **类型导出**：
   - 将共用类型定义放在单独的`.types.ts`文件中
   - 导出类型时使用`export type`语法

3. **泛型**：
   - 使用有意义的泛型名称：`T`代表类型，`K`代表键，`V`代表值
   - 为泛型添加约束：`<T extends SomeType>`

## 测试规范

1. **测试文件组织**：
   - 测试文件与被测文件放在同一目录
   - 测试文件命名为`*.test.ts`或`*.test.tsx`

2. **测试用例命名**：
   - 使用描述性的测试名称
   - 遵循"应该做什么"的格式：`it('should return correct data')`

3. **测试覆盖率**：
   - 核心业务逻辑测试覆盖率应达到80%以上
   - 每个组件至少有一个基本渲染测试

## Git提交规范

1. **提交消息格式**：
   ```
   <type>(<scope>): <subject>
   
   <body>
   
   <footer>
   ```

2. **类型（type）**：
   - feat: 新功能
   - fix: 修复bug
   - docs: 文档更新
   - style: 代码格式调整
   - refactor: 代码重构
   - test: 添加测试
   - chore: 构建过程或辅助工具变动

3. **范围（scope）**：
   - 指定修改的模块或组件

4. **主题（subject）**：
   - 简短描述，不超过50个字符
   - 使用现在时态，不使用句号

5. **正文（body）**：
   - 详细描述变更内容
   - 解释变更的原因和影响

6. **页脚（footer）**：
   - 引用相关的Issue或PR
   - 标记破坏性变更

## 性能优化规范

1. **React优化**：
   - 使用`React.memo`避免不必要的重渲染
   - 使用`useCallback`和`useMemo`缓存函数和计算结果
   - 使用懒加载（React.lazy）加载大型组件

2. **数据获取**：
   - 实现数据缓存，避免重复请求
   - 使用分页加载大量数据
   - 实现请求取消机制

3. **渲染优化**：
   - 避免在渲染函数中创建新函数或对象
   - 使用虚拟滚动处理长列表
   - 优化条件渲染，减少DOM操作
