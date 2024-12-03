// Move the content from src/pages/ApplicationStatus.js to here
// Update imports to use relative paths
import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Steps,
  Timeline,
  Button,
  Input,
  message,
  Descriptions,
  Layout,
  Menu,
  Avatar,
  Typography
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  BarsOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import '../../../styles/Dashboard.css';

const { Step } = Steps;
const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const ApplicationStatus = () => {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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

  // Your existing application status logic here

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="logo">
          <Avatar size={48} icon={<UserOutlined />} />
        </div>
        <Menu
          theme="dark"
          selectedKeys={['application-status']}
          mode="inline"
          items={menuItems}
        />
        <Menu
          theme="dark"
          selectable={false}
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: logout,
            },
          ]}
          style={{ position: 'absolute', bottom: 0, width: '100%' }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ paddingTop: 15, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
            <Title level={4} style={{ margin: 0, flex: 1 }}>
              Application Status
            </Title>
            <BellOutlined style={{ fontSize: '20px', marginRight: '24px' }} />
            <Avatar icon={<UserOutlined />} />
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Card>
            <div style={{ display: 'flex', marginBottom: '24px' }}>
              <Input
                placeholder="Enter Application ID"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                style={{ marginRight: '16px' }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => {/* Your search logic */}}
                loading={loading}
              >
                Track
              </Button>
            </div>

            {application && (
              <>
                {/* Your application status display content */}
              </>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ApplicationStatus;
