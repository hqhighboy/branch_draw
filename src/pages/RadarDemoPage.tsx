import React from 'react';
import SimpleRadarDemo from '../components/SimpleRadarDemo';
import './RadarDemoPage.css';

/**
 * 雷达图演示页面
 */
const RadarDemoPage: React.FC = () => {
  return (
    <div className="radar-demo-page">
      <header className="page-header">
        <h1>党支部能力雷达图演示</h1>
      </header>
      
      <main className="page-content">
        <SimpleRadarDemo />
      </main>
      
      <footer className="page-footer">
        <p>党支部能力画像系统 © 2023</p>
      </footer>
    </div>
  );
};

export default RadarDemoPage;
