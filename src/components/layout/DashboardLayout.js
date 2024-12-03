import React, { useState, useContext, useEffect } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Spin,
  Button
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  BellOutlined,
  BarsOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../userContext';
import axios from 'axios';
import '../../styles/Dashboard.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const DashboardLayout = ({ children, loading = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(res.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [token]);

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/applicant')
    },
    {
      key: 'new-application',
      icon: <PlusCircleOutlined />,
      label: 'Create New Application',
      onClick: () => navigate('/applicant/new-application')
    },
    {
      key: 'my-applications',
      icon: <FileTextOutlined />,
      label: 'My Applications',
      onClick: () => navigate('/applicant/applications')
    },
    {
      key: 'application-status',
      icon: <FileSearchOutlined />,
      label: 'Application Status',
      onClick: () => navigate('/applicant/status')
    },
    {
      key: 'history',
      icon: <BarsOutlined />,
      label: 'History',
      onClick: () => navigate('/applicant/history')
    }
  ];

  const getCurrentMenuKey = () => {
    const path = location.pathname;
    if (path === '/applicant') return 'home';
    if (path === '/applicant/new-application') return 'new-application';
    if (path === '/applicant/applications') return 'my-applications';
    if (path === '/applicant/status') return 'application-status';
    if (path === '/applicant/history') return 'history';
    return '';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: '#F7F7F7',
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px',
          position: 'sticky',
          top: 0,
          background: '#F7F7F7',
          zIndex: 1
        }}>
          <Title level={3} className="certitrack-title" style={{ display: collapsed ? 'none' : 'block' }}>
            CertiTrack
          </Title>
        </div>
        <Menu
          className="custom-menu"
          mode="inline"
          selectedKeys={[getCurrentMenuKey()]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          gap: '16px',
          boxShadow: '0 2px 8px 0 rgba(29,35,41,.05)',
          position: 'fixed',
          right: 0,
          top: 0,
          left: collapsed ? 80 : 200,
          zIndex: 9,
          transition: 'all 0.2s'
        }}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '20px', color: '#4169E1' }} />}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#4169E1' }} />
            <span style={{ color: '#4169E1', fontWeight: 500 }}>
              {userData?.name || 'User'}
            </span>
          </div>
          <Button
            type="text"
            icon={<LogoutOutlined style={{ color: '#4169E1' }} />}
            onClick={logout}
          />
        </Header>
        <Content style={{ 
          margin: '24px', 
          marginTop: '88px', 
          minHeight: 280,
          overflow: 'auto',
          height: 'calc(100vh - 88px)',
          padding: '0 24px 24px'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
