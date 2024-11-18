import React , {useContext, useState} from 'react';
import { Form, Input, Button, Checkbox , message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { UserContext } from '../components/userContext';
import axios from 'axios';
import { useNavigate} from 'react-router-dom';
const Login = () => {
  const {login } = useContext(UserContext)
  const navigate = useNavigate();
  const onFinish = async (values) => {
    console.log('Received values from form: ', values);
    // Handle login logic (e.g., send data to the backend)
    try{
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/login`,
        values
      )
      console.log(res)
      if(res.status===200){
        const token = res.data.token
        login(token)
        console.log(res.data.data.role," is the user data role ");
        message.success('Login successfull ! Your data is saved temporarily');
        if(res.data.data.role === 'ADMIN'){
          navigate('/admin')
        }
        else{
          navigate('/')
        }
      }
      else{
        message.error(res.data.message)
      }
    }
    catch(e){
      message.error(e.response.data.message)
    }
    // setLoginData(values);
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
        {/* email Field */}
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Please input your email!' },
            {type: 'email',message: 'Please enter a valid email!'}
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="email"
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

        {/* Remember me Checkbox
        <Form.Item name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item> */}

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
