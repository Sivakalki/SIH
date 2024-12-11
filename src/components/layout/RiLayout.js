import React, { useState, useContext } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  AppstoreOutlined,
  LogoutOutlined,
  BarsOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  SnippetsOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../userContext';

const { Sider, Content } = Layout;

export default function RiLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {logout} = useContext(UserContext);
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
          RI Dashboard
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={[
            {
              key: '/ri',
              
              icon: <HomeOutlined />,
              label: 'Home',
            },
            {
              key: '/ri/applications',
              icon: <FileTextOutlined />,
              label: 'All Applications',
            },
            {
              key: '/ri/pending',
              icon: <BarsOutlined />,
              label: 'Pending Applications',
            },
            {
              key: '/ri/ready_to_review',
              icon: <CalendarOutlined />,
              label: 'Ready to Review',
            },
            {
              key: '/ri/completed',
              icon: <CheckCircleOutlined />,
              label: 'Completed Applications',
            },
            {
              key: '/ri/reports',
              icon: <SnippetsOutlined/>,
              label: 'Reports',
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
