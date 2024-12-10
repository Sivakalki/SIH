import React, { useState } from 'react';
import { Card, Button, message, Typography, Layout, Input, Form, Modal } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Content } = Layout;

const RenewCertificate = () => {
  const [loading, setLoading] = useState(false);
  const [verifyingAadhar, setVerifyingAadhar] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleNewApplication = () => {
    navigate('/applicant/new-application');
  };

  const handleRenew = () => {
    // Add renew logic here
    setIsModalVisible(false);
    message.success('Proceeding with certificate renewal...');
  };

  const verifyAadhar = async (values) => {
    const { aadhar_num } = values;
    
    if (!aadhar_num) {
      message.error('Please enter Aadhar number first');
      return;
    }

    try {
      setVerifyingAadhar(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/check_aadhaar/${aadhar_num}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.numOfApplications === 0) {
        message.error('No certificate found for this Aadhar number. Please create a new application.');
        handleNewApplication();
      } 
      else if(response.data.numOfApplications >= 1) {
        setIsModalVisible(true);
        message.info('Existing certificate found for this Aadhar number');
      }
      else {
        message.error('Invalid Aadhar number. Please check and try again.');
      }
    } catch (error) {
      console.error('Error verifying Aadhar:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
        // Add logout logic here if needed
      } else {
        message.error('Failed to verify Aadhar. Please try again.');
      }
    } finally {
      setVerifyingAadhar(false);
    }
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Certificate Renewal</Title>
        
        <Form
          form={form}
          onFinish={verifyAadhar}
          layout="vertical"
        >
          <Form.Item
            name="aadhar_num"
            label="Aadhar Number"
            rules={[
              { required: true, message: 'Please enter your Aadhar number' },
              { len: 12, message: 'Aadhar number must be exactly 12 digits' },
              { pattern: /^\d+$/, message: 'Aadhar number must contain only digits' }
            ]}
          >
            <Input
              placeholder="Enter your 12-digit Aadhar number"
              maxLength={12}
              style={{ width: '100%', maxWidth: '300px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={verifyingAadhar}>
              Verify Aadhar
            </Button>
          </Form.Item>
        </Form>

        <Modal
          title="Certificate Found"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="renew" type="primary" onClick={handleRenew}>
              Renew Certificate
            </Button>,
          ]}
        >
          <p>An existing certificate was found for this Aadhar number. Would you like to renew it?</p>
        </Modal>
      </Card>
    </Content>
  );
};

export default RenewCertificate;
