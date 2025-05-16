import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, DatePicker, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ManagementScoreType } from '../interfaces/BranchCapability';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface ManagementScoreFormProps {
  branchId: number;
  branchName: string;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const ManagementScoreForm: React.FC<ManagementScoreFormProps> = ({
  branchId,
  branchName,
  onSubmit,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [scoreType, setScoreType] = useState<ManagementScoreType>('特殊贡献赋值');

  const scoreTypeOptions: ManagementScoreType[] = [
    '特殊贡献赋值',
    '创新工作赋值',
    '战略任务赋值',
    '管理裁量赋值',
    '突发事件应对赋值'
  ];

  const getScoreRange = (type: ManagementScoreType): [number, number] => {
    switch (type) {
      case '特殊贡献赋值':
        return [0, 5];
      case '创新工作赋值':
        return [0, 3];
      case '战略任务赋值':
        return [0, 5];
      case '管理裁量赋值':
        return [-3, 3];
      case '突发事件应对赋值':
        return [-5, 5];
      default:
        return [0, 5];
    }
  };

  const handleScoreTypeChange = (value: ManagementScoreType) => {
    setScoreType(value);
    const [min, max] = getScoreRange(value);
    form.setFieldsValue({ score: Math.max(min, Math.min(form.getFieldValue('score') || 0, max)) });
  };

  const handleSubmit = (values: any) => {
    const formData = {
      ...values,
      branchId,
      evaluationDate: values.evaluationDate.format('YYYY-MM-DD'),
      approvalStatus: 'pending'
    };

    onSubmit(formData);
  };

  const uploadProps = {
    name: 'file',
    action: '/api/upload-evidence',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info: any) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  const [min, max] = getScoreRange(scoreType);

  return (
    <div className="management-score-form">
      <div className="form-header">
        <h2>添加管理赋值 - {branchName}</h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          scoreType: '特殊贡献赋值',
          score: 0,
          evaluationDate: dayjs()
        }}
      >
        <Form.Item
          name="scoreType"
          label="赋值类型"
          rules={[{ required: true, message: '请选择赋值类型' }]}
        >
          <Select onChange={(value) => handleScoreTypeChange(value as ManagementScoreType)}>
            {scoreTypeOptions.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="score"
          label={`赋值分数 (${min} ~ ${max})`}
          rules={[{ required: true, message: '请输入赋值分数' }]}
        >
          <InputNumber min={min} max={max} step={0.5} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="reason"
          label="赋值理由"
          rules={[{ required: true, message: '请输入赋值理由' }]}
        >
          <TextArea rows={4} placeholder="请详细描述赋值理由" />
        </Form.Item>

        <Form.Item
          name="evaluator"
          label="赋值人员"
          rules={[{ required: true, message: '请输入赋值人员' }]}
        >
          <Input placeholder="请输入赋值人员姓名" />
        </Form.Item>

        <Form.Item
          name="evaluationDate"
          label="赋值日期"
          rules={[{ required: true, message: '请选择赋值日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="evidence"
          label="佐证材料"
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>上传佐证材料</Button>
          </Upload>
        </Form.Item>

        <div className="form-footer">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit">提交赋值</Button>
        </div>
      </Form>
    </div>
  );
};

export default ManagementScoreForm;
