import {  LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Form, Input, Select, Typography, message, Space } from 'antd'
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { UserContext } from '../components/userContext'

const { Title, Text } = Typography

export default function SignUp() {
  const [loading, setLoading] = useState(false)
  const {login} = useContext(UserContext);
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/signup`, 
        values
      )
      if (response.status===200) {
        console.log(response.data)
        login(response.data.token)
        
        // Use a more context-friendly approach for showing messages
        setTimeout(() => {
          message.success('Sign up successful!');
          navigate('/applicant');
        }, 0);
      } else {
        console.log(response.data.message)
        throw new Error('Sign up failed')
      }
    } catch (error) {
      console.log(error)
      
      // Use a more context-friendly approach for showing error messages
      setTimeout(() => {
        message.error(error.response?.data?.message || 'An error occurred during sign up');
      }, 0);
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          colorInfo: '#1890ff',
          colorTextBase: '#333',
          colorBgBase: '#f0f2f5',
          borderRadius: 4,
        },
      }}
    >
      <div style={{ padding: '20px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
          Create your account
        </Title>
        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#1890ff' }} />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters long' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('The two passwords do not match!'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Please enter your phone number' },
            ]}
          >
            <Input.TextArea
              prefix={<LockOutlined style={{ color: '#1890ff' }} />}
              placeholder="+91 242334322"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Sign Up
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center">
          <Text type="secondary">Already have an account?</Text>
          <Link to="/login">
            <Button type="link" className="font-bold">
              Log in
            </Button>
          </Link>
        </div>
      </div>
    </ConfigProvider>
  )
}