/**
 * Dify工作流配置
 * 
 * 此文件定义了Dify工作流的结构和行为
 */

// 工作流定义
const workflowDefinition = {
  name: "Excel数据导入工作流",
  description: "从Excel表格中提取数据并更新到系统中",
  version: "1.0.0",
  
  // 工作流触发器
  triggers: [
    {
      type: "webhook",
      name: "excel_upload_trigger",
      description: "当Excel文件上传时触发"
    },
    {
      type: "schedule",
      name: "daily_import_trigger",
      description: "每天定时导入数据",
      schedule: "0 0 * * *" // 每天0点执行
    }
  ],
  
  // 工作流步骤
  steps: [
    {
      id: "validate_excel",
      name: "验证Excel文件",
      type: "script",
      script: "validateExcelFile",
      next: {
        success: "extract_data",
        failure: "handle_error"
      }
    },
    {
      id: "extract_data",
      name: "提取Excel数据",
      type: "script",
      script: "extractExcelData",
      next: {
        success: "transform_data",
        failure: "handle_error"
      }
    },
    {
      id: "transform_data",
      name: "转换数据格式",
      type: "script",
      script: "transformData",
      next: {
        success: "update_database",
        failure: "handle_error"
      }
    },
    {
      id: "update_database",
      name: "更新数据库",
      type: "script",
      script: "updateDatabase",
      next: {
        success: "send_notification",
        failure: "handle_error"
      }
    },
    {
      id: "send_notification",
      name: "发送通知",
      type: "script",
      script: "sendNotification",
      next: {
        success: "end",
        failure: "end"
      }
    },
    {
      id: "handle_error",
      name: "处理错误",
      type: "script",
      script: "handleError",
      next: {
        success: "end",
        failure: "end"
      }
    }
  ]
};

// 工作流脚本定义
const workflowScripts = {
  // 验证Excel文件
  validateExcelFile: async (context) => {
    const { file } = context.data;
    
    // 检查文件是否存在
    if (!file) {
      return {
        success: false,
        error: "文件不存在"
      };
    }
    
    // 检查文件类型
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      return {
        success: false,
        error: "文件类型不支持，请上传Excel文件(.xlsx, .xls)"
      };
    }
    
    return {
      success: true,
      data: {
        file
      }
    };
  },
  
  // 提取Excel数据
  extractExcelData: async (context) => {
    const { file } = context.data;
    
    try {
      // 调用API提取数据
      const response = await fetch(`${context.config.apiBaseUrl}/api/dify/import-excel`, {
        method: 'POST',
        body: file
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.message
        };
      }
      
      return {
        success: true,
        data: {
          excelData: result.data
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `提取Excel数据失败: ${error.message}`
      };
    }
  },
  
  // 转换数据格式
  transformData: async (context) => {
    const { excelData } = context.data;
    
    try {
      // 转换数据格式
      const transformedData = {
        branches: [],
        distributions: [],
        annualWork: []
      };
      
      // 处理支部数据
      if (excelData.branches) {
        transformedData.branches = excelData.branches.map(branch => ({
          name: branch.name,
          secretary: branch.secretary,
          deputySecretary: branch.deputySecretary,
          organizationalCommissioner: branch.organizationalCommissioner,
          disciplinaryCommissioner: branch.disciplinaryCommissioner,
          propagandaCommissioner: branch.propagandaCommissioner,
          learningCommissioner: branch.learningCommissioner,
          memberCount: branch.memberCount
        }));
      }
      
      // 处理分布数据
      if (excelData.distributions) {
        // 处理分布数据...
      }
      
      // 处理年度工作数据
      if (excelData.annualWork) {
        // 处理年度工作数据...
      }
      
      return {
        success: true,
        data: {
          transformedData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `转换数据格式失败: ${error.message}`
      };
    }
  },
  
  // 更新数据库
  updateDatabase: async (context) => {
    const { transformedData } = context.data;
    
    try {
      // 调用API更新数据库
      const response = await fetch(`${context.config.apiBaseUrl}/api/dify/update-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformedData)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.message
        };
      }
      
      return {
        success: true,
        data: {
          updateResult: result.data
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `更新数据库失败: ${error.message}`
      };
    }
  },
  
  // 发送通知
  sendNotification: async (context) => {
    const { updateResult } = context.data;
    
    try {
      // 发送通知
      const notification = {
        title: "数据导入完成",
        message: `成功导入 ${updateResult.insertedCount} 条数据，更新 ${updateResult.updatedCount} 条数据`,
        type: "success"
      };
      
      // 调用API发送通知
      const response = await fetch(`${context.config.apiBaseUrl}/api/dify/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.message
        };
      }
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: `发送通知失败: ${error.message}`
      };
    }
  },
  
  // 处理错误
  handleError: async (context) => {
    const { error } = context;
    
    try {
      // 记录错误
      console.error("工作流执行错误:", error);
      
      // 发送错误通知
      const notification = {
        title: "数据导入失败",
        message: error,
        type: "error"
      };
      
      // 调用API发送通知
      const response = await fetch(`${context.config.apiBaseUrl}/api/dify/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error("处理错误失败:", error);
      return {
        success: false,
        error: `处理错误失败: ${error.message}`
      };
    }
  }
};

module.exports = {
  workflowDefinition,
  workflowScripts
};
