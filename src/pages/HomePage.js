import React, { useContext, useState, useEffect } from 'react';
import { 
  Button, 
  Avatar, 
  Drawer, 
  Layout, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Modal, 
  Form, 
  Input, 
  Divider, 
  Menu, 
  Alert,
  SubMenu
} from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SafetyCertificateOutlined, 
  TeamOutlined, 
  FileProtectOutlined, 
  CheckCircleOutlined,
  HomeOutlined,
  AppstoreOutlined,
  PictureOutlined,
  DownloadOutlined,
  LinkOutlined,
  CustomerServiceOutlined,
  MailOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../components/userContext';
import axios from 'axios';
import Login from './Login';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const { token, logout } = useContext(UserContext);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState("");
  const [stats, setStats] = useState({
    totalApplications: 5234,
    certificatesIssued: 4891,
    processingTime: "2-3 days",
    userSatisfaction: "98%"
  });

  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(res.data.user);
      setRole(res.data.role);
    } catch (e) {
      console.error('Error fetching profile details:', e);
      setUserData(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleStartApplication = () => {
    if (token) {
      navigate('/application-form');
    } else {
      setLoginModalVisible(true);
    }
  };

  const navigationItems = [
    { 
      key: 'home', 
      icon: <HomeOutlined />, 
      label: 'Home', 
      path: '/' 
    },
    { 
      key: 'services', 
      icon: <AppstoreOutlined />, 
      label: 'Services', 
      subMenu: [
        { key: 'certificate-services', label: 'Certificate Services', path: '/services/certificates' },
        { key: 'application-tracking', label: 'Application Tracking', path: '/services/tracking' },
        { key: 'online-payment', label: 'Online Payment', path: '/services/payment' },
        { key: 'document-verification', label: 'Document Verification', path: '/services/verification' }
      ]
    },
    { 
      key: 'gallery', 
      icon: <PictureOutlined />, 
      label: 'Gallery', 
      subMenu: [
        { key: 'photo-gallery', label: 'Photo Gallery', path: '/gallery/photos' },
        { key: 'event-gallery', label: 'Event Gallery', path: '/gallery/events' },
        { key: 'achievement-gallery', label: 'Achievement Gallery', path: '/gallery/achievements' }
      ]
    },
    { 
      key: 'downloads', 
      icon: <DownloadOutlined />, 
      label: 'Downloads', 
      subMenu: [
        { key: 'forms', label: 'Application Forms', path: '/downloads/forms' },
        { key: 'guidelines', label: 'Guidelines', path: '/downloads/guidelines' },
        { key: 'brochures', label: 'Brochures', path: '/downloads/brochures' }
      ]
    },
    { 
      key: 'links', 
      icon: <LinkOutlined />, 
      label: 'Other Links', 
      subMenu: [
        { key: 'government-portals', label: 'Government Portals', path: '/links/government' },
        { key: 'related-departments', label: 'Related Departments', path: '/links/departments' },
        { key: 'useful-websites', label: 'Useful Websites', path: '/links/websites' }
      ]
    },
    { 
      key: 'grievance', 
      icon: <CustomerServiceOutlined />, 
      label: 'Grievance', 
      subMenu: [
        { key: 'file-complaint', label: 'File a Complaint', path: '/grievance/file' },
        { key: 'complaint-status', label: 'Complaint Status', path: '/grievance/status' },
        { key: 'faq', label: 'FAQ', path: '/grievance/faq' }
      ]
    },
    { 
      key: 'meeseva', 
      icon: <SafetyCertificateOutlined />, 
      label: 'MeeSeva Centres', 
      subMenu: [
        { key: 'centre-locator', label: 'Centre Locator', path: '/meeseva/locator' },
        { key: 'centre-services', label: 'Available Services', path: '/meeseva/services' },
        { key: 'centre-timings', label: 'Centre Timings', path: '/meeseva/timings' }
      ]
    },
    { 
      key: 'contact', 
      icon: <MailOutlined />, 
      label: 'Contact Us', 
      subMenu: [
        { key: 'contact-form', label: 'Contact Form', path: '/contactus' },
        { key: 'support-helpline', label: 'Support Helpline', path: '/contact/helpline' },
        { key: 'email-support', label: 'Email Support', path: '/contact/email' }
      ]
    }
  ];

  const alerts = [
    { 
      message: 'Important: New Online Certificate Application Process', 
      description: 'Simplified digital application process now available for all government certificates.',
      type: 'info',
      showIcon: true
    },
    { 
      message: 'System Maintenance', 
      description: 'Scheduled maintenance on 15th December, 2023. Minimal disruption expected.',
      type: 'warning',
      showIcon: true
    }
  ];

  const features = [
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: 'Secure Certification',
      description: 'End-to-end encrypted process ensuring your data safety'
    },
    {
      icon: <TeamOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: 'Multi-level Verification',
      description: 'Thorough verification by authorized officials'
    },
    {
      icon: <FileProtectOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      title: 'Digital Records',
      description: 'Easy access to your certificates anytime, anywhere'
    },
    {
      icon: <CheckCircleOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
      title: 'Quick Processing',
      description: 'Fast-tracked application processing system'
    }
  ];

  return (
    <Layout className="min-h-screen">
      {/* Navigation Bar */}
      <Header 
        className="fixed w-full z-10" 
        style={{ 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          padding: 0, 
          height: 'auto' 
        }}
      >
        <Row align="middle" justify="space-between" style={{ padding: '0 24px' }}>
          <Col>
            <Title level={3} style={{ margin: '16px 0', marginRight: '2rem' }}>
              <span style={{ 
                background: 'linear-gradient(to right, #1890ff, #722ed1)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>
                CertiTrack
              </span>
            </Title>
          </Col>
          <Col>
            <Menu 
              mode="horizontal" 
              defaultSelectedKeys={['home']} 
              style={{ 
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {navigationItems.map(item => (
                item.subMenu ? (
                  <Menu.SubMenu 
                    key={item.key} 
                    icon={item.icon}
                    title={item.label}
                    style={{ 
                      margin: '0 10px',
                      padding: '0 10px'
                    }}
                  >
                    {item.subMenu.map(subItem => (
                      <Menu.Item 
                        key={subItem.key}
                        onClick={() => navigate(subItem.path)}
                      >
                        {subItem.label}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item 
                    key={item.key} 
                    icon={item.icon}
                    onClick={() => navigate(item.path)}
                    style={{ 
                      margin: '0 10px',
                      padding: '0 10px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {item.label}
                  </Menu.Item>
                )
              ))}
            </Menu>
          </Col>
          <Col>
            <div className="flex justify-end">
              <Button
                icon={<UserOutlined />}
                onClick={() => setDrawerVisible(true)}
                shape="circle"
              />
            </div>
          </Col>
        </Row>
      </Header>

      {/* Alerts Section */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '64px', 
          width: '100%', 
          zIndex: 9, 
          background: '#f0f2f5', 
          height: '40px', 
          overflowY: 'hidden'
        }}
      >
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            message={alert.message}
            description={alert.description}
            type={alert.type}
            showIcon={alert.showIcon}
            closable
            style={{ 
              margin: '0',
              borderRadius: '0',
              borderBottom: '1px solid #e8e8e8' 
            }}
          />
        ))}
      </div>

      <Content style={{ marginTop: '120px' }}>
        {/* Hero Section */}
        <Row 
          className="relative min-h-[500px] flex items-center justify-center" 
          style={{ 
            background: 'linear-gradient(135deg, #E6F0FF 0%, #EDE7F6 100%)',
            padding: '2rem'
          }}
        >
          {/* Full width text content */}
          <Col xs={24}>
            <div className="text-left max-w-4xl mx-auto pl-8">
              <Title 
                level={2} 
                style={{ 
                  fontSize: '2.5rem', 
                  marginBottom: '1rem',
                  color: '#2c3e50'
                }}
              >
                Streamline Your Certification Process
              </Title>
              <Paragraph 
                style={{ 
                  fontSize: '1rem', 
                  marginBottom: '1.5rem',
                  color: '#34495e',
                  maxWidth: '600px'
                }}
              >
                Fast, secure, and efficient way to obtain your government certificates with minimal hassle and maximum transparency.
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                onClick={handleStartApplication}
                style={{ 
                  background: 'linear-gradient(to right, #1890ff, #722ed1)',
                  borderColor: 'transparent'
                }}
              >
                Start Application
              </Button>
            </div>
          </Col>
        </Row>

        {/* Statistics Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <Row gutter={[32, 32]} justify="center">
              <Col xs={12} sm={6}>
                <Statistic title="Total Applications" value={stats.totalApplications} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Certificates Issued" value={stats.certificatesIssued} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Processing Time" value={stats.processingTime} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="User Satisfaction" value={stats.userSatisfaction} />
              </Col>
            </Row>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <Title level={2} className="text-center mb-12">Why Choose CertiTrack?</Title>
            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card className="h-full text-center hover:shadow-lg transition-shadow">
                    <div className="mb-4">{feature.icon}</div>
                    <Title level={4}>{feature.title}</Title>
                    <Text type="secondary">{feature.description}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <div className="max-w-7xl mx-auto">
          <Row gutter={[32, 32]} justify="space-between" align="middle">
            <Col xs={24} md={8}>
              <Title level={4}>CertiTrack</Title>
              <Paragraph type="secondary">
                Streamlining certification processes for a better tomorrow
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <Text type="secondary">
                &copy; {new Date().getFullYear()} CertiTrack. All rights reserved.
              </Text>
            </Col>
            <Col xs={24} md={8}>
              <div className="flex justify-end space-x-4">
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/privacy">Privacy</Link>
              </div>
            </Col>
          </Row>
        </div>
      </Footer>

      {/* User Profile Drawer */}
      <Drawer
        title="User Profile"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {userData && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <Title level={4}>{userData.name}</Title>
                <Text type="secondary">{userData.email}</Text>
              </div>
            </div>
            <Divider />
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={logout} 
              block
            >
              Logout
            </Button>
          </div>
        )}
      </Drawer>

      {/* Login Modal */}
      <Modal
        title={null}
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
        width={400}
      >
        <Login />
      </Modal>
    </Layout>
  );
};

export default HomePage;
