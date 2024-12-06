import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;

export default function SvroLayout({ children, logout }) {
  const location = useLocation();

  const menuItems = [
    {
      key: '/svro',
      icon: <DashboardOutlined />,
      label: <Link to="/svro">Dashboard</Link>,
    },
    {
      key: '/svro/applications',
      icon: <AppstoreOutlined />,
      label: <Link to="/svro/applications">Applications</Link>,
    },
    {
      key: '/svro/reports',
      icon: <FileTextOutlined />,
      label: <Link to="/svro/reports">Reports</Link>,
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        width={250}
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          borderRight: '1px solid #f0f0f0',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="p-4 text-2xl font-bold text-blue-600 border-b border-gray-200">
          CertiTrack
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{
            border: 'none',
            padding: '16px 0'
          }}
        />
        <div
          className="absolute bottom-0 w-full border-t border-gray-200 p-4 cursor-pointer hover:bg-gray-50"
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <LogoutOutlined style={{ marginRight: 8 }} />
          <span>Logout</span>
        </div>
      </Sider>
      <Layout style={{ marginLeft: 250 }}>
        <Content style={{ padding: '24px', minHeight: '100vh', background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
