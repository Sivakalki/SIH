import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const ApplicationProcess = () => {
    return (
        <Card style={{ margin: '20px' }}>
            <Title level={2}>Application Process</Title>
            <Paragraph>
                Here you can find the details about how to apply for the application. Follow the steps below:
            </Paragraph>
            <ul>
                <li>Step 1: Fill out the application form.</li>
                <li>Step 2: Submit the required documents.</li>
                <li>Step 3: Pay the application fee.</li>
                <li>Step 4: Wait for processing.</li>
                <li>Step 5: Check your application status.</li>
            </ul>
        </Card>
    );
};

export default ApplicationProcess;
