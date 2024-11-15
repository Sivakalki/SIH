import React , {useState} from 'react';
import { Form, Input, Button, Checkbox , message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = () => {

  const [loginData, setLoginData] = useState({
    username:'',
    password:'',
  });
  const onFinish = (values) => {
    console.log('Received values from form: ', values);
    // Handle login logic (e.g., send data to the backend)
    setLoginData(values);
    message.success('Login successfull ! Your data is saved temporarily');
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '50px 0' }}>
      <h2 style={{ textAlign: 'center' }}>Login</h2>
      <Form
        name="login"
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
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
          />
        </Form.Item>

        {/* Remember me Checkbox */}
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
