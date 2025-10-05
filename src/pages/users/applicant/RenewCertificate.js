import React, { useState } from 'react';
import { Card, Button, message, Typography, Layout, Input, Form, Modal, Space } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Content } = Layout;

const RenewCertificate = () => {
  const [loading, setLoading] = useState(false);
  const [verifyingAadhar, setVerifyingAadhar] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleNewApplication = () => {
    navigate('/applicant/new-application');
  };

  const handleRenew = () => {
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.numOfApplications === 0) {
        message.error('No certificate found for this Aadhar number. Please create a new application.');
        handleNewApplication();
      } else if (response.data.numOfApplications === 1) {
        navigate('/applicant/new-application');
        setIsModalVisible(true);
        setProfileData(response.data.profileData);
        message.info('Existing certificate found for this Aadhar number');
      } else {
        message.error('Invalid Aadhar number. Please check and try again.');
      }
    } catch (error) {
      console.error('Error verifying Aadhar:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
      } else {
        message.error('Failed to verify Aadhar. Please try again.');
      }
    } finally {
      setVerifyingAadhar(false);
    }
  };

  return (
    <Content style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <Card
        bordered={false}
        style={{
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: '32px',
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          Certificate Renewal
        </Title>

        <Form form={form} onFinish={verifyAadhar} layout="vertical">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Form.Item
              name="aadhar_num"
              label={<Text strong>Aadhar Number</Text>}
              rules={[
                { required: true, message: 'Please enter your Aadhar number' },
                { len: 12, message: 'Aadhar number must be exactly 12 digits' },
                { pattern: /^\d+$/, message: 'Aadhar number must contain only digits' },
              ]}
            >
              <Input
                placeholder="Enter your 12-digit Aadhar number"
                maxLength={12}
                type="text"
                style={{ width: '300px', padding: '8px 12px', borderRadius: '6px' }}
                onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) &&
                    !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
                  e.preventDefault();
                }

                if (e.key === 'Enter') {
                  form.submit(); 
                }
              }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={verifyingAadhar}
                style={{ borderRadius: '6px', padding: '0 24px' }}
              >
                Verify Aadhar
              </Button>
            </Form.Item>
          </div>
        </Form>


        {profileData && (
          <Card
            title="Profile Information"
            style={{
              marginTop: '32px',
              borderRadius: '10px',
              backgroundColor: '#fafafa',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '48px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '220px' }}>
                <p><Text strong>Full Name:</Text> {profileData.fullName}</p>
                <p><Text strong>Date of Birth:</Text> {profileData.dateOfBirth}</p>
                <p><Text strong>Gender:</Text> {profileData.gender}</p>
                <p><Text strong>Religion:</Text> {profileData.religion}</p>
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <p><Text strong>Caste:</Text> {profileData.caste}</p>
                <p><Text strong>Address:</Text> {profileData.address}</p>
                <p><Text strong>District:</Text> {profileData.district}</p>
                <p><Text strong>State:</Text> {profileData.state}</p>
              </div>
            </div>
          </Card>
        )}

        <Modal
          title="Certificate Found"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" onClick={handleRenew}>
                Renew Certificate
              </Button>
            </Space>
          }
        >
          <p>An existing certificate was found for this Aadhar number. Would you like to renew it?</p>
        </Modal>
      </Card>
    </Content>
  );
};

export default RenewCertificate;
