import React from 'react';
import { Card, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import '../svroDashboard.css';
const { Title } = Typography;

const StatisticCard = ({ title, count, backgroundColor, icon }) => {
  return (
    <Card className="statistic-card" style={{ backgroundColor }}>
      <Space>
        {icon}
        <Link to={`${title}`} style={{ textDecoration: 'none' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>{title}</p>
          <Title level={3} style={{ margin: 0 }}>{count}</Title>
        </Link>
      </Space>
    </Card>
  );
};

export default StatisticCard;
