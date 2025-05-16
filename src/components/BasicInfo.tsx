import React from 'react';
import './BasicInfo.css';

interface Branch {
  id?: string;
  name: string;
  secretary?: string;
  deputySecretary?: string;
  organizationalCommissioner?: string;
  disciplinaryCommissioner?: string;
  memberCount?: number;
  averageAge?: number;
  honors?: string[];
}

interface BasicInfoProps {
  branch?: Branch;
}

/**
 * 支部基本情况组件
 */
const BasicInfo: React.FC<BasicInfoProps> = ({ branch }) => {
  // 如果branch为空，显示提示信息
  if (!branch) {
    return <div className="no-data-tip">暂无支部数据</div>;
  }

  // 处理可能为空的属性
  const honors = branch.honors || [];

  return (
    <div className="basic-info">
      <table className="info-table">
        <tbody>
          <tr>
            <td className="label">支部名称：</td>
            <td className="value">{branch.name}</td>
          </tr>
          <tr>
            <td className="label">书记：</td>
            <td className="value">{branch.secretary || '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">副书记：</td>
            <td className="value">{branch.deputySecretary || '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">组织委员：</td>
            <td className="value">{branch.organizationalCommissioner || '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">纪检委员：</td>
            <td className="value">{branch.disciplinaryCommissioner || '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">支部人数：</td>
            <td className="value">{branch.memberCount ? `${branch.memberCount} 人` : '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">平均年龄：</td>
            <td className="value">{branch.averageAge ? `${branch.averageAge} 岁` : '暂无数据'}</td>
          </tr>
          <tr>
            <td className="label">近年来所获荣誉：</td>
            <td className="value">
              <div className="honors-list">
                {honors.length > 0 ? (
                  honors.map((honor, index) => (
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
