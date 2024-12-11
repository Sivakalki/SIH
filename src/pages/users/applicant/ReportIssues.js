import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';

const ReportIssues = () => {
    const [issue, setIssue] = useState('');

    const handleSubmit = () => {
        if (!issue) {
            message.error('Please describe your issue.');
            return;
        }
        // Here you would typically send the issue to your backend
        message.success('Issue reported successfully!');
        setIssue('');
    };

    return (
        <Card style={{ margin: '20px' }}>
            <h2>Report Issues</h2>
            <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="Describe your issue"> 
                    <Input.TextArea rows={4} value={issue} onChange={(e) => setIssue(e.target.value)} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ReportIssues;
