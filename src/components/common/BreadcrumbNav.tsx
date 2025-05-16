import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import './CommonStyles.css';

interface BreadcrumbItem {
  path?: string;
  label: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items }) => {
  return (
    <Breadcrumb className="breadcrumb">
      <Breadcrumb.Item>
        <a href="/">
          <HomeOutlined /> 首页
        </a>
      </Breadcrumb.Item>
      {items.map((item, index) => (
        <Breadcrumb.Item key={index}>
          {item.path ? (
            <a href={item.path}>{item.label}</a>
          ) : (
            item.label
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default BreadcrumbNav;
