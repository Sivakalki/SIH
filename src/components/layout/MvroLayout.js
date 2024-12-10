import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  AppstoreOutlined,
  LogoutOutlined,
  BarsOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider, Content } = Layout;

export default function MvroLayout({ children, logout }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (item) => {
    if (item.key === 'logout') {
      logout();
    } else {
      navigate(item.key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: '#fff'
        }}
      >
        <div style={{ 
          height: '32px', 
          margin: '16px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold' 
        }}>
          MVRO Dashboard
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={[
            {
              key: '/mvro',
              icon: <HomeOutlined />,
              label: 'Home',
            },
            {
              key: '/mvro/applications',
              icon: <FileTextOutlined />,
              label: 'All Applications',
            },
            {
              key: '/mvro/pending',
              icon: <BarsOutlined />,
              label: 'Pending Applications',
            },
            {
              key: '/mvro/schedule',
              icon: <CalendarOutlined />,
              label: 'Schedule Applications',
            },
            {
              key: '/mvro/completed',
              icon: <CheckCircleOutlined />,
              label: 'Completed Applications',
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              style: { marginTop: 'auto' }
            }
          ]}
          style={{
            border: 'none',
            padding: '16px 0'
          }}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}