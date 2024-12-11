import React, { useContext, useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Space, 
  Modal
} from 'antd';
import { 
  MailOutlined, 
  LockOutlined 
} from '@ant-design/icons';
import { UserContext } from '../components/userContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SignUp from './SignUp';

const { Text } = Typography;

const Login = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/login`, values);
      
      if (res.status === 200) {
        const { token, role } = res.data;
        login(token);
        
        message.success('Login successful!');

        // Role-based navigation
        const roleRoutes = {
          'ADMIN': '/admin',
          'SVRO': '/svro',
          'MVRO': '/mvro',
          'RI': '/ri',
          'MRO': '/mro',
          'APPLICANT': '/applicant'
        };

        navigate(roleRoutes[role] || '/applicant');
      } else {
        message.error(res.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Card 
        style={{ 
          width: '300px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
          margin: '0 auto'
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ color: '#1890ff', fontSize: '18px' }}>
              Login
            </Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                placeholder="Email"
                size="middle"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Password"
                size="middle"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account? <a onClick={showModal}>Sign Up</a>
            </Text>
          </div>
        </Space>
      </Card>

      <Modal 
        title="Sign Up" 
        visible={isModalVisible} 
        onCancel={handleCancel} 
        footer={null}
        style={{ top: 20 }}
        bodyStyle={{ padding: '20px' }}
      >
        <SignUp />
      </Modal>
    </>
  );
};

export default Login;
