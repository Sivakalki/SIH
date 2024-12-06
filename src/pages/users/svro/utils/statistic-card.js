import React from 'react';
import { Card, Space, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import '../svroDashboard.css';
const { Title } = Typography;

const StatisticCard = ({ 
  title, 
  value, 
  backgroundColor = '#f0f2f5', 
  borderColor = '#d9d9d9',
  textColor = '#000000',
  icon,
  to
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <Card 
      className="statistic-card" 
      style={{ 
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        cursor: to ? 'pointer' : 'default'
      }}
      hoverable={!!to}
      onClick={handleClick}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space>
          <div style={{ 
            fontSize: '24px', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            {icon}
          </div>
          <div>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: textColor,
              fontWeight: 500 
            }}>
              {title}
            </p>
            <Title 
              level={3} 
              style={{ 
                margin: 0,
                color: textColor,
                fontSize: '24px'
              }}
            >
              {value}
            </Title>
          </div>
        </Space>
      </Space>
    </Card>
  );
};

export default StatisticCard;
