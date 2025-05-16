import React, { useState, useEffect } from 'react';
import { UpOutlined } from '@ant-design/icons';
import './CommonStyles.css';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <div className="back-to-top" onClick={scrollToTop}>
      <UpOutlined />
    </div>
  );
};

export default BackToTop;
