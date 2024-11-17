import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';

const SignUp = () => {
  // Use useState to hold form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });

  const onFinish = (values) => {
    console.log('Received values from form: ', values);

    // Store form data in the state
    setFormData(values);

    // Show success message
    message.success('Sign up successful! Your data is saved temporarily.');

    // Optionally, reset the form after submission
    // form.resetFields();
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '50px 0' }}>
      <h2 style={{ textAlign: 'center' }}>Sign Up</h2>
      <Form
        name="signup"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
      >
        {/* Username Field */}
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
            value={formData.username} // bind to formData
            onChange={(e) => setFormData({ ...formData, username: e.target.value })} // update state
          />
        </Form.Item>

        {/* Email Field */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            value={formData.email} // bind to formData
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} // update state
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            value={formData.password} // bind to formData
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} // update state
          />
        </Form.Item>

        {/* Confirm Password Field */}
        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
            value={formData.confirm} // bind to formData
            onChange={(e) => setFormData({ ...formData, confirm: e.target.value })} // update state
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignUp;
