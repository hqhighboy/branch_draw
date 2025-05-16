import React from 'react';
import { Layout, Typography, Row, Col, Card, Breadcrumb } from 'antd';
import DataUpload from '../../components/DataUpload';
import './DataUploadPage.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

/**
 * 数据上传页面
 * 提供数据模板下载和数据上传功能
 */
const DataUploadPage: React.FC = () => {
  return (
    <Layout className="data-upload-page">
      <Content className="data-upload-content">
        <Breadcrumb className="data-upload-breadcrumb">
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>数据管理</Breadcrumb.Item>
          <Breadcrumb.Item>数据上传</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} className="page-title">数据上传</Title>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card className="intro-card">
              <Title level={4}>数据上传说明</Title>
              <Paragraph>
                本功能用于上传和更新系统中的各类数据。请按照以下步骤操作：
              </Paragraph>
              <ol>
                <li>选择要上传的数据类型</li>
                <li>下载对应的数据模板</li>
                <li>按照模板格式填写数据</li>
                <li>上传填写好的数据文件</li>
              </ol>
              <Paragraph>
                注意：上传的数据将覆盖系统中已有的同类数据，请确保数据的准确性和完整性。
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <DataUpload />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default DataUploadPage;
