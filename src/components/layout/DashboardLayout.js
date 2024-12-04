import React, { useState, useContext,useEffect } from 'react';
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Spin,
  Dropdown,
  Space,
  Divider,
  Badge
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  CaretDownOutlined,
  EditOutlined,
  BarsOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../userContext';
import axios from 'axios';
import '../../styles/Dashboard.css';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const DashboardLayout = ({ children, loading = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user, logout } = useContext(UserContext);
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
      key: 'reports',
      icon: <BarsOutlined />,
      label: 'Reports',
      onClick: () => navigate('/applicant/reports')
    }
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/applicant') return 'home';
    if (path === '/applicant/new-application') return 'new-application';
    if (path === '/applicant/applications') return 'my-applications';
    if (path === '/applicant/status') return 'application-status';
    if (path === '/applicant/reports') return 'reports';
    return '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <Avatar size={64} icon={<UserOutlined />} />
          </div>
          <Text strong style={{ display: 'block', textAlign: 'center' }}>
            {userData?.name || 'User Name'}
          </Text>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
            {userData?.email || 'user@example.com'}
          </Text>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'edit-profile',
      icon: <EditOutlined />,
      label: 'Edit Profile',
      onClick: () => navigate('/applicant/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/applicant/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

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
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          position: 'sticky', 
          top: 0, 
          zIndex: 1, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Title level={4} style={{ margin: 0 }}>CertiTrack</Title>
          <Space size="large">
            <Badge count={5}>
              <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <CaretDownOutlined />
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ 
          padding: '16px',
          background: '#fff',
          minHeight: 'calc(100vh - 64px)'
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <Spin size="large" />
            </div>
          ) : (
            children
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
