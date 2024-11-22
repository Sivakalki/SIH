import {  LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Form, Input, Select, Typography, message } from 'antd'
import { useContext, useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
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
        message.success('Sign up successful!')
        navigate('/')
      } else {
        console.log(response.data.message)
        throw new Error('Sign up failed')
      }
    } catch (error) {
      console.log(error)
      message.error('An error occurred during sign up')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <Title level={2} className="text-gray-800">Create your account</Title>
          </div>
          <Form
            name="signup"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={true}
          >
            <Form.Item
              name="username"
              label={<span className="flex items-center">Username </span>}
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="email"
              label={<span className="flex items-center">Email </span>}
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span className="flex items-center">Password </span>}
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters long' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Password" />
            </Form.Item>
            <Form.Item
              name="confirm_password"
              label={<span className="flex items-center">Confirm Password </span>}
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
              <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Confirm Password" />
            </Form.Item>
            <Form.Item
              name="phone"
              label={<span className="flex items-center">Phone number </span>}
              rules={[
                { required: true, message: 'Please enter your phone number' },
              ]}
            >
              <Input.TextArea prefix={<LockOutlined className="text-gray-400" />} placeholder="+91 242334322" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full h-10 text-lg" loading={loading}>
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
      </div>
    </ConfigProvider>
  )
}