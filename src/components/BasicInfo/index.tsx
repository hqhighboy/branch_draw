/**
 * @file 支部基本情况组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React from 'react';
import { useBranch } from '../../context/BranchContext';
import { Branch } from '../../types';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import './BasicInfo.css';

// 组件属性
export interface BasicInfoProps {
  branch?: Branch | null;
}

/**
 * 支部基本情况组件
 * @param {BasicInfoProps} props 组件属性
 * @returns {JSX.Element} 支部基本情况组件
 */
const BasicInfo: React.FC<BasicInfoProps> = ({ branch }) => {
  // 获取支部上下文
  const { branches, selectedBranch, loading, error, selectBranch } = useBranch();

  // 使用传入的 branch 或者上下文中的 selectedBranch
  const branchData = branch || selectedBranch;

  // 加载中
  if (loading && !branch) {
    return <Loading />;
  }

  // 错误
  if (error && !branch) {
    return <ErrorMessage message={error} />;
  }

  // 无数据
  if (!branchData) {
    return <EmptyState description="暂无支部数据" />;
  }

  // 处理可能为空的属性
  const honors = branchData.honors ? (Array.isArray(branchData.honors) ? branchData.honors : [branchData.honors]) : [];

  // 处理支部选择变化
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    selectBranch(branchId);
  };

  return (
    <div className="basic-info">
      {/* 添加支部选择下拉框 */}
      <div className="branch-selector-wrapper">
        <label htmlFor="branch-select">选择支部：</label>
        <select
          id="branch-select"
          className="branch-selector"
          value={branchData.id || ''}
          onChange={handleBranchChange}
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      <table className="info-table">
        <tbody>
          <tr>
            <td className="label">支部名称：</td>
            <td className="value">{branchData.name}</td>
          </tr>
          <tr>
            <td className="label">书记：</td>
            <td className="value">{branchData.secretary || '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">副书记：</td>
            <td className="value">{branchData.deputySecretary || '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">组织委员：</td>
            <td className="value">{branchData.organizationalCommissioner || '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">纪检委员：</td>
            <td className="value">{branchData.disciplinaryCommissioner || '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">支部人数：</td>
            <td className="value">{branchData.memberCount ? `${branchData.memberCount} 人` : '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">平均年龄：</td>
            <td className="value">{branchData.averageAge ? `${branchData.averageAge} 岁` : '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">近年来所获荣誉：</td>
            <td className="value">
              <div className="honors-list">
                {honors.length > 0 ? (
                  honors.map((honor: string, index: number) => (
                    <span key={index} className="honor-item">{honor}</span>
                  ))
                ) : (
                  <span className="no-data">暂无荣誉数据</span>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default BasicInfo;
