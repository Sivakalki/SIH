import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const HomePage = () => {
  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '24px' }}>My App</div>
        <Menu theme="dark" mode="horizontal" style={{ flex: 1 }}>
          <Menu.Item key="1">
            <Link to="/">Home</Link>
          </Menu.Item>
        </Menu>
        <div>
          <Link to="/login">
            <Button type="primary" icon={<UserOutlined />} style={{ marginRight: '10px' }}>
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button type="default">Sign Up</Button>
          </Link>
        </div>
      </Header>

      <Content style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Welcome to My App</h1>
        <p>This is the home page content.</p>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        My App ©{new Date().getFullYear()} Created by My Team
      </Footer>
    </Layout>
  );
};

export default HomePage;
