import React, { useState, useContext } from 'react';
import { Card, Button, message, Typography, Spin, Layout, Input, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../components/userContext';
import axios from 'axios';

const { Title } = Typography;
const { Content } = Layout;

const RenewCertificate = () => {
  const navigate = useNavigate();
  const { token } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState(null);
  const [form] = Form.useForm();

  const checkCertificateStatus = async (values) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/check-certificate/${values.aadhar_num}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.hasExistingCertificate) {
        setCertificateDetails(response.data);
        if (!response.data.isValid) {
          message.warning('Your certificate has expired. You can proceed with renewal.');
        }
      } else {
        message.info('No existing certificate found. Please apply for a new certificate.');
        setCertificateDetails(null);
      }
    } catch (error) {
      console.error('Error checking certificate:', error);
      message.error('Failed to check certificate status');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewal = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/renew-certificate`,
        {
          aadhar_num: form.getFieldValue('aadhar_num')
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success('Renewal application submitted successfully');
      navigate('/applicant/applications');
    } catch (error) {
      console.error('Error renewing certificate:', error);
      message.error('Failed to submit renewal application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Certificate Renewal</Title>
        
        <Form
          form={form}
          onFinish={checkCertificateStatus}
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
            <Button type="primary" htmlType="submit" loading={loading}>
              Check Certificate Status
            </Button>
          </Form.Item>
        </Form>

        {certificateDetails && (
          <div style={{ marginTop: '24px' }}>
            <Title level={4}>Certificate Details</Title>
            <p><strong>Status:</strong> {certificateDetails.isValid ? 'Valid' : 'Expired'}</p>
            <p><strong>Valid Until:</strong> {new Date(certificateDetails.validUntil).toLocaleDateString()}</p>
            <p>{certificateDetails.message}</p>
            
            {!certificateDetails.isValid && (
              <Button 
                type="primary"
                onClick={handleRenewal}
                loading={loading}
                style={{ marginTop: '16px' }}
              >
                Submit Renewal Application
              </Button>
            )}
          </div>
        )}
      </Card>
    </Content>
  );
};

export default RenewCertificate;
