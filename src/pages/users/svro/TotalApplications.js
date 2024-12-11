import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const TotalApplications = ({ total }) => {
    const navigate = useNavigate();

    return (
        <Card 
            style={{ cursor: 'pointer' }} 
            onClick={() => navigate('/applications')}
        >
            <Title level={4}>
                Total Applications: {total}
            </Title>
        </Card>
    );
};

export default TotalApplications;